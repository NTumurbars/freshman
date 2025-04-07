import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Calendar, Clock, MapPin } from 'lucide-react';

export default function Index({ auth, schedules }) {
    const [selectedDay, setSelectedDay] = useState('All');
    const days = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const filteredSchedules = selectedDay === 'All'
        ? schedules
        : schedules.filter(schedule => schedule.day_of_week === selectedDay);

    return (
        <AppLayout userRole={auth.user.role_id} school={auth.school}>
            <Head title="Schedules" />

            <div className="sm:flex sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Class Schedules</h1>
                    <p className="mt-2 text-sm text-gray-700">Manage and view all class schedules</p>
                </div>
                {auth.can.create_schedule && (
                    <Link
                        href={route('schedules.create')}
                        className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Create New Schedule
                    </Link>
                )}
            </div>

            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        {days.map(day => (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`px-4 py-2 rounded-full text-sm font-medium ${
                                    selectedDay === day
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                {day}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="divide-y divide-gray-200">
                    {filteredSchedules.map(schedule => (
                        <div key={schedule.id} className="p-6 hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {schedule.section.course.title} - Section {schedule.section.section_code}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Prof. {schedule.section.professor?.name || 'Not Assigned'}
                                    </p>
                                </div>
                                {auth.can.update_schedule && (
                                    <Link
                                        href={route('schedules.edit', schedule.id)}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Edit
                                    </Link>
                                )}
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                                    {schedule.day_of_week}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="h-5 w-5 mr-2 text-gray-400" />
                                    {schedule.start_time} - {schedule.end_time}
                                </div>
                                <div className="flex items-center text-sm text-gray-500">
                                    <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                                    Room {schedule.room.room_number}, {schedule.room.floor.building.name}
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredSchedules.length === 0 && (
                        <div className="p-6 text-center text-gray-500">
                            No schedules found for {selectedDay === 'All' ? 'any day' : selectedDay}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
