import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/Components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import AppLayout from '@/Layouts/AppLayout';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import resourceTimeGridPlugin from '@fullcalendar/resource-timegrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, HelpCircle, List, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function SectionCalendar({ calendarEvents, resources, school }) {
    const calendarRef = useRef(null);
    const [calendarApi, setCalendarApi] = useState(null);
    const [view, setView] = useState('resourceTimeGridWeek');
    const [selectedBuilding, setSelectedBuilding] = useState('all');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showEventDetails, setShowEventDetails] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    // Get unique buildings from resources
    const buildings = [...new Set(resources.map((r) => r.building))].filter(
        (b) => b !== 'N/A',
    );

    useEffect(() => {
        if (calendarRef.current) {
            const calendar = new Calendar(calendarRef.current, {
                plugins: [
                    dayGridPlugin,
                    timeGridPlugin,
                    resourceTimeGridPlugin,
                    interactionPlugin,
                ],
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'resourceTimeGridDay,resourceTimeGridWeek',
                },
                initialView: view,
                resources: resources,
                events: calendarEvents,
                slotMinTime: '07:00:00',
                slotMaxTime: '22:00:00',
                allDaySlot: false,
                resourceLabelDidMount: function (info) {
                    if (info.resource.id === 'unassigned') {
                        info.el.style.backgroundColor = '#f9fafb';
                        info.el.style.color = '#6b7280';
                        info.el.style.fontWeight = 'bold';
                    }
                },
                eventClick: function (info) {
                    const event = calendarEvents.find(
                        (e) => e.id === info.event.id,
                    );
                    if (event) {
                        setSelectedEvent({
                            title: info.event.title,
                            description: info.event.extendedProps.description,
                            professor: info.event.extendedProps.professor,
                            room: info.event.extendedProps.room,
                            term: info.event.extendedProps.term,
                            start: info.event.start,
                            end: info.event.end,
                            status: info.event.extendedProps.status,
                            deliveryMethod:
                                info.event.extendedProps.delivery_method,
                            section_id: info.event.extendedProps.section_id,
                            school_id:
                                info.event.extendedProps.school_id || school.id,
                        });
                        setShowEventDetails(true);
                    }
                },
                eventDidMount: function (info) {
                    // Color code by status
                    if (info.event.extendedProps.status === 'canceled') {
                        info.el.style.backgroundColor = '#ef4444';
                    } else if (info.event.extendedProps.status === 'full') {
                        info.el.style.backgroundColor = '#eab308';
                    } else if (info.event.extendedProps.status === 'pending') {
                        info.el.style.backgroundColor = '#3b82f6';
                    }

                    // Add colored indicator for delivery method
                    if (info.event.extendedProps.delivery_method === 'online') {
                        info.el.style.borderLeft = '4px solid #10b981'; // Green
                    } else if (
                        info.event.extendedProps.delivery_method === 'hybrid'
                    ) {
                        info.el.style.borderLeft = '4px solid #8b5cf6'; // Purple
                    }

                    // Add tooltip
                    const tooltip = document.createElement('div');
                    tooltip.className = 'fc-tooltip';
                    tooltip.innerHTML = `
            <div class="p-2 bg-white shadow rounded border">
              <div class="font-semibold">${info.event.title}</div>
              <div>${info.event.extendedProps.description}</div>
              <div class="text-sm text-gray-600">Professor: ${info.event.extendedProps.professor}</div>
              <div class="text-sm text-gray-600">Room: ${info.event.extendedProps.room}</div>
              <div class="text-sm text-gray-600">Delivery: ${info.event.extendedProps.delivery_method}</div>
            </div>
          `;

                    info.el.addEventListener('mouseover', function () {
                        document.body.appendChild(tooltip);
                        tooltip.style.position = 'absolute';
                        tooltip.style.zIndex = 10000;
                        tooltip.style.top =
                            info.el.getBoundingClientRect().top +
                            window.scrollY +
                            'px';
                        tooltip.style.left =
                            info.el.getBoundingClientRect().left +
                            window.scrollX +
                            'px';
                    });

                    info.el.addEventListener('mouseout', function () {
                        if (document.body.contains(tooltip)) {
                            document.body.removeChild(tooltip);
                        }
                    });
                },
            });

            calendar.render();
            setCalendarApi(calendar);

            return () => {
                calendar.destroy();
            };
        }
    }, [calendarRef.current, calendarEvents, resources, view]);

    // Filter resources by building
    useEffect(() => {
        if (calendarApi) {
            if (selectedBuilding === 'all') {
                calendarApi.setOption('resources', resources);
            } else {
                calendarApi.setOption(
                    'resources',
                    resources.filter((r) => r.building === selectedBuilding),
                );
            }
        }
    }, [selectedBuilding, calendarApi]);

    return (
        <AppLayout>
            <Head title="Section Calendar" />
            <div className="mb-6 space-y-4">
                <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
                    <div>
                        <Link
                            href={route('sections.index', school.id)}
                            className="mb-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" /> Back to
                            Sections
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Section Calendar
                        </h1>
                    </div>

                    <div className="flex items-center space-x-3">
                        <Link
                            href={route('sections.create', school.id)}
                            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Section
                        </Link>
                        <Link
                            href={route('sections.index', school.id)}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <List className="mr-2 h-4 w-4" /> List View
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

            <Card className="mb-4">
                <CardHeader className="pb-2">
                    <CardTitle>Filter Options</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <div className="w-full md:w-auto">
                            <label
                                htmlFor="building-filter"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Building
                            </label>
                            <Select
                                id="building-filter"
                                value={selectedBuilding}
                                onValueChange={setSelectedBuilding}
                            >
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="Select Building" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Buildings
                                    </SelectItem>
                                    {buildings.map((building) => (
                                        <SelectItem
                                            key={building}
                                            value={building}
                                        >
                                            {building}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-full md:w-auto">
                            <label
                                htmlFor="view-filter"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                View
                            </label>
                            <Select
                                id="view-filter"
                                value={view}
                                onValueChange={(value) => {
                                    setView(value);
                                    calendarApi?.changeView(value);
                                }}
                            >
                                <SelectTrigger className="w-full md:w-[200px]">
                                    <SelectValue placeholder="Select View" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="resourceTimeGridDay">
                                        Day
                                    </SelectItem>
                                    <SelectItem value="resourceTimeGridWeek">
                                        Week
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="rounded-lg border bg-white p-0 shadow">
                <div className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                        <h2 className="text-lg font-medium">
                            Room Availability
                        </h2>
                        <div className="flex space-x-4 text-xs">
                            <div className="flex items-center">
                                <div className="mr-1 h-3 w-3 rounded-full bg-green-500"></div>
                                <span>Available</span>
                            </div>
                            <div className="flex items-center">
                                <div className="mr-1 h-3 w-3 rounded-full bg-red-500"></div>
                                <span>Canceled</span>
                            </div>
                            <div className="flex items-center">
                                <div className="mr-1 h-3 w-3 rounded-full bg-yellow-500"></div>
                                <span>Full</span>
                            </div>
                            <div className="flex items-center">
                                <div className="mr-1 h-3 w-3 rounded-full bg-blue-500"></div>
                                <span>Pending</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-1 flex items-center text-xs text-gray-600">
                        <div className="mr-4 flex items-center">
                            <div className="mr-1 h-3 w-1 bg-green-500"></div>
                            <span>Online</span>
                        </div>
                        <div className="flex items-center">
                            <div className="mr-1 h-3 w-1 bg-purple-500"></div>
                            <span>Hybrid</span>
                        </div>
                    </div>
                </div>
                <div ref={calendarRef} className="min-h-[700px]" />
            </div>

            {/* Event Details Dialog */}
            <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedEvent?.title}</DialogTitle>
                        <DialogDescription>
                            {selectedEvent?.description}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 space-y-3">
                        <div>
                            <div className="text-sm font-medium text-gray-500">
                                Professor
                            </div>
                            <div>{selectedEvent?.professor}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-500">
                                Location
                            </div>
                            <div>{selectedEvent?.room}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-500">
                                Time
                            </div>
                            <div>
                                {selectedEvent?.start && selectedEvent?.end
                                    ? `${selectedEvent.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${selectedEvent.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                    : 'Time not specified'}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-500">
                                Status
                            </div>
                            <div className="capitalize">
                                {selectedEvent?.status || 'Active'}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-500">
                                Delivery Method
                            </div>
                            <div className="capitalize">
                                {selectedEvent?.deliveryMethod || 'In-person'}
                            </div>
                        </div>
                        <div className="pt-4">
                            <Link
                                href={route('sections.show', [
                                    selectedEvent?.school_id || school.id,
                                    selectedEvent?.section_id,
                                ])}
                                className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                View Section Details
                            </Link>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Help Dialog */}
            <Dialog open={showHelp} onOpenChange={setShowHelp}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Calendar Usage Guide</DialogTitle>
                        <DialogDescription>
                            How to use the calendar view for room scheduling
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 space-y-4">
                        <div className="space-y-2">
                            <h3 className="font-medium">Color Coding</h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex items-center">
                                    <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
                                    <span>Active sections</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
                                    <span>Canceled sections</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="mr-2 h-3 w-3 rounded-full bg-yellow-500"></div>
                                    <span>Full sections</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="mr-2 h-3 w-3 rounded-full bg-blue-500"></div>
                                    <span>Pending sections</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-medium">
                                Delivery Method Indicators
                            </h3>
                            <div className="space-y-1 text-sm">
                                <div className="flex items-center">
                                    <div className="mr-2 h-4 w-1 bg-green-500"></div>
                                    <span>Online sections</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="mr-2 h-4 w-1 bg-purple-500"></div>
                                    <span>Hybrid sections</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-medium">Tip</h3>
                            <p className="text-sm">
                                Sections without assigned rooms appear in the
                                "Unassigned" row at the top of the calendar.
                                Click on any section to view details or to
                                navigate to the section page.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-medium">Room Scheduling</h3>
                            <p className="text-sm">
                                The calendar shows the current schedule of all
                                rooms, making it easier to identify available
                                time slots for adding new section schedules. You
                                can create a section without a schedule and add
                                the schedule later when planning room
                                allocations.
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
