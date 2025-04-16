import React, { useState, useEffect } from 'react';
import { Card, Title, Text, Badge } from '@tremor/react';
import { Link } from '@inertiajs/react';

export default function ScheduleCalendar({
    schedules = [],
    showWeekView = false,
    userRole,
    rooms = [],
    viewType = 'default', // 'default', 'room', 'professor'
    compact = false // New prop for compact view in preview
}) {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = Array.from({ length: 14 }, (_, i) => `${i + 8}:00`); // 8 AM to 9 PM

    // Group schedules by day
    const schedulesByDay = {};
    days.forEach(day => {
        schedulesByDay[day] = schedules.filter(s => {
            // Handle both pattern schedules and direct day schedules
            if (s.day_of_week === day) return true;
            if (s.days_of_week && Array.isArray(s.days_of_week) && s.days_of_week.includes(day)) return true;
            return false;
        });
    });

    // For room view, organize schedules by room
    const schedulesByRoom = {};
    if (viewType === 'room' && rooms.length > 0) {
        rooms.forEach(room => {
            schedulesByRoom[room.id] = schedules.filter(s => s.room_id === room.id);
        });
    }

    // Convert time string HH:MM:SS to hours as a number
    const timeToHours = (timeString) => {
        if (!timeString) return 0;
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours + (minutes / 60);
    };

    // Calculate position and height for a schedule item
    const getSchedulePosition = (schedule) => {
        if (!schedule.start_time || !schedule.end_time) return {};

        const startHour = timeToHours(schedule.start_time);
        const endHour = timeToHours(schedule.end_time);

        // Calculate position relative to 8 AM (our start time)
        const top = `${(startHour - 8) * 60}px`;
        const height = `${(endHour - startHour) * 60}px`;

        return { top, height };
    };

    // Get color class based on location type
    const getColorClass = (locationType) => {
        switch(locationType) {
            case 'in-person':
                return 'bg-blue-100 border-blue-400 text-blue-800';
            case 'virtual':
                return 'bg-green-100 border-green-400 text-green-800';
            case 'hybrid':
                return 'bg-purple-100 border-purple-400 text-purple-800';
            default:
                return 'bg-gray-100 border-gray-400 text-gray-800';
        }
    };

    // Setup tooltips
    useEffect(() => {
        const scheduleElements = document.querySelectorAll('.schedule-item');

        const showTooltip = (e) => {
            const tooltip = e.currentTarget.querySelector('.schedule-tooltip');
            if (tooltip) {
                tooltip.style.display = 'block';
            }
        };

        const hideTooltip = (e) => {
            const tooltip = e.currentTarget.querySelector('.schedule-tooltip');
            if (tooltip) {
                tooltip.style.display = 'none';
            }
        };

        scheduleElements.forEach(item => {
            item.addEventListener('mouseenter', showTooltip);
            item.addEventListener('mouseleave', hideTooltip);
        });

        return () => {
            scheduleElements.forEach(item => {
                item.removeEventListener('mouseenter', showTooltip);
                item.removeEventListener('mouseleave', hideTooltip);
            });
        };
    }, [schedules]);

    // Render room-based calendar view (Admin view)
    const renderRoomCalendar = () => {
        return (
            <div className="w-full overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Calendar Header */}
                    <div className="grid grid-cols-8 gap-1 mb-2">
                        <div className="flex items-center justify-center h-10 font-medium text-xs text-gray-500">
                            Time
                        </div>
                        {days.map(day => (
                            <div
                                key={day}
                                className="flex items-center justify-center h-10 font-medium text-xs text-gray-700 rounded-t-md bg-gray-50"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Room Rows */}
                    {rooms.map(room => (
                        <div key={room.id} className="mb-8">
                            <div className="font-medium text-gray-900 mb-2 flex items-center justify-between">
                                <div>
                                    Room {room.room_number} - {room.floor?.building?.name || 'N/A'}
                                    <span className="ml-2 text-sm text-gray-500">Capacity: {room.capacity || 'Unknown'}</span>
                                </div>
                                <div className="text-sm font-normal">
                                    <Link
                                        href={route('rooms.show', [room.floor?.building?.school_id || document.querySelector('meta[name="school-id"]')?.content, room.id])}
                                        className="text-blue-600 hover:underline"
                                    >
                                        View Room
                                    </Link>
                                </div>
                            </div>

                            {/* Room Schedule Grid */}
                            <div className="relative grid grid-cols-8 gap-1 mb-4 border-b pb-4">
                                {/* Time Labels */}
                                <div className="space-y-[55px] pt-2">
                                    {timeSlots.map(time => (
                                        <div key={time} className="text-xs text-gray-500 font-medium h-4">
                                            {time}
                                        </div>
                                    ))}
                                </div>

                                {/* Day Columns */}
                                {days.map(day => {
                                    // Use the room's own schedules instead of filtering from the main schedules array
                                    const roomSchedulesForDay = room.schedules?.filter(s =>
                                        s.day_of_week === day || (s.days_of_week && s.days_of_week.includes(day))
                                    ) || [];

                                    return (
                                        <div key={`${room.id}-${day}`} className="relative min-h-[250px] bg-gray-50 rounded-md p-1">
                                            {roomSchedulesForDay.map((schedule, index) => {
                                                const position = getSchedulePosition(schedule);
                                                const colorClass = schedule.custom_color_class || getColorClass(schedule.location_type);
                                                const professorName = schedule.section?.professor_profile?.user?.name || 'Unassigned';

                                                return (
                                                    <div
                                                        key={`${room.id}-${day}-${index}`}
                                                        className={`schedule-item absolute left-1 right-1 px-2 py-1 rounded border ${colorClass} text-xs overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200`}
                                                        style={{
                                                            top: position.top,
                                                            height: position.height,
                                                        }}
                                                        onClick={() => {
                                                            if (schedule.section && schedule.section.id) {
                                                                const url = route('sections.show', [schedule.section.course?.department?.school_id || document.querySelector('meta[name="school-id"]')?.content, schedule.section.id]);
                                                                window.location.href = url;
                                                            }
                                                        }}
                                                    >
                                                        <div className="font-semibold mb-1 truncate">
                                                            {schedule.section?.course?.title || 'Class'}
                                                        </div>
                                                        <div className="text-xs truncate">
                                                            {schedule.start_time?.substring(0, 5)} - {schedule.end_time?.substring(0, 5)}
                                                        </div>
                                                        <div className="text-xs truncate">
                                                            Prof. {professorName}
                                                        </div>

                                                        {/* Tooltip */}
                                                        <div className="schedule-tooltip hidden absolute top-full left-0 mt-1 z-50 w-48 p-2 bg-white rounded-md shadow-lg border border-gray-200 text-left">
                                                            <div className="font-semibold">{schedule.section?.course?.title || 'Class'}</div>
                                                            <div>Section: {schedule.section?.section_code || 'N/A'}</div>
                                                            <div>Time: {schedule.start_time?.substring(0, 5)} - {schedule.end_time?.substring(0, 5)}</div>
                                                            <div>Professor: {professorName}</div>
                                                            <div>Room: {room.room_number}, {room.floor?.building?.name || 'N/A'}</div>
                                                            {schedule.location_type && (
                                                                <div>Location Type: {schedule.location_type}</div>
                                                            )}
                                                            <div className="mt-2 text-blue-600 hover:underline">
                                                                Click to view section details
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Room availability indicator */}
                                            {roomSchedulesForDay.length === 0 && (
                                                <div className="text-center text-xs text-gray-400 mt-2">
                                                    Available
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="mt-4 flex gap-4 justify-end">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-100 border border-blue-400"></div>
                        <span className="text-xs text-gray-600">In-Person</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-green-100 border border-green-400"></div>
                        <span className="text-xs text-gray-600">Virtual</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-purple-100 border border-purple-400"></div>
                        <span className="text-xs text-gray-600">Hybrid</span>
                    </div>
                </div>
            </div>
        );
    };

    // Render the default week view calendar
    const renderWeekCalendar = () => {
        // Determine height based on compact mode
        const columnHeight = compact ? "min-h-[400px]" : "min-h-[800px]";
        const timeSlotSpacing = compact ? "space-y-[27px]" : "space-y-[55px]";

        return (
            <div className="w-full overflow-x-auto">
                <div className={`min-w-[600px] ${compact ? 'max-w-full' : ''}`}>
                    {/* Calendar Header */}
                    <div className="grid grid-cols-8 gap-1 mb-2">
                        <div className="flex items-center justify-center h-10 font-medium text-xs text-gray-500">
                            Time
                        </div>
                        {days.map(day => (
                            <div
                                key={day}
                                className="flex items-center justify-center h-10 font-medium text-xs text-gray-700 rounded-t-md bg-gray-50"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Body */}
                    <div className="relative grid grid-cols-8 gap-1 border rounded-lg overflow-hidden">
                        {/* Time Labels */}
                        <div className={`${timeSlotSpacing} pt-2`}>
                            {timeSlots.map(time => (
                                <div key={time} className="text-xs text-gray-500 font-medium h-4">
                                    {time}
                                </div>
                            ))}
                        </div>

                        {/* Day Columns */}
                        {days.map(day => (
                            <div key={day} className={`relative ${columnHeight} bg-gray-50 p-1`}>
                                {/* Hour grid lines */}
                                {timeSlots.map((time, index) => (
                                    <div
                                        key={`grid-${day}-${index}`}
                                        className="absolute left-0 right-0 border-t border-gray-100"
                                        style={{ top: `${index * (compact ? 27 : 55)}px` }}
                                    ></div>
                                ))}

                                {schedulesByDay[day].map((schedule, index) => {
                                    const position = getSchedulePosition(schedule);
                                    const colorClass = schedule.custom_color_class || getColorClass(schedule.location_type);
                                    const professorName = schedule.section?.professor_profile?.user?.name || 'Unassigned';

                                    return (
                                        <div
                                            key={`${day}-${index}`}
                                            className={`schedule-item absolute left-1 right-1 px-2 py-1 rounded-md border ${colorClass} text-xs overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200`}
                                            style={{
                                                top: position.top,
                                                height: position.height,
                                            }}
                                            onClick={() => {
                                                if (schedule.section && schedule.section.id) {
                                                    // Navigate to section page using window location
                                                    // This is a fallback in case Link usage is problematic in absolute positioned elements
                                                    const url = route('sections.show', [schedule.section.course?.department?.school_id || document.querySelector('meta[name="school-id"]')?.content, schedule.section.id]);
                                                    window.location.href = url;
                                                }
                                            }}
                                        >
                                            <div className="font-semibold mb-1 truncate">
                                                {schedule.section?.course?.title || 'Class'}
                                            </div>
                                            <div className="text-xs truncate">
                                                {schedule.start_time?.substring(0, 5)} - {schedule.end_time?.substring(0, 5)}
                                            </div>
                                            <div className="text-xs truncate">
                                                Prof. {professorName}
                                            </div>
                                            {schedule.room && (
                                                <div className="text-xs truncate mt-1">
                                                    Room {schedule.room.room_number || 'N/A'}
                                                </div>
                                            )}

                                            {/* Tooltip */}
                                            <div className="schedule-tooltip hidden absolute top-full left-0 mt-1 z-50 w-48 p-2 bg-white rounded-md shadow-lg border border-gray-200 text-left">
                                                <div className="font-semibold">{schedule.section?.course?.title || 'Class'}</div>
                                                <div>Section: {schedule.section?.section_code || 'N/A'}</div>
                                                <div>Time: {schedule.start_time?.substring(0, 5)} - {schedule.end_time?.substring(0, 5)}</div>
                                                <div>Professor: {professorName}</div>
                                                {schedule.room && (
                                                    <div>Room: {schedule.room.room_number}, {schedule.room.floor?.building?.name || 'N/A'}</div>
                                                )}
                                                {schedule.location_type && (
                                                    <div>Location Type: {schedule.location_type}</div>
                                                )}
                                                {schedule.section && schedule.section.id && (
                                                    <div className="mt-2 text-blue-600 hover:underline">
                                                        Click to view section details
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                {viewType === 'professor' ? (
                    <div className="mt-4 text-xs text-gray-600">
                        <p>Colors represent different courses to help distinguish between classes.</p>
                    </div>
                ) : (
                    <div className="mt-4 flex gap-4 justify-end">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-blue-100 border border-blue-400"></div>
                            <span className="text-xs text-gray-600">In-Person</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-green-100 border border-green-400"></div>
                            <span className="text-xs text-gray-600">Virtual</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-purple-100 border border-purple-400"></div>
                            <span className="text-xs text-gray-600">Hybrid</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Render professor view calendar (optimized for showing a professor's schedule)
    const renderProfessorCalendar = () => {
        return (
            <div className="w-full overflow-x-auto">
                <div className="min-w-[600px]">
                    {/* Calendar Header */}
                    <div className="grid grid-cols-8 gap-1 mb-2">
                        <div className="flex items-center justify-center h-10 font-medium text-xs text-gray-500">
                            Time
                        </div>
                        {days.map(day => (
                            <div
                                key={day}
                                className="flex items-center justify-center h-10 font-medium text-xs text-gray-700 rounded-t-md bg-gray-50"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Professor Schedule View */}
                    <div className="relative grid grid-cols-8 gap-1 border rounded-lg overflow-hidden">
                        {/* Time Labels */}
                        <div className="space-y-[55px] pt-2">
                            {timeSlots.map(time => (
                                <div key={time} className="text-xs text-gray-500 font-medium h-4">
                                    {time}
                                </div>
                            ))}
                        </div>

                        {/* Day Columns */}
                        {days.map(day => (
                            <div key={day} className="relative min-h-[800px] bg-gray-50 rounded-md p-1">
                                {schedulesByDay[day].map((schedule, index) => {
                                    const position = getSchedulePosition(schedule);
                                    const colorClass = schedule.custom_color_class || getColorClass(schedule.location_type);
                                    const professorName = schedule.section?.professor_profile?.user?.name || 'Unassigned';

                                    return (
                                        <div
                                            key={`${day}-${index}`}
                                            className={`schedule-item absolute left-1 right-1 px-2 py-1 rounded border ${colorClass} text-xs overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200`}
                                            style={{
                                                top: position.top,
                                                height: position.height,
                                            }}
                                            onClick={() => {
                                                if (schedule.section && schedule.section.id) {
                                                    const url = route('sections.show', [schedule.section.course?.department?.school_id || document.querySelector('meta[name="school-id"]')?.content, schedule.section.id]);
                                                    window.location.href = url;
                                                }
                                            }}
                                        >
                                            <div className="font-semibold mb-1 truncate">
                                                {schedule.section?.course?.title || 'Class'}
                                            </div>
                                            <div className="text-xs truncate">
                                                {schedule.start_time?.substring(0, 5)} - {schedule.end_time?.substring(0, 5)}
                                            </div>
                                            <div className="text-xs truncate">
                                                Section {schedule.section?.section_code || 'N/A'}
                                            </div>
                                            {schedule.room && (
                                                <div className="text-xs truncate mt-1">
                                                    Room {schedule.room.room_number || 'N/A'}
                                                </div>
                                            )}

                                            {/* Tooltip */}
                                            <div className="schedule-tooltip hidden absolute top-full left-0 mt-1 z-50 w-48 p-2 bg-white rounded-md shadow-lg border border-gray-200 text-left">
                                                <div className="font-semibold">{schedule.section?.course?.title || 'Class'}</div>
                                                <div>Section: {schedule.section?.section_code || 'N/A'}</div>
                                                <div>Time: {schedule.start_time?.substring(0, 5)} - {schedule.end_time?.substring(0, 5)}</div>
                                                <div>Students: {schedule.section?.number_of_students || 0}</div>
                                                {schedule.room && (
                                                    <div>Room: {schedule.room.room_number}, {schedule.room.floor?.building?.name || 'N/A'}</div>
                                                )}
                                                {schedule.location_type && (
                                                    <div>Location Type: {schedule.location_type}</div>
                                                )}
                                                <div className="mt-2 text-blue-600 hover:underline">
                                                    Click to view section details
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                {viewType === 'professor' ? (
                    <div className="mt-4 text-xs text-gray-600">
                        <p>Colors represent different courses to help distinguish between classes.</p>
                    </div>
                ) : (
                    <div className="mt-4 flex gap-4 justify-end">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-blue-100 border border-blue-400"></div>
                            <span className="text-xs text-gray-600">In-Person</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-green-100 border border-green-400"></div>
                            <span className="text-xs text-gray-600">Virtual</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-purple-100 border border-purple-400"></div>
                            <span className="text-xs text-gray-600">Hybrid</span>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Return the appropriate calendar view based on viewType
    return viewType === 'room' ? renderRoomCalendar() : viewType === 'professor' ? renderProfessorCalendar() : renderWeekCalendar();
}
