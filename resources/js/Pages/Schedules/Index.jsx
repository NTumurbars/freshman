import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Calendar, Clock, MapPin, ChevronDown, ChevronUp, Search, Filter, LayoutGrid, List, CalendarDays, Building } from 'lucide-react';
import ScheduleCalendar from '@/Components/UI/ScheduleCalendar';

export default function Index({ auth, schedules, rooms = [], isProfessor = false }) {
    const [selectedDay, setSelectedDay] = useState('All');
    const days = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
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
    const professors = ['All', ...new Set(schedules.map(s => s.section.professor?.name).filter(Boolean))];
    const courses = ['All', ...new Set(schedules.map(s => s.section.course.title))];

    // Add state for calendar view type
    const [calendarViewType, setCalendarViewType] = useState(() => {
        if (userRole <= 2) return 'room'; // Admin and School Admin
        if (isProfessor) return 'professor'; // Professor 
        return 'default'; // Others
    });

    // Filter schedules based on all criteria
    const filteredSchedules = schedules
        .filter(schedule => selectedDay === 'All' || schedule.day_of_week === selectedDay)
        .filter(schedule => filterOptions.professor === 'All' || schedule.section.professor?.name === filterOptions.professor)
        .filter(schedule => filterOptions.course === 'All' || schedule.section.course.title === filterOptions.course)
        .filter(schedule => {
            if (!searchTerm) return true;
            const searchLower = searchTerm.toLowerCase();
            return (
                (schedule.section?.course?.title && schedule.section.course.title.toLowerCase().includes(searchLower)) ||
                (schedule.section?.professor?.name || '').toLowerCase().includes(searchLower) ||
                (schedule.room?.room_number && schedule.room.room_number.toString().includes(searchLower)) ||
                (schedule.day_of_week && schedule.day_of_week.toLowerCase().includes(searchLower)) ||
                (schedule.location_type && schedule.location_type.toLowerCase().includes(searchLower))
            );
        });

    // Sort schedules
    const sortedSchedules = [...filteredSchedules].sort((a, b) => {
        let compareA, compareB;
        
        if (sortField === 'course') {
            compareA = a.section?.course?.title || '';
            compareB = b.section?.course?.title || '';
        } else if (sortField === 'professor') {
            compareA = a.section?.professor?.name || '';
            compareB = b.section?.professor?.name || '';
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
    const currentItems = sortedSchedules.slice(indexOfFirstItem, indexOfLastItem);
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
        <AppLayout userRole={userRole} school={userSchool}>
            <Head title="Schedules" />
            <meta name="school-id" content={userSchool.id} />

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

            {/* Search and Filters */}
            <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <label htmlFor="schedule-search" className="block text-sm font-medium text-gray-700 mb-1">
                                Search
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="schedule-search"
                                    type="text"
                                    placeholder="Search schedules..."
                                    className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
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
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        onClick={() => setSearchTerm('')}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Professor Filter */}
                        <div className="relative">
                            <label htmlFor="professor-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                Professor
                            </label>
                            <select
                                id="professor-filter"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={filterOptions.professor}
                                onChange={(e) => setFilterOptions({...filterOptions, professor: e.target.value})}
                            >
                                {professors.map(prof => (
                                    <option key={prof} value={prof}>{prof}</option>
                                ))}
                            </select>
                        </div>

                        {/* Course Filter */}
                        <div className="relative">
                            <label htmlFor="course-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                Course
                            </label>
                            <select
                                id="course-filter"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                value={filterOptions.course}
                                onChange={(e) => setFilterOptions({...filterOptions, course: e.target.value})}
                            >
                                {courses.map(course => (
                                    <option key={course} value={course}>{course}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Day Filter */}
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

                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div className="flex items-center">
                        <span className="text-sm text-gray-700">
                            Showing <span className="font-medium">{sortedSchedules.length > 0 ? indexOfFirstItem + 1 : 0}</span> to <span className="font-medium">{Math.min(indexOfLastItem, sortedSchedules.length)}</span> of <span className="font-medium">{sortedSchedules.length}</span> schedules
                        </span>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        {/* View Toggle */}
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                                title="List view"
                            >
                                <List className="h-4 w-4 text-gray-600" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                                title="Grid view"
                            >
                                <LayoutGrid className="h-4 w-4 text-gray-600" />
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`p-1.5 rounded ${viewMode === 'calendar' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                                title="Calendar view"
                            >
                                <CalendarDays className="h-4 w-4 text-gray-600" />
                            </button>
                        </div>
                        
                        {/* Items per page (only show for list and grid views) */}
                        {viewMode !== 'calendar' && (
                            <div className="relative">
                                <select
                                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                                    value={itemsPerPage}
                                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
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
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('day_of_week')}
                                    >
                                        <div className="flex items-center">
                                            Day
                                            {sortField === 'day_of_week' && (
                                                sortDirection === 'asc' ? 
                                                <ChevronUp className="h-4 w-4 ml-1" /> : 
                                                <ChevronDown className="h-4 w-4 ml-1" />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('course')}
                                    >
                                        <div className="flex items-center">
                                            Course
                                            {sortField === 'course' && (
                                                sortDirection === 'asc' ? 
                                                <ChevronUp className="h-4 w-4 ml-1" /> : 
                                                <ChevronDown className="h-4 w-4 ml-1" />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('professor')}
                                    >
                                        <div className="flex items-center">
                                            Professor
                                            {sortField === 'professor' && (
                                                sortDirection === 'asc' ? 
                                                <ChevronUp className="h-4 w-4 ml-1" /> : 
                                                <ChevronDown className="h-4 w-4 ml-1" />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('time')}
                                    >
                                        <div className="flex items-center">
                                            Time
                                            {sortField === 'time' && (
                                                sortDirection === 'asc' ? 
                                                <ChevronUp className="h-4 w-4 ml-1" /> : 
                                                <ChevronDown className="h-4 w-4 ml-1" />
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        scope="col" 
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                        onClick={() => handleSort('room')}
                                    >
                                        <div className="flex items-center">
                                            Room
                                            {sortField === 'room' && (
                                                sortDirection === 'asc' ? 
                                                <ChevronUp className="h-4 w-4 ml-1" /> : 
                                                <ChevronDown className="h-4 w-4 ml-1" />
                                            )}
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentItems.map(schedule => (
                                    <tr key={schedule.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                                                <span className="text-sm text-gray-900">{schedule.day_of_week}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                <Link 
                                                    href={route('sections.show', [userSchool.id, schedule.section.id])} 
                                                    className="hover:text-blue-600 hover:underline"
                                                >
                                                    {schedule.section.course.title}
                                                </Link>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Section {schedule.section.section_code}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {schedule.section.professor?.name || 'Not Assigned'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <Clock className="h-5 w-5 mr-2 text-gray-400" />
                                                {schedule.start_time} - {schedule.end_time}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-900">
                                                <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                                                {schedule.room ? `Room ${schedule.room.room_number}, ${schedule.room.floor.building.name}` : 'Online Class (No Room)'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <Link
                                                    href={route('sections.show', [userSchool.id, schedule.section.id])}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    View Section
                                                </Link>
                                                {auth.can.update_schedule && (
                                                    <Link
                                                        href={route('schedules.edit', [userSchool.id, schedule.id])}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {currentItems.map(schedule => (
                            <div key={schedule.id} className="border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden bg-white">
                                <div className="px-4 py-3 bg-blue-50 border-b">
                                    <h3 className="text-md font-medium text-gray-900 truncate">
                                        {schedule.section.course.title}
                                    </h3>
                                    <p className="text-sm text-gray-500">Section {schedule.section.section_code}</p>
                                </div>
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center text-sm">
                                        <Calendar className="h-5 w-5 mr-2 text-gray-400" />
                                        <span className="text-gray-700">{schedule.day_of_week}</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <Clock className="h-5 w-5 mr-2 text-gray-400" />
                                        <span className="text-gray-700">{schedule.start_time} - {schedule.end_time}</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <div className="flex-shrink-0 h-5 w-5 mr-2 text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                                            </svg>
                                        </div>
                                        <span className="text-gray-700">{schedule.section.professor?.name || 'Not Assigned'}</span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <MapPin className="h-5 w-5 mr-2 text-gray-400" />
                                        <span className="text-gray-700">
                                            {schedule.room ? `Room ${schedule.room.room_number}, ${schedule.room.floor.building.name}` : 'Online Class (No Room)'}
                                        </span>
                                    </div>
                                </div>
                                {auth.can.update_schedule && (
                                    <div className="px-4 py-3 bg-gray-50 border-t flex justify-between">
                                        <Link
                                            href={route('sections.show', [userSchool.id, schedule.section.id])}
                                            className="text-sm text-blue-600 hover:text-blue-900"
                                        >
                                            View Section
                                        </Link>
                                        <Link
                                            href={route('schedules.edit', [userSchool.id, schedule.id])}
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
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                                <h3 className="text-lg font-medium text-gray-900">Schedule Calendar</h3>
                                
                                {/* Calendar view type selector - show different options based on role */}
                                {userRole <= 3 && !isProfessor && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setCalendarViewType('default')}
                                            className={`px-3 py-1.5 text-sm rounded-md ${
                                                calendarViewType === 'default' 
                                                    ? 'bg-blue-100 text-blue-700' 
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            <CalendarDays className="inline-block h-4 w-4 mr-1" />
                                            Weekly View
                                        </button>
                                        <button
                                            onClick={() => setCalendarViewType('room')}
                                            className={`px-3 py-1.5 text-sm rounded-md ${
                                                calendarViewType === 'room' 
                                                    ? 'bg-blue-100 text-blue-700' 
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                        >
                                            <Building className="inline-block h-4 w-4 mr-1" />
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
                            <p className="text-sm text-gray-500 mt-1">
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
                    <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                        <div>
                            <button
                                className="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                    className={`mx-1 px-3 py-1 rounded-md text-sm font-medium ${
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
                                className="px-3 py-1 border rounded-md text-sm font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                        <Filter className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                        <p className="text-lg font-medium mb-1">No schedules found</p>
                        <p className="text-sm">
                            {selectedDay !== 'All' || filterOptions.professor !== 'All' || filterOptions.course !== 'All' || searchTerm
                                ? 'Try adjusting your filters or search query'
                                : 'There are no schedules created yet'}
                        </p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
