import React, { useState } from 'react';
import { Card, Text, Title, Badge } from '@tremor/react';
import { Clock, Calendar, Users, Info } from 'lucide-react';

export default function RoomUtilization({ room }) {
    const [activeDay, setActiveDay] = useState('Monday');
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // If room is undefined or null, return nothing
    if (!room) return null;

    // Ensure room.schedules exists
    const schedules = room.schedules || [];

    // Group schedules by day of week
    const schedulesByDay = {};
    daysOfWeek.forEach(day => {
        schedulesByDay[day] = schedules.filter(schedule => schedule && schedule.day_of_week === day) || [];
    });

    // Sort schedules by start_time
    Object.keys(schedulesByDay).forEach(day => {
        schedulesByDay[day].sort((a, b) => {
            if (!a || !a.start_time) return -1;
            if (!b || !b.start_time) return 1;
            return a.start_time.localeCompare(b.start_time);
        });
    });

    const formatTime = (timeString) => {
        if (!timeString) return '';
        try {
            // Convert 24hr format to 12hr format
            const parts = timeString.split(':');
            if (parts.length < 2) return timeString;

            const hours = parseInt(parts[0], 10);
            const minutes = parts[1];
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const hour12 = hours % 12 || 12;
            return `${hour12}:${minutes} ${ampm}`;
        } catch (error) {
            console.error('Error formatting time:', error);
            return timeString;
        }
    };

    return (
        <Card className="mt-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    <Title className="text-lg">Room Utilization</Title>
                </div>
                <Badge color="blue">Capacity: {room.capacity || 'Unknown'} students</Badge>
            </div>

            <div className="flex mb-4 overflow-x-auto pb-2">
                {daysOfWeek.map(day => (
                    <button
                        key={day}
                        onClick={() => setActiveDay(day)}
                        className={`px-3 py-1.5 text-sm rounded-md mr-2 whitespace-nowrap ${
                            activeDay === day
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                        {day}
                    </button>
                ))}
            </div>

            <div className="space-y-3">
                {schedulesByDay[activeDay].length > 0 ? (
                    schedulesByDay[activeDay].map((schedule, index) => (
                        <div key={index} className="border rounded-md p-3 flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                                <Text className="font-medium">{schedule?.section?.course?.title || 'Unnamed Course'}</Text>
                                <div className="flex items-center">
                                    <Clock className="w-4 h-4 text-gray-500 mr-1" />
                                    <Text className="text-sm">
                                        {formatTime(schedule?.start_time)} - {formatTime(schedule?.end_time)}
                                    </Text>
                                </div>
                            </div>

                            <div className="flex items-center text-gray-600 text-sm">
                                <Users className="w-4 h-4 mr-1" />
                                <Text className="text-sm">
                                    {schedule?.section?.professor_profile?.user?.name || 'Unassigned'}
                                </Text>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 border rounded-md border-dashed">
                        <Info className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                        <Text className="text-gray-500">No schedules on {activeDay}</Text>
                    </div>
                )}
            </div>
        </Card>
    );
}
