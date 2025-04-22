import ScheduleCalendar from '@/Components/UI/ScheduleCalendar';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Building,
    Calendar,
    CalendarDays,
    ChevronDown,
    ChevronUp,
    Clock,
    Filter,
    LayoutGrid,
    List,
    MapPin,
    Search,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Index({
    auth,
    schedules,
    rooms = [],
    isProfessor = false,
}) {
    const [selectedDay, setSelectedDay] = useState('All');
    const days = [
        'All',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
    ];

    // Extract user role and school properly
    const userRole = auth.user.role.id;
    const userSchool = auth.user.school;

    // State for enhanced filtering, sorting and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState('day_of_week');
    const [sortDirection, setSortDirection] = useState('asc');
    const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', or 'calendar'
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [filterOptions, setFilterOptions] = useState({
        professor: 'All',
        course: 'All',
    });

    // Extract unique professors and courses for filter dropdowns
    const professors = [
        'All',
        ...new Set(
            schedules.map((s) => s.section.professor_profile?.user?.name).filter(Boolean),
        ),
    ];
    const courses = [
        'All',
        ...new Set(schedules.map((s) => s.section.course.title)),
    ];

    // Add state for calendar view type
    const [calendarViewType, setCalendarViewType] = useState(() => {
        if (userRole <= 2) return 'room'; // Admin and School Admin
        if (isProfessor) return 'professor'; // Professor
        return 'default'; // Others
    });

    // Filter schedules based on all criteria
    const filteredSchedules = schedules
        .filter(
            (schedule) =>
                selectedDay === 'All' || schedule.day_of_week === selectedDay,
        )
        .filter(
            (schedule) =>
                filterOptions.professor === 'All' ||
                schedule.section.professor_profile?.user?.name === filterOptions.professor,
        )
        .filter(
            (schedule) =>
                filterOptions.course === 'All' ||
                schedule.section.course.title === filterOptions.course,
        )
        .filter((schedule) => {
            if (!searchTerm) return true;
            const searchLower = searchTerm.toLowerCase();
            return (
                (schedule.section?.course?.title &&
                    schedule.section.course.title
                        .toLowerCase()
                        .includes(searchLower)) ||
                (schedule.section?.professor_profile?.user?.name || '')
                    .toLowerCase()
                    .includes(searchLower) ||
                (schedule.room?.room_number &&
                    schedule.room.room_number
                        .toString()
                        .includes(searchLower)) ||
                (schedule.day_of_week &&
                    schedule.day_of_week.toLowerCase().includes(searchLower)) ||
                (schedule.location_type &&
                    schedule.location_type.toLowerCase().includes(searchLower))
            );
        });

    // Sort schedules
    const sortedSchedules = [...filteredSchedules].sort((a, b) => {
        let compareA, compareB;

        if (sortField === 'course') {
            compareA = a.section?.course?.title || '';
            compareB = b.section?.course?.title || '';
        } else if (sortField === 'professor') {
            compareA = a.section?.professor_profile?.user?.name || '';
            compareB = b.section?.professor_profile?.user?.name || '';
        } else if (sortField === 'room') {
            compareA = a.room?.room_number || '';
            compareB = b.room?.room_number || '';
        } else if (sortField === 'time') {
            compareA = a.start_time || '';
            compareB = b.start_time || '';
        } else {
            compareA = a[sortField] || '';
            compareB = b[sortField] || '';
        }

        if (sortDirection === 'asc') {
            return compareA > compareB ? 1 : -1;
        } else {
            return compareA < compareB ? 1 : -1;
        }
    });

    // Paginate schedules
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedSchedules.slice(
        indexOfFirstItem,
        indexOfLastItem,
    );
    const totalPages = Math.ceil(sortedSchedules.length / itemsPerPage);

    // Handle sorting change
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedDay, searchTerm, filterOptions]);

    return (
        <AppLayout>
            <Head title="Schedules" />
            <meta name="school-id" content={userSchool.id} />

            <div className="mb-6 sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Class Schedules
                    </h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage and view all class schedules
                    </p>
                </div>
                {auth.can.create_schedule && (
                    <Link
                        href={route('schedules.create', { school: userSchool.id })}
                        className="mt-4 inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0"
                    >
                        Create New Schedule
                    </Link>
                )}
            </div>

            {/* Search and Filters */}
            <div className="mb-6 overflow-hidden rounded-lg bg-white shadow">
                <div className="border-b border-gray-200 p-4">
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                        {/* Search Bar */}
                        <div className="relative">
                            <label
                                htmlFor="schedule-search"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Search
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="schedule-search"
                                    type="text"
                                    placeholder="Search schedules..."
                                    className="w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            // Apply search filter
                                            setCurrentPage(1);
                                        }
                                    }}
                                />
                                {searchTerm && (
                                    <button
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Professor Filter */}
                        <div className="relative">
                            <label
                                htmlFor="professor-filter"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Professor
                            </label>
                            <select
                                id="professor-filter"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={filterOptions.professor}
                                onChange={(e) =>
                                    setFilterOptions({
                                        ...filterOptions,
                                        professor: e.target.value,
                                    })
                                }
                            >
                                {professors.map((prof) => (
                                    <option key={prof} value={prof}>
                                        {prof}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Course Filter */}
                        <div className="relative">
                            <label
                                htmlFor="course-filter"
                                className="mb-1 block text-sm font-medium text-gray-700"
                            >
                                Course
                            </label>
                            <select
                                id="course-filter"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={filterOptions.course}
                                onChange={(e) =>
                                    setFilterOptions({
                                        ...filterOptions,
                                        course: e.target.value,
                                    })
                                }
                            >
                                {courses.map((course) => (
                                    <option key={course} value={course}>
                                        {course}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Day Filter */}
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                        {days.map((day) => (
                            <button
                                key={day}
                                onClick={() => setSelectedDay(day)}
                                className={`rounded-full px-4 py-2 text-sm font-medium ${
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

                <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center">
                        <span className="text-sm text-gray-700">
                            Showing{' '}
                            <span className="font-medium">
                                {sortedSchedules.length > 0
                                    ? indexOfFirstItem + 1
                                    : 0}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium">
                                {Math.min(
                                    indexOfLastItem,
                                    sortedSchedules.length,
                                )}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium">
                                {sortedSchedules.length}
                            </span>{' '}
                            schedules
                        </span>
                    </div>

                    <div className="flex items-center space-x-4">
                        {/* View Toggle */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`rounded p-1.5 ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                                title="List view"
                            >
                                <List className="h-4 w-4 text-gray-600" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`rounded p-1.5 ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                                title="Grid view"
                            >
                                <LayoutGrid className="h-4 w-4 text-gray-600" />
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`rounded p-1.5 ${viewMode === 'calendar' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                                title="Calendar view"
                            >
                                <CalendarDays className="h-4 w-4 text-gray-600" />
                            </button>
                        </div>

                        {/* Items per page (only show for list and grid views) */}
                        {viewMode !== 'calendar' && (
                            <div className="relative">
                                <select
                                    className="rounded-md border-gray-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={itemsPerPage}
                                    onChange={(e) =>
                                        setItemsPerPage(Number(e.target.value))
                                    }
                                >
                                    <option value={5}>5 per page</option>
                                    <option value={10}>10 per page</option>
                                    <option value={25}>25 per page</option>
                                    <option value={50}>50 per page</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Schedules Table View */}
                {viewMode === 'list' && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        scope="col"
                                        className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                        onClick={() =>
                                            handleSort('day_of_week')
                                        }
                                    >
                                        <div className="flex items-center">
                                            Day
                                            {sortField === 'day_of_week' &&
                                                (sortDirection === 'asc' ? (
                                                    <ChevronUp className="ml-1 h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="ml-1 h-4 w-4" />
                                                ))}
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                        onClick={() => handleSort('course')}
                                    >
                                        <div className="flex items-center">
                                            Course
                                            {sortField === 'course' &&
                                                (sortDirection === 'asc' ? (
                                                    <ChevronUp className="ml-1 h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="ml-1 h-4 w-4" />
                                                ))}
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                        onClick={() => handleSort('professor')}
                                    >
                                        <div className="flex items-center">
                                            Professor
                                            {sortField === 'professor' &&
                                                (sortDirection === 'asc' ? (
                                                    <ChevronUp className="ml-1 h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="ml-1 h-4 w-4" />
                                                ))}
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                        onClick={() => handleSort('time')}
                                    >
                                        <div className="flex items-center">
                                            Time
                                            {sortField === 'time' &&
                                                (sortDirection === 'asc' ? (
                                                    <ChevronUp className="ml-1 h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="ml-1 h-4 w-4" />
                                                ))}
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                                        onClick={() => handleSort('room')}
                                    >
                                        <div className="flex items-center">
                                            Room
                                            {sortField === 'room' &&
                                                (sortDirection === 'asc' ? (
                                                    <ChevronUp className="ml-1 h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="ml-1 h-4 w-4" />
                                                ))}
                                        </div>
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                                    >
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {currentItems.map((schedule) => (
                                    <tr
                                        key={schedule.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center">
                                                <Calendar className="mr-2 h-5 w-5 text-gray-400" />
                                                <span className="text-sm text-gray-900">
                                                    {schedule.day_of_week}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">
                                                <Link
                                                    href={route(
                                                        'sections.show',
                                                        [
                                                            userSchool.id,
                                                            schedule.section.id,
                                                        ],
                                                    )}
                                                    className="hover:text-blue-600 hover:underline"
                                                >
                                                    {
                                                        schedule.section.course
                                                            .title
                                                    }
                                                </Link>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Section{' '}
                                                {schedule.section.section_code}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {schedule.section.professor_profile
                                                    ?.user?.name || 'Not Assigned'}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Clock className="mr-2 h-5 w-5 text-gray-400" />
                                                {schedule.start_time} -{' '}
                                                {schedule.end_time}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <MapPin className="mr-2 h-5 w-5 text-gray-400" />
                                                {schedule.room
                                                    ? `Room ${schedule.room.room_number}, ${schedule.room.floor.building.name}`
                                                    : 'Online Class (No Room)'}
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <Link
                                                    href={route(
                                                        'sections.show',
                                                        [
                                                            userSchool.id,
                                                            schedule.section.id,
                                                        ],
                                                    )}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    View Section
                                                </Link>
                                                {auth.can.update_schedule && (
                                                    <Link
                                                        href={route(
                                                            'schedules.edit',
                                                            [
                                                                userSchool.id,
                                                                schedule.id,
                                                            ],
                                                        )}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Edit
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Schedules Grid View */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                        {currentItems.map((schedule) => (
                            <div
                                key={schedule.id}
                                className="overflow-hidden rounded-lg border bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
                            >
                                <div className="border-b bg-blue-50 px-4 py-3">
                                    <h3 className="text-md truncate font-medium text-gray-900">
                                        {schedule.section.course.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Section {schedule.section.section_code}
                                    </p>
                                </div>
                                <div className="space-y-3 p-4">
                                    <div className="flex items-center text-sm">
                                        <Calendar className="mr-2 h-5 w-5 text-gray-400" />
                                        <span className="text-gray-700">
                                            {schedule.day_of_week}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <Clock className="mr-2 h-5 w-5 text-gray-400" />
                                        <span className="text-gray-700">
                                            {schedule.start_time} -{' '}
                                            {schedule.end_time}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <div className="mr-2 h-5 w-5 flex-shrink-0 text-gray-400">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-700">
                                            {schedule.section.professor_profile?.user?.name ||
                                                'Not Assigned'}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <MapPin className="mr-2 h-5 w-5 text-gray-400" />
                                        <span className="text-gray-700">
                                            {schedule.room
                                                ? `Room ${schedule.room.room_number}, ${schedule.room.floor.building.name}`
                                                : 'Online Class (No Room)'}
                                        </span>
                                    </div>
                                </div>
                                {auth.can.update_schedule && (
                                    <div className="flex justify-between border-t bg-gray-50 px-4 py-3">
                                        <Link
                                            href={route('sections.show', [
                                                userSchool.id,
                                                schedule.section.id,
                                            ])}
                                            className="text-sm text-blue-600 hover:text-blue-900"
                                        >
                                            View Section
                                        </Link>
                                        <Link
                                            href={route('schedules.edit', [
                                                userSchool.id,
                                                schedule.id,
                                            ])}
                                            className="text-sm text-blue-600 hover:text-blue-900"
                                        >
                                            Edit Schedule
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Calendar View */}
                {viewMode === 'calendar' && (
                    <div className="p-4">
                        <div className="mb-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Schedule Calendar
                                </h3>

                                {/* Calendar view type selector - show different options based on role */}
                                {userRole <= 3 && !isProfessor && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() =>
                                                setCalendarViewType('default')
                                            }
                                            className={`rounded-md px-3 py-1.5 text-sm ${
                                                calendarViewType === 'default'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            <CalendarDays className="mr-1 inline-block h-4 w-4" />
                                            Weekly View
                                        </button>
                                        <button
                                            onClick={() =>
                                                setCalendarViewType('room')
                                            }
                                            className={`rounded-md px-3 py-1.5 text-sm ${
                                                calendarViewType === 'room'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            <Building className="mr-1 inline-block h-4 w-4" />
                                            Room View
                                        </button>
                                    </div>
                                )}

                                {/* Show only personal schedule option for professors */}
                                {isProfessor && (
                                    <div className="text-sm text-blue-600">
                                        <span className="mr-2">📋</span>
                                        Your Teaching Schedule
                                    </div>
                                )}
                            </div>
                            <p className="mt-1 text-sm text-gray-500">
                                {calendarViewType === 'room'
                                    ? 'View schedules organized by room to see availability and utilization'
                                    : calendarViewType === 'professor'
                                      ? 'Your personal teaching schedule for the current term'
                                      : 'View all schedules in a weekly calendar format'}
                            </p>
                        </div>
                        <ScheduleCalendar
                            schedules={filteredSchedules}
                            showWeekView={true}
                            userRole={userRole}
                            rooms={rooms || []}
                            viewType={calendarViewType}
                        />
                    </div>
                )}

                {/* Pagination (only show for list and grid views) */}
                {viewMode !== 'calendar' && totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
                        <div>
                            <button
                                className="rounded-md border px-3 py-1 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:items-center">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`mx-1 rounded-md px-3 py-1 text-sm font-medium ${
                                        currentPage === i + 1
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <div>
                            <button
                                className="rounded-md border px-3 py-1 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {currentItems.length === 0 && viewMode !== 'calendar' && (
                    <div className="p-6 text-center text-gray-500">
                        <Filter className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                        <p className="mb-1 text-lg font-medium">
                            No schedules found
                        </p>
                        <p className="text-sm">
                            {selectedDay !== 'All' ||
                            filterOptions.professor !== 'All' ||
                            filterOptions.course !== 'All' ||
                            searchTerm
                                ? 'Try adjusting your filters or search query'
                                : 'There are no schedules created yet'}
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
