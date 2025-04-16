import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/Card';
import AppLayout from '@/Layouts/AppLayout';
import ScheduleCalendar from '@/Components/ui/ScheduleCalendar';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, HelpCircle, List } from 'lucide-react';
import { useState } from 'react';

// Define color palette for section differentiation
const SECTION_COLORS = [
    'bg-blue-100 border-blue-400 text-blue-800',
    'bg-green-100 border-green-400 text-green-800',
    'bg-purple-100 border-purple-400 text-purple-800',
    'bg-yellow-100 border-yellow-400 text-yellow-800',
    'bg-pink-100 border-pink-400 text-pink-800',
    'bg-indigo-100 border-indigo-400 text-indigo-800',
    'bg-red-100 border-red-400 text-red-800',
    'bg-orange-100 border-orange-400 text-orange-800',
    'bg-teal-100 border-teal-400 text-teal-800',
    'bg-cyan-100 border-cyan-400 text-cyan-800',
];

export default function ProfessorCalendar({ calendarEvents, school, isProfessor, user }) {
    const [showHelp, setShowHelp] = useState(false);

    // Map section IDs to colors to keep them consistent
    const sectionColorMap = {};

    // Extract unique section IDs from events
    const uniqueSectionIds = [...new Set(calendarEvents.map(event => event.extendedProps.section_id))];

    // Assign a color to each section ID
    uniqueSectionIds.forEach((sectionId, index) => {
        sectionColorMap[sectionId] = SECTION_COLORS[index % SECTION_COLORS.length];
    });

    // Convert calendarEvents to the format expected by ScheduleCalendar
    const formattedSchedules = calendarEvents.map(event => {
        // Extract time part from the start/end date strings
        const startTime = event.start.split(' ')[1];
        const endTime = event.end.split(' ')[1];
        const dayOfWeek = event.start.split(' ')[0];
        const sectionId = event.extendedProps.section_id;

        return {
            id: event.id,
            day_of_week: dayOfWeek,
            start_time: startTime,
            end_time: endTime,
            location_type: event.extendedProps.delivery_method,
            room_id: null, // Not needed for professor view
            virtual_meeting_url: null,
            custom_color_class: sectionColorMap[sectionId], // Add custom color based on section ID
            section: {
                id: sectionId,
                course: {
                    title: event.description,
                    code: event.title.split(' - ')[0],
                    department: {
                        school_id: event.extendedProps.school_id
                    }
                },
                section_code: event.title.split(' - ')[1],
                professor_profile: event.extendedProps.professor_profile,
                status: event.extendedProps.status
            },
            room: {
                room_number: event.extendedProps.room ? event.extendedProps.room.split(' (')[0] : 'Unassigned',
                floor: {
                    building: {
                        name: event.extendedProps.room ? event.extendedProps.room.split(' (')[1].replace(')', '') : 'N/A'
                    }
                }
            }
        };
    });

    return (
        <AppLayout>
            <Head title="My Calendar" />
            <div className="mb-6 space-y-4">
                <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
                    <div>
                        <Link
                            href={route('dashboard')}
                            className="mb-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" /> Back to
                            Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">
                            My Calendar
                        </h1>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('schedules.index', school.id)}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <List className="mr-2 h-4 w-4" /> Schedule List
                        </Link>
                        <button
                            type="button"
                            onClick={() => setShowHelp(true)}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <HelpCircle className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            <Card className="mb-6">
                <CardHeader className="pb-2">
                    <CardTitle>My Teaching Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4 text-sm text-gray-600">
                        Each course is shown in a different color to help you distinguish between your classes.
                        Click on any class to view details or navigate to the section page.
                    </p>

                    {/* Schedule Calendar */}
                    <div className="bg-white p-0 shadow-none">
                        <ScheduleCalendar
                            schedules={formattedSchedules}
                            viewType="professor"
                            showWeekView={true}
                        />
                    </div>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
