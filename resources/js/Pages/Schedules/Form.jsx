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
    const [selectedSection, setSelectedSection] = useState(null);
    const [showPatternModal, setShowPatternModal] = useState(false);
    const [selectedPattern, setSelectedPattern] = useState('');
    const [isEditingPattern, setIsEditingPattern] = useState(false);

    useEffect(() => {
        // Find the selected section in the sections array
        if (data.section_id && sections && sections.length > 0) {
            const section = sections.find(s => s.id.toString() === data.section_id.toString());
            setSelectedSection(section);
        }
    }, [data.section_id, sections]);

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

    // When handling meeting_pattern changes while editing:
    const handleChange = (field, value) => {
        // Special handling for location_type...
        if (field === 'location_type') {
            if (value === 'in_person') {
                value = 'in-person';
            }
        }
        
        if (field === 'meeting_pattern' && schedule) {
            // For an existing schedule, store the new pattern and show confirmation modal
            try {
                setSelectedPattern(value);
                setData('meeting_pattern', value);
                setShowPatternModal(true);
                return;
            } catch (error) {
                console.error('Error setting pattern:', error);
                alert('There was an error changing the meeting pattern. Please try again.');
            }
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
            return;
        }
        
        setData(field, value);
    };

    // Confirmation callback for changing pattern
    const confirmPatternChange = () => {
        if (!selectedPattern) {
            alert('No pattern selected');
            return;
        }
        // Explicitly update the form state to the new pattern
        setData('meeting_pattern', selectedPattern);
        setIsEditingPattern(true);
        setShowPatternModal(false);
    };

    const cancelPatternChange = () => {
        setSelectedPattern('');
        if (schedule) {
            setData('meeting_pattern', schedule.meeting_pattern || 'single');
        }
        setShowPatternModal(false);
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
        
        try {
            // If editing an existing schedule with pattern change, handle pattern change
            if (schedule && isEditingPattern) {
                console.log('Changing schedule pattern to:', data.meeting_pattern);
                await createSchedulesWithPattern(data);
                return;
            }

            // For normal editing (not changing pattern)
            if (schedule && !isEditingPattern) {
                await put(route('schedules.update', [school.id, schedule.id]), data);
                
                if (data.redirect_section) {
                    window.location.href = route('sections.show', [school.id, data.section_id]);
                }
                return;
            }

            // For new schedules (creating, not editing)
            await createSchedulesWithPattern(data);
            
        } catch (error) {
            console.error('Error in schedule creation/update:', error);
            alert('Error: ' + (error.response?.data?.message || error.message || 'Unknown error occurred'));
        }
    };
    
    // Helper function to create schedules based on pattern
    const createSchedulesWithPattern = async (formData) => {
        try {
            // For single schedule patterns
            if (formData.meeting_pattern === 'single') {
                console.log('Creating single schedule for day:', formData.day_of_week);
                const finalData = {
                    ...formData,
                    meeting_pattern: 'single' // Ensure it's set to single
                };
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
            
            try {
                // Use the dedicated batch endpoint that handles multiple days at once
                const response = await axios.post(route('schedules.store-batch', school.id), formData);
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
            setSelectedPattern('');
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
                        <select
                            value={data.section_id}
                            onChange={(e) => handleChange('section_id', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            disabled={schedule || preselectedSectionId}
                        >
                            <option value="">Select Section</option>
                            {sections.map((section) => (
                                <option key={section.id} value={section.id}>
                                    {section.course?.course_code} - {section.section_code} ({section.course?.title})
                                </option>
                            ))}
                        </select>
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
                            <select
                                value={data.meeting_pattern}
                                onChange={(e) => handleChange('meeting_pattern', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                disabled={schedule && !isEditingPattern}
                            >
                                <option value="single">Single Meeting</option>
                                <option value="monday-wednesday-friday">Monday/Wednesday/Friday</option>
                                <option value="tuesday-thursday">Tuesday/Thursday</option>
                                <option value="monday-wednesday">Monday/Wednesday</option>
                                <option value="tuesday-friday">Tuesday/Friday</option>
                                <option value="weekly">Weekly (Mon-Fri)</option>
                            </select>
                        </div>

                        {data.meeting_pattern === 'single' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Day of Week <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={data.day_of_week}
                                    onChange={(e) => handleChange('day_of_week', e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                >
                                    <option value="Monday">Monday</option>
                                    <option value="Tuesday">Tuesday</option>
                                    <option value="Wednesday">Wednesday</option>
                                    <option value="Thursday">Thursday</option>
                                    <option value="Friday">Friday</option>
                                    <option value="Saturday">Saturday</option>
                                    <option value="Sunday">Sunday</option>
                                </select>
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
                        <select
                            value={data.location_type}
                            onChange={(e) => handleChange('location_type', e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        >
                            <option value="in-person">In Person</option>
                            <option value="virtual">Virtual</option>
                            <option value="hybrid">Hybrid</option>
                        </select>
                    </div>

                    {(data.location_type === 'in-person' || data.location_type === 'hybrid') && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Room
                            </label>
                            <select
                                value={data.room_id}
                                onChange={(e) => handleChange('room_id', e.target.value)}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                                <option value="">Select Room</option>
                                {rooms.map((room) => (
                                    <option key={room.id} value={room.id}>
                                        {room.room_number} - {room.floor?.building?.name || 'Unknown Building'}
                                    </option>
                                ))}
                            </select>
                            {errors.room_id && (
                                <div className="mt-1 text-sm text-red-600">
                                    {errors.room_id}
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

            {/* Pattern Change Confirmation Modal */}
            {showPatternModal && (
                <Modal
                    show={showPatternModal}
                    onClose={() => setShowPatternModal(false)}
                    title="Change Meeting Pattern"
                    footer={
                        <div className="flex justify-end space-x-2">
                            <button
                                type="button"
                                onClick={cancelPatternChange}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white shadow-sm text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={confirmPatternChange}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Confirm Change
                            </button>
                        </div>
                    }
                >
                    <div className="p-6">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <Info className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-gray-900">Warning: This will modify your schedule</h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        Changing the meeting pattern will delete <strong>all existing schedules</strong> for this section and create new ones based on the selected pattern.
                                    </p>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Are you sure you want to continue?
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}