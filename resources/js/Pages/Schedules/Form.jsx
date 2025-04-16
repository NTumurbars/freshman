import { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { Select, SelectItem, TextInput, Button } from '@tremor/react';
import { Clock, Info, Eye, Calendar, Video, MapPin } from 'lucide-react';
import Modal from '@/Components/UI/Modal';
import axios from 'axios';

export default function ScheduleForm({
    schedule = null,
    sections = [],
    rooms = [],
    submitLabel = 'Save Schedule',
    preselectedSectionId = null,
    onPreview = null,
    onNotification = null
}) {
    const { auth } = usePage().props;
    const school = auth.user.school;

    // Add debug output to understand the incoming schedule data
    console.log('ScheduleForm received data:', {
        hasSchedule: !!schedule,
        scheduleId: schedule?.id,
        section_id: schedule?.section_id,
        room_id: schedule?.room_id,
        sectionsCount: sections.length,
        roomsCount: rooms.length,
    });

    // Find initial section and room - do this synchronously before state initialization
    let initialSection = null;
    let initialRoom = null;

    if (schedule) {
        // Find section
        if (schedule.section_id && sections.length > 0) {
            initialSection = sections.find(s => s.id.toString() === schedule.section_id.toString()) || null;
            console.log('Found initial section:', initialSection);
        }

        // Find room
        if (schedule.room_id && rooms.length > 0) {
            initialRoom = rooms.find(r => r && r.id && r.id.toString() === schedule.room_id.toString()) || null;
            console.log('Found initial room:', initialRoom);
        }
    }

    // Initialize form with schedule data if available
    const { data, setData, post, put, processing, errors, delete: destroy } = useForm({
        section_id: schedule?.section_id || preselectedSectionId || '',
        room_id: schedule?.room_id || '',
        day_of_week: schedule?.day_of_week || '',
        start_time: schedule?.start_time ? schedule.start_time.substring(0, 5) : '',
        end_time: schedule?.end_time ? schedule.end_time.substring(0, 5) : '',
        location_type: schedule?.location_type || 'in-person',
        virtual_meeting_url: schedule?.virtual_meeting_url || '',
        meeting_pattern: schedule?.meeting_pattern || 'single',
        redirect_section: true,
    });

    const [isVirtual, setIsVirtual] = useState(data.location_type === 'virtual');
    const [selectedSection, setSelectedSection] = useState(initialSection);
    const [isEditingPattern, setIsEditingPattern] = useState(false);
    const [showCapacityPrompt, setShowCapacityPrompt] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(initialRoom);
    const [capacityMismatch, setCapacityMismatch] = useState(null);
    const [shouldUpdateCapacity, setShouldUpdateCapacity] = useState(false);
    const [initialized, setInitialized] = useState(!!initialSection || !!initialRoom);

    // Helper function for time calculations
    const timeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        try {
            const [hours, minutes] = timeStr.split(':').map(Number);
            return (hours * 60) + minutes;
        } catch (error) {
            console.error('Error converting time to minutes:', error);
            return 0;
        }
    };

    // Calculate room utilization percentage - exactly match backend logic
    const calculateUtilization = (schedules) => {
        // Handle various formats of schedules data
        if (!schedules) return 0;

        // Ensure we have an array of schedules
        let schedulesArray = schedules;
        if (!Array.isArray(schedulesArray)) {
            // If it's an object with data property (like from an API response)
            if (schedulesArray.data && Array.isArray(schedulesArray.data)) {
                schedulesArray = schedulesArray.data;
            } else {
                console.warn('Unexpected schedules format:', schedulesArray);
                return 0;
            }
        }

        // Constants matching backend calculation in RoomController
        const timeBlocksPerDay = 12; // 12 hours per day (8am-8pm)
        const daysPerWeek = 5; // Monday to Friday
        const maxPossibleSlots = timeBlocksPerDay * daysPerWeek;

        // Count the scheduled slots (each schedule counts as one slot)
        const scheduledSlots = schedulesArray.length;

        // Calculate utilization percentage
        return maxPossibleSlots > 0
            ? Math.round((scheduledSlots / maxPossibleSlots) * 100 * 10) / 10 // Match backend 1 decimal place
            : 0;
    };

    // Combined initialization effect that runs once to set both section and room
    useEffect(() => {
        if (!initialized && schedule) {
            setInitialized(true);
            console.log('Initial schedule data for initialization:', schedule);

            // Set selected section
            if (schedule.section_id) {
                const matchingSection = sections.find(s => s.id.toString() === schedule.section_id.toString());
                if (matchingSection) {
                    console.log('Found matching section:', matchingSection);
                    setSelectedSection(matchingSection);
                } else {
                    console.warn(`Could not find matching section with ID ${schedule.section_id} in sections list`);
                    // Additional debug to see what's in the sections array
                    console.log('Available section IDs:', sections.map(s => s.id.toString()));
                }
            }

            // Set selected room
            if (schedule.room_id) {
                const matchingRoom = rooms.find(r => r.id && r.id.toString() === schedule.room_id.toString());
                if (matchingRoom) {
                    console.log('Found matching room:', matchingRoom);
                    setSelectedRoom(matchingRoom);

                    // Force set the room_id in the form data
                    console.log('Setting room_id in form data to:', schedule.room_id.toString());
                    setData('room_id', schedule.room_id.toString());
                } else {
                    console.warn(`Could not find matching room with ID ${schedule.room_id} in rooms list`);
                    // Additional debug to see what's in the rooms array
                    console.log('Available room IDs:', rooms.map(r => r?.id?.toString()).filter(Boolean));
                }
            }
        }
    }, [schedule, sections, rooms, initialized]);

    // Add a debug useEffect to track form data changes
    useEffect(() => {
        console.log('Form data changed:', {
            section_id: data.section_id,
            room_id: data.room_id
        });
    }, [data.section_id, data.room_id]);

    // These effects handle changes to the form data
    useEffect(() => {
        if (data.section_id && sections.length > 0) {
            const section = sections.find(s => s.id.toString() === data.section_id.toString());
            if (section) {
                setSelectedSection(section);
                console.log('Section changed via data change to:', section.id);
            }
        }
    }, [data.section_id, sections]);

    useEffect(() => {
        if (data.room_id && rooms.length > 0) {
            const room = rooms.find(r => r && r.id && r.id.toString() === data.room_id.toString());
            if (room) {
                setSelectedRoom(room);
                console.log('Room changed via data change to:', room.id);
            } else {
                setSelectedRoom(null);
            }
        } else {
            setSelectedRoom(null);
        }
    }, [data.room_id, rooms]);

    useEffect(() => {
        if (data.location_type === 'virtual') {
            setIsVirtual(true);
        } else {
            setIsVirtual(false);
        }
    }, [data.location_type]);

    // Set default day_of_week when initializing
    useEffect(() => {
        try {
            // Set default day of week if it's empty
            if (!data.day_of_week && data.meeting_pattern === 'single') {
                setData('day_of_week', 'Monday');
            }

            // If preview callback is provided, send initial data
            if (onPreview && data.section_id && data.start_time && data.end_time) {
                handlePreview();
            }
        } catch (error) {
            console.error('Error in initial useEffect:', error);
        }
    }, []);

    // Update day of week when meeting pattern changes
    useEffect(() => {
        try {
            // When switching to single pattern, ensure a day is selected
            if (data.meeting_pattern === 'single' && !data.day_of_week) {
                setData('day_of_week', 'Monday');
            }

            // Update preview when relevant data changes
            if (onPreview && data.section_id && data.start_time && data.end_time) {
                handlePreview();
            }
        } catch (error) {
            console.error('Error in pattern change useEffect:', error);
        }
    }, [data.meeting_pattern, data.day_of_week, data.start_time, data.end_time, data.location_type, data.room_id, data.section_id]);

    // Check capacity mismatch when either section or room changes
    useEffect(() => {
        if (selectedRoom && selectedSection && selectedSection.capacity) {
            console.log('Checking capacity mismatch between section and room');
            if (selectedRoom.capacity < selectedSection.capacity) {
                setCapacityMismatch({
                    type: 'warning',
                    message: `This room's capacity (${selectedRoom.capacity}) is less than the section's capacity (${selectedSection.capacity}).`
                });
            } else if (selectedRoom.capacity > selectedSection.capacity) {
                setCapacityMismatch({
                    type: 'prompt',
                    message: `This room's capacity (${selectedRoom.capacity}) is greater than the section's capacity (${selectedSection.capacity}).`
                });
            } else {
                setCapacityMismatch(null);
            }
        } else {
            setCapacityMismatch(null);
        }
    }, [selectedRoom, selectedSection]);

    // When handling meeting_pattern changes while editing:
    const handleChange = (field, value) => {
        // Add debug logging
        console.log(`Field ${field} changing to:`, value);

        // Special handling for location_type...
        if (field === 'location_type') {
            if (value === 'in_person') {
                value = 'in-person';
            }
        }

        // When changing time or meeting pattern, check if selected room still works
        if ((field === 'start_time' || field === 'end_time' || field === 'day_of_week' || field === 'meeting_pattern')
            && data.room_id && value) {

            // Update data first
            setData(field, value);

            // Then check if the selected room now has conflicts
            const newData = { ...data, [field]: value };
            const selectedRoom = rooms.find(r => r && r.id && r.id.toString() === data.room_id.toString());

            if (selectedRoom && newData.start_time && newData.end_time && selectedRoom.schedules) {
                // Get days to check based on meeting pattern
                let daysToCheck = [newData.day_of_week || 'Monday'];
                try {
                    if (newData.meeting_pattern && newData.meeting_pattern !== 'single') {
                        daysToCheck = getDaysFromPattern(newData.meeting_pattern) || daysToCheck;
                    }
                } catch (error) {
                    console.error('Error getting days from pattern:', error);
                }

                // Check for conflicts
                let hasConflict = false;
                daysToCheck.forEach(day => {
                    if (!day) return;

                    const daySchedules = selectedRoom.schedules.filter(s => s && s.day_of_week === day) || [];

                    // Skip the current schedule being edited
                    const schedulesToCheck = schedule?.id ?
                        daySchedules.filter(s => s && s.id !== schedule.id) :
                        daySchedules;

                    schedulesToCheck.forEach(s => {
                        if (s && s.start_time && s.end_time &&
                            hasTimeConflict(s.start_time, s.end_time, newData.start_time, newData.end_time)) {
                            hasConflict = true;
                        }
                    });
                });

                // If there's a conflict, reset the room selection
                if (hasConflict) {
                    setData('room_id', '');
                    setSelectedRoom(null);
                    setCapacityMismatch(null);
                    setShouldUpdateCapacity(false);

                    // Show alert about the conflict
                    alert('The previously selected room is no longer available at the selected times. Please choose a different room.');
                }
            }

            return;
        }

        if (field === 'section_id' && value) {
            // Find the section object
            const section = sections.find(s => s.id.toString() === value.toString());
            console.log('Setting selected section to:', section);
            setSelectedSection(section);

            // Update the form data
            setData('section_id', value);

            // Check for capacity mismatch if room is already selected
            if (selectedRoom && section && section.capacity) {
                if (selectedRoom.capacity < section.capacity) {
                    // Room capacity is less than section capacity - show warning
                    setCapacityMismatch({
                        type: 'warning',
                        message: `This room's capacity (${selectedRoom.capacity}) is less than the section's capacity (${section.capacity}).`
                    });
                } else if (selectedRoom.capacity > section.capacity) {
                    // Room capacity is more than section capacity - show prompt
                    setCapacityMismatch({
                        type: 'prompt',
                        message: `This room's capacity (${selectedRoom.capacity}) is greater than the section's capacity (${section.capacity}).`
                    });
                } else {
                    // Capacities match
                    setCapacityMismatch(null);
                }
            }

            return;
        }

        if (field === 'room_id' && value) {
            // Find the room object
            const room = rooms.find(r => r && r.id && r.id.toString() === value.toString());
            console.log('Setting selected room to:', room);
            setSelectedRoom(room);

            // Update the form data
            setData('room_id', value);

            // Check capacity mismatch if a section is selected and has capacity
            if (selectedSection && selectedSection.capacity && room) {
                if (room.capacity < selectedSection.capacity) {
                    // Room capacity is less than section capacity - show warning
                    setCapacityMismatch({
                        type: 'warning',
                        message: `This room's capacity (${room.capacity}) is less than the section's capacity (${selectedSection.capacity}).`
                    });
                    setShouldUpdateCapacity(false);
                    setData('update_section_capacity', false);
                    setData('new_capacity', null);
                } else if (room.capacity > selectedSection.capacity) {
                    // Room capacity is more than section capacity - show prompt
                    setCapacityMismatch({
                        type: 'prompt',
                        message: `This room's capacity (${room.capacity}) is greater than the section's capacity (${selectedSection.capacity}).`
                    });
                    setShowCapacityPrompt(true);

                    // If checkbox was already checked, update the new capacity to match new room
                    if (shouldUpdateCapacity) {
                        setData('new_capacity', Number(room.capacity));
                    }
                } else {
                    // Capacities match
                    setCapacityMismatch(null);
                    setShouldUpdateCapacity(false);
                    setData('update_section_capacity', false);
                    setData('new_capacity', null);
                }
            } else {
                setCapacityMismatch(null);
                setShouldUpdateCapacity(false);
                setData('update_section_capacity', false);
                setData('new_capacity', null);
            }

            return;
        } else if (field === 'room_id' && !value) {
            // If clearing room selection
            setSelectedRoom(null);
            setData('room_id', '');
            setCapacityMismatch(null);
            setShouldUpdateCapacity(false);
            setData('update_section_capacity', false);
            setData('new_capacity', null);
            return;
        }

        if (field === 'meeting_pattern') {
            console.log('Changing meeting pattern to:', value);
            setData('meeting_pattern', value);

            if (value !== 'single') {
                try {
                    const daysFromPattern = getDaysFromPattern(value);
                    console.log(`Pattern ${value} will generate days:`, daysFromPattern);
                } catch (error) {
                    console.error('Error getting days from pattern:', error);
                }
            } else {
                if (!data.day_of_week) {
                    setData('day_of_week', 'Monday');
                }
            }

            if (schedule) {
                setIsEditingPattern(true);
            }
            return;
        }

        // For all other fields, just update the form data
        setData(field, value);
    };

    // Preview function to send current schedule data to parent component
    const handlePreview = () => {
        try {
            if (!onPreview || !data.section_id || !data.start_time || !data.end_time) {
                return;
            }

            // Find the selected section
            const section = sections.find(s => s.id.toString() === data.section_id.toString());
            let room = null;
            if (data.room_id) {
                room = rooms.find(r => r.id.toString() === data.room_id.toString());
            }

            // Create a preview schedule object
            const previewSchedule = {
                ...data,
                section: section,
                room: room,
                start_time: ensureTimeFormat(data.start_time),
                end_time: ensureTimeFormat(data.end_time),
            };

            // If pattern is selected, create preview days
            if (data.meeting_pattern && data.meeting_pattern !== 'single') {
                const days = getDaysFromPattern(data.meeting_pattern);
                previewSchedule.days_of_week = days && days.length > 0 ? days : [data.day_of_week || 'Monday'];
            } else {
                previewSchedule.days_of_week = [data.day_of_week || 'Monday'];
            }

            // Send to parent component
            onPreview(previewSchedule);
        } catch (error) {
            console.error('Error in handlePreview:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!data.section_id) {
            alert('Please select a section first');
            return;
        }

        // Basic validation for required fields
        if (!data.start_time || !data.end_time) {
            alert('Please enter both start and end times');
            return;
        }

        if ((data.location_type === 'in-person' || data.location_type === 'hybrid') && !data.room_id) {
            alert('Please select a room for in-person or hybrid classes');
            return;
        }

        if ((data.location_type === 'virtual' || data.location_type === 'hybrid') && !data.virtual_meeting_url) {
            alert('Please enter a virtual meeting URL for virtual or hybrid classes');
            return;
        }

        // Check if we're editing a schedule and keeping the same room
        const isKeepingSameRoom = schedule && schedule.room_id && data.room_id.toString() === schedule.room_id.toString();

        // Skip room conflict check if we're editing and keeping the same room, day and have similar times
        const isSimilarTime = schedule && data.start_time && data.end_time &&
            schedule.start_time && schedule.end_time &&
            Math.abs(timeToMinutes(data.start_time) - timeToMinutes(schedule.start_time.substring(0, 5))) < 15 &&
            Math.abs(timeToMinutes(data.end_time) - timeToMinutes(schedule.end_time.substring(0, 5))) < 15;

        const isSameDay = schedule && schedule.day_of_week === data.day_of_week;

        // Skip room conflict check if this is the same room, same day and similar time as the original schedule
        const skipConflictCheck = isKeepingSameRoom && isSameDay && isSimilarTime;

        console.log('Submit conflict check params:', {
            isEditing: !!schedule,
            isKeepingSameRoom,
            isSameDay,
            isSimilarTime,
            skipConflictCheck,
            scheduleStartTime: schedule?.start_time,
            dataStartTime: data.start_time,
            scheduleEndTime: schedule?.end_time,
            dataEndTime: data.end_time
        });

        // Final check for room conflicts before submitting
        if (!skipConflictCheck && data.room_id && data.start_time && data.end_time) {
            const selectedRoom = rooms.find(r => r && r.id && r.id.toString() === data.room_id.toString());

            if (selectedRoom && selectedRoom.schedules) {
                // Get days to check based on meeting pattern
                let daysToCheck = [data.day_of_week || 'Monday'];
                try {
                    if (data.meeting_pattern && data.meeting_pattern !== 'single') {
                        daysToCheck = getDaysFromPattern(data.meeting_pattern) || daysToCheck;
                    }
                } catch (error) {
                    console.error('Error getting days from pattern:', error);
                }

                // Check for conflicts
                let hasConflict = false;
                let conflictDetails = [];

                daysToCheck.forEach(day => {
                    if (!day) return;

                    const daySchedules = selectedRoom.schedules.filter(s => s && s.day_of_week === day) || [];

                    // Skip the current schedule being edited - ensure we're using string comparison
                    const schedulesToCheck = schedule?.id ?
                        daySchedules.filter(s => s && s.id && s.id.toString() !== schedule.id.toString()) :
                        daySchedules;

                    schedulesToCheck.forEach(s => {
                        if (s && s.start_time && s.end_time &&
                            hasTimeConflict(s.start_time, s.end_time, data.start_time, data.end_time)) {
                            hasConflict = true;
                            const section = s.section?.course?.title || 'Unknown course';
                            const time = `${s.start_time}-${s.end_time}`;
                            conflictDetails.push(`${section} on ${day} at ${time}`);
                        }
                    });
                });

                if (hasConflict) {
                    alert(`Cannot save schedule due to room conflicts:\n${conflictDetails.join('\n')}`);
                    return;
                }
            }
        }

        // Check if there's a capacity warning to acknowledge
        if (capacityMismatch && capacityMismatch.type === 'warning' &&
            !confirm('The selected room has less capacity than the section requires. Continue anyway?')) {
            return;
        }

        // Include capacity update if user chose to update it
        const finalData = { ...data };

        // Debug logging for the capacity update
        console.log('Before capacity update check:', {
            shouldUpdateCapacity,
            hasSelectedRoom: !!selectedRoom,
            selectedRoomCapacity: selectedRoom?.capacity,
            hasSelectedSection: !!selectedSection,
            selectedSectionCapacity: selectedSection?.capacity
        });

        if (shouldUpdateCapacity && selectedRoom && selectedSection) {
            // Explicitly set as boolean true, not as string
            finalData.update_section_capacity = true;
            finalData.new_capacity = Number(selectedRoom.capacity);

            // More explicit logging
            console.log('Will update section capacity:', {
                update_section_capacity: true,
                section_id: selectedSection.id,
                new_capacity: Number(selectedRoom.capacity),
                from: selectedSection.capacity,
                to: selectedRoom.capacity
            });
        } else {
            // Explicitly set as boolean false, not as string
            finalData.update_section_capacity = false;
            finalData.new_capacity = null;

            console.log('Not updating section capacity');
        }

        try {
            // If editing an existing schedule with pattern change, handle pattern change
            if (schedule && isEditingPattern) {
                console.log('Changing schedule pattern to:', data.meeting_pattern);
                await createSchedulesWithPattern(finalData);
                return;
            }

            // For normal editing (not changing pattern)
            if (schedule && !isEditingPattern) {
                console.log('Updating schedule with data:', finalData);
                console.log('Should update capacity:', shouldUpdateCapacity);
                console.log('Form data update_section_capacity:', data.update_section_capacity);

                // Check if we're editing a schedule with the same room
                const isKeepingSameRoom = schedule && schedule.room_id &&
                    finalData.room_id.toString() === schedule.room_id.toString();

                console.log('Edit params:', {
                    isKeepingSameRoom,
                    scheduleRoomId: schedule.room_id,
                    finalDataRoomId: finalData.room_id,
                    scheduleDay: schedule.day_of_week,
                    finalDataDay: finalData.day_of_week,
                });

                // Create a new object for the submission that explicitly includes all needed fields
                const submissionData = {
                    ...data,
                    update_section_capacity: shouldUpdateCapacity, // Use the checkbox state directly
                    new_capacity: shouldUpdateCapacity && selectedRoom ? Number(selectedRoom.capacity) : null,
                    is_keeping_same_room: isKeepingSameRoom,
                    bypass_conflict_check_for_same_room: isKeepingSameRoom,
                    original_schedule_id: schedule.id
                };

                console.log('Final submission data:', submissionData);
                await put(route('schedules.update', [school.id, schedule.id]), submissionData);

                if (data.redirect_section) {
                    window.location.href = route('sections.show', [school.id, data.section_id]);
                }
                return;
            }

            // For new schedules (creating, not editing)
            console.log('Creating new schedule with data:', finalData);
            await createSchedulesWithPattern(finalData);

        } catch (error) {
            console.error('Error in schedule creation/update:', error);
            alert('Error: ' + (error.response?.data?.message || error.message || 'Unknown error occurred'));
        }
    };

    // Helper function to create schedules based on pattern
    const createSchedulesWithPattern = async (formData) => {
        try {
            // Ensure update_section_capacity is properly formatted in all cases
            console.log('Pattern creation with should update capacity:', {
                shouldUpdateCapacity,
                update_section_capacity: formData.update_section_capacity,
                new_capacity: formData.new_capacity
            });

            // Check if we're editing a schedule with the same room, day and similar time
            // This allows us to bypass conflict checks when appropriate
            const isKeepingSameRoom = schedule && schedule.room_id && formData.room_id.toString() === schedule.room_id.toString();
            const isEditingPattern = schedule && formData.meeting_pattern !== 'single';

            // For editing pattern, include this info in API call
            const apiData = {
                ...formData,
                is_keeping_same_room: isKeepingSameRoom,
                is_editing_existing: !!schedule,
                bypass_conflict_check_for_same_room: isKeepingSameRoom,
                original_schedule_id: schedule ? schedule.id : null
            };

            // For single schedule patterns
            if (formData.meeting_pattern === 'single') {
                console.log('Creating single schedule for day:', formData.day_of_week);
                const finalData = {
                    ...apiData,
                    meeting_pattern: 'single', // Ensure it's set to single
                    update_section_capacity: Boolean(formData.update_section_capacity),
                    new_capacity: formData.new_capacity ? Number(formData.new_capacity) : null
                };

                console.log('Single schedule final data:', finalData);
                await post(route('schedules.store', school.id), finalData);

                if (formData.redirect_section) {
                    window.location.href = route('sections.show', [school.id, formData.section_id]);
                } else {
                    window.location.reload();
                }
                return;
            }

            // For multi-day patterns, use the batch endpoint
            console.log(`Creating schedules for pattern "${formData.meeting_pattern}" using batch endpoint`);

            // Ensure update_section_capacity is properly formatted for batch endpoint
            const batchData = {
                ...apiData,
                update_section_capacity: Boolean(formData.update_section_capacity),
                new_capacity: formData.new_capacity ? Number(formData.new_capacity) : null
            };

            console.log('Batch endpoint final data:', batchData);

            try {
                // Use the dedicated batch endpoint that handles multiple days at once
                const response = await axios.post(route('schedules.store-batch', school.id), batchData);
                console.log('Batch creation response:', response.data);

                if (response.data && response.data.success) {
                    console.log(`Successfully created ${response.data.created_count} schedules`);

                    if (formData.redirect_section) {
                        window.location.href = route('sections.show', [school.id, formData.section_id]);
                    } else {
                        window.location.reload();
                    }
                } else {
                    const errorMsg = response.data?.errors?.length
                        ? `Created ${response.data.created_count} schedules, but encountered errors: ${response.data.errors.join('; ')}`
                        : 'Failed to create schedules';
                    alert(errorMsg);
                    console.error('Batch creation errors:', response.data?.errors);
                }
            } catch (error) {
                console.error('Error with batch creation:', error);
                alert('Error creating schedules: ' + (error.response?.data?.message || error.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error in schedule creation:', error);
            alert('Error creating schedules: ' + (error.response?.data?.message || error.message || 'Unknown error'));
        }

        // Reset editing state
        if (isEditingPattern) {
            setIsEditingPattern(false);
        }
    };

    // Helper function to ensure time has seconds
    const ensureTimeFormat = (time) => {
        if (!time) return '';
        if (time.length === 5) return time + ':00';
        return time;
    };

    const daysOfWeek = [
        'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday', 'Sunday'
    ];

    const locationTypes = [
        { value: 'in-person', label: 'In Person' },
        { value: 'virtual', label: 'Virtual' },
        { value: 'hybrid', label: 'Hybrid' }
    ];

    const meetingPatterns = [
        { value: 'single', label: 'Single Meeting' },
        { value: 'monday-wednesday-friday', label: 'Monday/Wednesday/Friday' },
        { value: 'tuesday-thursday', label: 'Tuesday/Thursday' },
        { value: 'monday-wednesday', label: 'Monday/Wednesday' },
        { value: 'tuesday-friday', label: 'Tuesday/Friday' },
        { value: 'weekly', label: 'Weekly (Mon-Fri)' }
    ];

    // Helper function to get days from meeting pattern
    const getDaysFromPattern = (pattern) => {
        const patternMap = {
            'monday-wednesday-friday': ['Monday', 'Wednesday', 'Friday'],
            'tuesday-thursday': ['Tuesday', 'Thursday'],
            'monday-wednesday': ['Monday', 'Wednesday'],
            'tuesday-friday': ['Tuesday', 'Friday'],
            'weekly': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            'single': []
        };

        return patternMap[pattern] || [];
    };

    const getPatternLabel = (value) => {
        const pattern = meetingPatterns.find(p => p.value === value);
        return pattern ? pattern.label : value;
    };

    // Add this function after getDaysFromPattern
    const hasTimeConflict = (existingStart, existingEnd, newStart, newEnd) => {
        // Validate inputs
        if (!existingStart || !existingEnd || !newStart || !newEnd) {
            return false; // Can't determine conflict with missing times
        }

        try {
            // Convert time strings to comparable values (minutes since midnight)
            const timeToMinutes = (timeStr) => {
                if (!timeStr || typeof timeStr !== 'string') return 0;
                const parts = timeStr.split(':');
                if (parts.length < 2) return 0;

                const hours = parseInt(parts[0]) || 0;
                const minutes = parseInt(parts[1]) || 0;
                return hours * 60 + minutes;
            };

            // Convert times to minutes
            const existingStartMins = timeToMinutes(existingStart);
            const existingEndMins = timeToMinutes(existingEnd);
            const newStartMins = timeToMinutes(newStart);
            const newEndMins = timeToMinutes(newEnd);

            // Check for overlap
            return (
                (newStartMins < existingEndMins && newEndMins > existingStartMins) ||
                (existingStartMins < newEndMins && existingEndMins > newStartMins)
            );
        } catch (error) {
            console.error('Error in hasTimeConflict:', error);
            return false; // Assume no conflict if there's an error
        }
    };

    // Calculate utilization percentage
    const utilizationPercent = calculateUtilization(selectedRoom?.schedules);

    // Determine color based on utilization
    let utilizationColor;
    if (utilizationPercent < 20) {
        utilizationColor = 'text-green-600';
    } else if (utilizationPercent < 60) {
        utilizationColor = 'text-amber-600';
    } else {
        utilizationColor = 'text-red-600';
    }

    const buildingName = selectedRoom?.floor?.building?.name || 'Unknown Building';
    const roomNumber = selectedRoom?.room_number || 'Unknown';
    const capacity = selectedRoom?.capacity || 'Unknown';

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <h2 className="text-blue-800 font-medium mb-2">Schedule Details</h2>
                <p className="text-sm text-blue-700">Set the time, location, and pattern for this class session</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section Selection */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-gray-800 font-medium mb-4">Class Information</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Section <span className="text-red-500">*</span>
                        </label>
                        <Select
                            value={data.section_id ? data.section_id.toString() : ''}
                            onValueChange={(value) => {
                                console.log('Section dropdown changed to:', value);
                                handleChange('section_id', value);
                            }}
                            placeholder="Select Section"
                            className={errors.section_id ? 'border-red-500' : ''}
                            disabled={preselectedSectionId}
                        >
                            {sections.map((section) => (
                                <SelectItem key={section.id.toString()} value={section.id.toString()}>
                                    {section.course?.code} - {section.section_code} ({section.course?.title})
                                </SelectItem>
                            ))}
                        </Select>
                        {errors.section_id && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.section_id}
                            </div>
                        )}
                    </div>
                </div>

                {/* Schedule Pattern */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                        <h3 className="text-gray-800 font-medium">Meeting Pattern</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Pattern
                            </label>
                            <Select
                                value={data.meeting_pattern}
                                onValueChange={(value) => handleChange('meeting_pattern', value)}
                                placeholder="Select Pattern"
                            >
                                <SelectItem value="single">Single Meeting</SelectItem>
                                <SelectItem value="monday-wednesday-friday">Monday/Wednesday/Friday</SelectItem>
                                <SelectItem value="tuesday-thursday">Tuesday/Thursday</SelectItem>
                                <SelectItem value="monday-wednesday">Monday/Wednesday</SelectItem>
                                <SelectItem value="tuesday-friday">Tuesday/Friday</SelectItem>
                                <SelectItem value="weekly">Weekly (Mon-Fri)</SelectItem>
                            </Select>
                        </div>

                        {data.meeting_pattern === 'single' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Day of Week <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    value={data.day_of_week}
                                    onValueChange={(value) => handleChange('day_of_week', value)}
                                    placeholder="Select Day"
                                >
                                    <SelectItem value="Monday">Monday</SelectItem>
                                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                                    <SelectItem value="Thursday">Thursday</SelectItem>
                                    <SelectItem value="Friday">Friday</SelectItem>
                                    <SelectItem value="Saturday">Saturday</SelectItem>
                                    <SelectItem value="Sunday">Sunday</SelectItem>
                                </Select>
                                {errors.day_of_week && (
                                    <div className="mt-1 text-sm text-red-600">
                                        {errors.day_of_week}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {data.meeting_pattern !== 'single' && (
                        <div className="mt-2 flex items-center text-sm text-blue-600 bg-blue-50 p-2 rounded">
                            <Info className="h-4 w-4 mr-2" />
                            <span>This will create recurring meetings on {data.meeting_pattern.replace(/-/g, ', ')}.</span>
                        </div>
                    )}
                </div>

                {/* Time Information */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center mb-4">
                        <Clock className="h-5 w-5 text-gray-600 mr-2" />
                        <h3 className="text-gray-800 font-medium">Time</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                value={data.start_time}
                                onChange={(e) => handleChange('start_time', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                            {errors.start_time && (
                                <div className="mt-1 text-sm text-red-600">
                                    {errors.start_time}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Time <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="time"
                                value={data.end_time}
                                onChange={(e) => handleChange('end_time', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                            {errors.end_time && (
                                <div className="mt-1 text-sm text-red-600">
                                    {errors.end_time}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Location Information */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center mb-4">
                        <MapPin className="h-5 w-5 text-gray-600 mr-2" />
                        <h3 className="text-gray-800 font-medium">Location</h3>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location Type
                        </label>
                        <Select
                            value={data.location_type}
                            onValueChange={(value) => handleChange('location_type', value)}
                            placeholder="Select Location Type"
                        >
                            <SelectItem value="in-person">In Person</SelectItem>
                            <SelectItem value="virtual">Virtual</SelectItem>
                            <SelectItem value="hybrid">Hybrid</SelectItem>
                        </Select>
                    </div>

                    {(data.location_type === 'in-person' || data.location_type === 'hybrid') && (
                        <div className="mb-4">
                            <label htmlFor="room_id" className="mb-1 block font-medium text-gray-700">
                                Room <span className="text-red-500">*</span>
                            </label>
                            <Select
                                id="room_id"
                                value={data.room_id ? data.room_id.toString() : ''}
                                onValueChange={(value) => {
                                    console.log('Room dropdown changed to:', value);
                                    handleChange('room_id', value);
                                }}
                                placeholder="Select Room"
                                className={errors.room_id ? 'border-red-500' : ''}
                            >
                                {(() => {
                                    // Create an array to hold available rooms after filtering
                                    const availableRooms = [];

                                    // Track if we've added the current room
                                    let hasAddedCurrentRoom = false;

                                    // Process all rooms for conflicts
                                    rooms.filter(room => room && room.id).forEach(room => {
                                        if (!room) return;

                                        // Check if this is the current room in the schedule being edited
                                        const isCurrentRoom = schedule && schedule.room_id &&
                                            room.id.toString() === schedule.room_id.toString();

                                        if (isCurrentRoom) {
                                            console.log('Including currently assigned room in dropdown:', room.room_number);
                                            hasAddedCurrentRoom = true;

                                            // Always add the current room, regardless of conflicts
                                            availableRooms.push({
                                                ...room,
                                                dayToCheck: data.day_of_week || 'Monday',
                                                isCurrentRoom: true
                                            });

                                            // Don't skip the conflict check - we'll check anyway to log if there are conflicts
                                        }

                                        const dayToCheck = data.day_of_week || 'Monday';

                                        // Get all days we need to check for conflicts based on meeting pattern
                                        let daysToCheck = [dayToCheck];
                                        if (data.meeting_pattern && data.meeting_pattern !== 'single') {
                                            try {
                                                daysToCheck = getDaysFromPattern(data.meeting_pattern) || [dayToCheck];
                                            } catch (error) {
                                                console.error('Error getting days from pattern:', error);
                                                daysToCheck = [dayToCheck];
                                            }
                                        }

                                        // Check if this room has any schedule conflicts for the selected time and days
                                        let hasConflict = false;

                                        if (data.start_time && data.end_time && room.schedules) {
                                            // Look for conflicts on any of the relevant days
                                            daysToCheck.forEach(day => {
                                                if (hasConflict) return; // Skip if we already found a conflict

                                                const daySchedules = room.schedules?.filter(s => s && s.day_of_week === day) || [];

                                                // Skip the current schedule being edited
                                                const schedulesToCheck = schedule?.id ?
                                                    daySchedules.filter(s => s && s.id && s.id.toString() !== schedule.id.toString()) :
                                                    daySchedules;

                                                // Check each schedule for time conflicts
                                                schedulesToCheck.forEach(s => {
                                                    if (s && s.start_time && s.end_time &&
                                                        hasTimeConflict(s.start_time, s.end_time, data.start_time, data.end_time)) {
                                                        hasConflict = true;

                                                        if (isCurrentRoom) {
                                                            console.log('Current room has conflicts but including anyway:',
                                                                `Schedule ID: ${s.id}, Time: ${s.start_time}-${s.end_time}`);
                                                        }
                                                    }
                                                });
                                            });
                                        }

                                        // Skip this room if it has a conflict and it's not the current room
                                        if (hasConflict && !isCurrentRoom) return;

                                        // Add to available rooms if no conflict or if it's the current room
                                        if (!isCurrentRoom) { // Don't add the current room twice
                                            availableRooms.push({
                                                ...room,
                                                dayToCheck
                                            });
                                        }
                                    });

                                    // Debug log for room selection troubleshooting
                                    console.log('Schedule room_id:', schedule?.room_id);
                                    console.log('Current room added to dropdown:', hasAddedCurrentRoom);
                                    console.log('Available rooms:', availableRooms.map(r => ({
                                        id: r.id,
                                        room_number: r.room_number,
                                        isCurrentRoom: r.isCurrentRoom || false
                                    })));

                                    // If no rooms available after filtering, show a message
                                    if (availableRooms.length === 0) {
                                        return (
                                            <SelectItem value="no-rooms">
                                                {!data.start_time || !data.end_time
                                                    ? "Enter start and end times to see available rooms"
                                                    : "No rooms available for selected time"}
                                            </SelectItem>
                                        );
                                    }

                                    // Return all available rooms
                                    return availableRooms.map(room => {
                                        // Calculate utilization percentage exactly like the backend
                                        // Each schedule counts as one slot out of 60 possible slots (12 hours * 5 days)
                                        const utilizationPercent = calculateUtilization(room.schedules);

                                        console.log(`Room ${room.room_number} schedules:`, room.schedules, 'utilization:', utilizationPercent);

                                        // Determine color based on utilization
                                        let utilizationColor;
                                        if (utilizationPercent < 20) {
                                            utilizationColor = 'text-green-600';
                                        } else if (utilizationPercent < 60) {
                                            utilizationColor = 'text-amber-600';
                                        } else {
                                            utilizationColor = 'text-red-600';
                                        }

                                        // Format building and room info
                                        const buildingName = room.floor?.building?.name || 'Unknown Building';
                                        const roomNumber = room.room_number || 'Unknown';
                                        const capacity = room.capacity || 'Unknown';

                                        // Create a simple text representation with utilization percentage
                                        return (
                                            <SelectItem key={room.id.toString()} value={room.id.toString()}>
                                                <div className={`flex justify-between items-center w-full ${room.isCurrentRoom ? 'font-bold' : ''}`}>
                                                    <span>
                                                        {room.isCurrentRoom ? '✓ ' : ''}{`${buildingName} - Room ${roomNumber} (Capacity: ${capacity})`}
                                                        {room.isCurrentRoom ? ' (current)' : ''}
                                                    </span>
                                                    <span className={utilizationColor}>{utilizationPercent}% utilized</span>
                                                </div>
                                            </SelectItem>
                                        );
                                    });
                                })()}
                            </Select>
                            {errors.room_id && (
                                <p className="mt-1 text-sm text-red-500">{errors.room_id}</p>
                            )}

                            {!data.start_time || !data.end_time ? (
                                <div className="mt-1 text-sm text-blue-600 bg-blue-50 p-2 rounded">
                                    <span className="font-medium">Note:</span> Enter start and end times to see available rooms.
                                </div>
                            ) : null}

                            {capacityMismatch && capacityMismatch.type === 'warning' && (
                                <div className="mt-1 text-sm text-red-600 bg-red-50 p-2 rounded">
                                    <span className="font-medium">Warning:</span> {capacityMismatch.message}
                                </div>
                            )}
                            {capacityMismatch && capacityMismatch.type === 'prompt' && (
                                <div className="mt-1 text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                                    <span className="font-medium">Note:</span> {capacityMismatch.message}
                                    <div className="mt-1">
                                        <label className="inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                checked={shouldUpdateCapacity}
                                                onChange={(e) => {
                                                    console.log('Checkbox changed:', e.target.checked);
                                                    setShouldUpdateCapacity(e.target.checked);
                                                    setData('update_section_capacity', e.target.checked);
                                                    if (e.target.checked && selectedRoom) {
                                                        setData('new_capacity', Number(selectedRoom.capacity));
                                                    } else {
                                                        setData('new_capacity', null);
                                                    }
                                                }}
                                            />
                                            <span className="ml-2">Update section capacity to match room capacity</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {(data.location_type === 'virtual' || data.location_type === 'hybrid') && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Virtual Meeting URL
                            </label>
                            <div className="flex items-center">
                                <div className="relative flex-grow">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Video className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.virtual_meeting_url}
                                        onChange={(e) => handleChange('virtual_meeting_url', e.target.value)}
                                        placeholder="https://zoom.us/j/123456789"
                                        className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                            {errors.virtual_meeting_url && (
                                <div className="mt-1 text-sm text-red-600">
                                    {errors.virtual_meeting_url}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                    {onPreview && (
                        <button
                            type="button"
                            onClick={handlePreview}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                        {processing ? 'Processing...' : submitLabel}
                    </button>
                </div>
            </form>
        </div>
    );
}
