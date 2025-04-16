import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Button, Dialog, DialogPanel, Text, Title, Card, Badge } from '@tremor/react';
import { Link } from '@inertiajs/react';
import { ClockIcon, MapPinIcon, UserIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const RoomCalendar = ({ schedules, room }) => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);

    // Convert schedules to FullCalendar events format
    const events = schedules.map(schedule => {
        // Convert day name to number (0 = Sunday, 1 = Monday, etc.)
        const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            .indexOf(schedule.day_of_week);

        // Create a title that includes section info
        const sectionInfo = schedule.section ?
            `${schedule.section.course?.code} (${schedule.section.section_code})` :
            'Reserved';

        return {
            id: schedule.id,
            title: sectionInfo,
            daysOfWeek: [dayIndex],
            startTime: schedule.start_time,
            endTime: schedule.end_time,
            backgroundColor: schedule.location_type === 'virtual' ? '#4CAF50' :
                           schedule.location_type === 'hybrid' ? '#FF9800' : '#1976D2',
            extendedProps: {
                schedule,
                section: schedule.section,
            }
        };
    });

    const handleEventClick = (clickInfo) => {
        setSelectedEvent(clickInfo.event);
        setIsEventModalOpen(true);
    };

    return (
        <div className="bg-white rounded-lg shadow p-4">
            <div className="mb-4">
                <h2 className="text-xl font-semibold">{room.name} Schedule</h2>
                <p className="text-gray-600">Capacity: {room.capacity} people</p>
            </div>
            <div className="h-[600px]">
                <FullCalendar
                    plugins={[timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'timeGridWeek,timeGridDay',
                        center: 'title',
                        right: 'prev,next today'
                    }}
                    slotMinTime="07:00:00"
                    slotMaxTime="22:00:00"
                    allDaySlot={false}
                    weekends={false}
                    events={events}
                    slotDuration="00:30:00"
                    height="100%"
                    nowIndicator={true}
                    selectable={false}
                    dayHeaderFormat={{ weekday: 'long' }}
                    eventClick={handleEventClick}
                    eventTimeFormat={{
                        hour: '2-digit',
                        minute: '2-digit',
                        meridiem: false,
                        hour12: false
                    }}
                />
            </div>

            <div className="mt-4 flex gap-4">
                <div className="flex items-center">
                    <div className="w-4 h-4 rounded bg-[#1976D2] mr-2"></div>
                    <span>In-person</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 rounded bg-[#4CAF50] mr-2"></div>
                    <span>Virtual</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-4 rounded bg-[#FF9800] mr-2"></div>
                    <span>Hybrid</span>
                </div>
            </div>

            {/* Event Details Modal */}
            <Dialog open={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} static={true}>
                <DialogPanel>
                    {selectedEvent && (
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-6">
                                <Title>Schedule Details</Title>
                                <Button variant="light" onClick={() => setIsEventModalOpen(false)}>Close</Button>
                            </div>

                            <Card className="mb-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <ClockIcon className="h-5 w-5 text-gray-500" />
                                    <Text className="font-semibold">{selectedEvent.extendedProps.schedule.display_name}</Text>
                                </div>

                                <div className="flex items-center gap-2">
                                    <MapPinIcon className="h-5 w-5 text-gray-500" />
                                    <Text className="capitalize">{selectedEvent.extendedProps.schedule.location_type}</Text>
                                    {selectedEvent.extendedProps.schedule.virtual_meeting_url && (
                                        <a href={selectedEvent.extendedProps.schedule.virtual_meeting_url}
                                           target="_blank"
                                           className="text-blue-600 hover:underline ml-2">
                                            Join Meeting →
                                        </a>
                                    )}
                                </div>
                            </Card>

                            {selectedEvent.extendedProps.section && (
                                <Card>
                                    <div className="space-y-4">
                                        <div className="flex items-start gap-2">
                                            <AcademicCapIcon className="h-5 w-5 text-gray-500 mt-1" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Text className="font-semibold">{selectedEvent.extendedProps.section.course?.code}</Text>
                                                    <Badge color={selectedEvent.extendedProps.section.status === 'active' ? 'green' :
                                                                 selectedEvent.extendedProps.section.status === 'full' ? 'red' : 'yellow'}>
                                                        {selectedEvent.extendedProps.section.status}
                                                    </Badge>
                                                </div>
                                                <Text>{selectedEvent.extendedProps.section.course?.title}</Text>
                                                <Text className="text-sm text-gray-500">Section {selectedEvent.extendedProps.section.section_code}</Text>
                                            </div>
                                        </div>

                                        {selectedEvent.extendedProps.section.professor_profile && (
                                            <div className="flex items-center gap-2">
                                                <UserIcon className="h-5 w-5 text-gray-500" />
                                                <div>
                                                    <Text className="font-semibold">Professor</Text>
                                                    <Text>
                                                        {selectedEvent.extendedProps.section.professor_profile.user.name}
                                                    </Text>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2">
                                            <UserIcon className="h-5 w-5 text-gray-500" />
                                            <div>
                                                <Text className="font-semibold">Enrollment</Text>
                                                <Text>
                                                    {selectedEvent.extendedProps.section.students_count} / {' '}
                                                    {selectedEvent.extendedProps.section.effective_capacity || selectedEvent.extendedProps.section.capacity || 'Unlimited'} students
                                                </Text>
                                            </div>
                                        </div>

                                        <div className="mt-2">
                                            <Link
                                                href={route('sections.show', {
                                                    school: selectedEvent.extendedProps.section.course?.department?.school_id,
                                                    section: selectedEvent.extendedProps.section.id
                                                })}
                                                className="text-blue-600 hover:underline text-sm"
                                            >
                                                View Section Details →
                                            </Link>
                                        </div>
                                    </div>
                                </Card>
                            )}
                        </div>
                    )}
                </DialogPanel>
            </Dialog>
        </div>
    );
};

export default RoomCalendar;
