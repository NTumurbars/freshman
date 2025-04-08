import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useMemo, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Eye, Calendar, User, BookOpen, Grid, Clock, CalendarPlus } from 'lucide-react';
import { Badge } from '@tremor/react';

export default function Index({ sections, flash, school }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const userSchool = auth.user.school;
    const [searchTerm, setSearchTerm] = useState('');
    const [termFilter, setTermFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    
    // Debug sections data 
    useEffect(() => {
        console.log('Sections data:', sections);
        if (sections && sections.length > 0) {
            console.log('First section:', sections[0]);
            console.log('Schedules:', sections[0].schedules);
            console.log('Professor:', sections[0].professor);
        }
    }, [sections]);

    // Get unique terms for filter
    const terms = useMemo(() => {
        const uniqueTerms = new Set();
        sections.forEach(section => {
            if (section.term) {
                uniqueTerms.add(section.term.id);
            }
        });
        return [...uniqueTerms].map(id => {
            const term = sections.find(s => s.term?.id === id)?.term;
            return term;
        });
    }, [sections]);

    // Get section status
    const getSectionStatus = (section) => {
        if (!section.term) {
            return 'draft';
        } else if (section.number_of_students >= (section.course?.capacity || 0)) {
            return 'full';
        } else if (section.schedules && section.schedules.length > 0) {
            return 'scheduled';
        } else {
            return 'unscheduled';
        }
    };

    // Filter sections based on search term and filters
    const filteredSections = useMemo(() => {
        return sections.filter(section => {
            // Term filter
            if (termFilter && section.term?.id !== parseInt(termFilter)) {
                return false;
            }

            // Status filter
            if (statusFilter) {
                const status = getSectionStatus(section);
                if (status !== statusFilter) {
                    return false;
                }
            }

            // Search term filter
            if (!searchTerm) return true;
            const searchLower = searchTerm.toLowerCase();
            return (
                (section.section_code && section.section_code.toLowerCase().includes(searchLower)) ||
                (section.course?.title && section.course.title.toLowerCase().includes(searchLower)) ||
                (section.course?.course_code && section.course.course_code.toLowerCase().includes(searchLower)) ||
                (section.professor?.name && section.professor.name.toLowerCase().includes(searchLower))
            );
        });
    }, [sections, searchTerm, termFilter, statusFilter]);

    // Status badge for section
    const SectionStatusBadge = ({ section }) => {
        const status = getSectionStatus(section);
        
        switch (status) {
            case 'draft':
                return (
                    <Badge color="gray" size="sm">
                        Draft
                    </Badge>
                );
            case 'full':
                return (
                    <Badge color="red" size="sm">
                        Full
                    </Badge>
                );
            case 'scheduled':
                return (
                    <Badge color="green" size="sm">
                        Scheduled
                    </Badge>
                );
            case 'unscheduled':
                return (
                    <Badge color="amber" size="sm">
                        Unscheduled
                    </Badge>
                );
            default:
                return null;
        }
    };

    // Function to group schedules by time and pattern
    const groupSchedulesByPattern = (schedules) => {
        if (!Array.isArray(schedules) || schedules.length === 0) return [];
        
        // First, group by start and end time
        const timeGroups = {};
        schedules.forEach(schedule => {
            const timeKey = `${schedule.start_time}-${schedule.end_time}`;
            if (!timeGroups[timeKey]) {
                timeGroups[timeKey] = [];
            }
            timeGroups[timeKey].push(schedule);
        });
        
        // Then for each time group, check if they form a common pattern
        const result = [];
        Object.values(timeGroups).forEach(group => {
            // Sort by day of week to ensure consistent ordering
            const sortedGroup = [...group].sort((a, b) => {
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                return days.indexOf(a.day_of_week) - days.indexOf(b.day_of_week);
            });
            
            // Get array of days
            const days = sortedGroup.map(s => s.day_of_week);
            
            // Check if it's a standard pattern
            let patternName = '';
            
            // First check if any schedule in the group has a predefined meeting pattern
            const firstWithPattern = sortedGroup.find(s => s.meeting_pattern && s.meeting_pattern !== 'single');
            
            if (firstWithPattern && firstWithPattern.meeting_pattern !== 'single') {
                // Use the pattern name from our meeting patterns
                switch(firstWithPattern.meeting_pattern) {
                    case 'monday-wednesday-friday':
                        patternName = 'MWF';
                        break;
                    case 'tuesday-thursday':
                        patternName = 'TTh';
                        break;
                    case 'monday-wednesday':
                        patternName = 'MW';
                        break;
                    case 'tuesday-friday':
                        patternName = 'TF';
                        break;
                    case 'weekly':
                        patternName = 'Weekly';
                        break;
                }
            } else {
                // Fallback to using the actual days if no pattern is defined
                if (arraysEqual(days, ['Monday', 'Wednesday', 'Friday'])) {
                    patternName = 'MWF';
                } else if (arraysEqual(days, ['Tuesday', 'Thursday'])) {
                    patternName = 'TTh';
                } else if (arraysEqual(days, ['Monday', 'Wednesday'])) {
                    patternName = 'MW';
                } else if (arraysEqual(days, ['Tuesday', 'Friday'])) {
                    patternName = 'TF';
                } else if (arraysEqual(days, ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])) {
                    patternName = 'Weekly';
                }
            }
            
            // Create a merged schedule object
            result.push({
                group: sortedGroup,
                pattern: patternName || (days.length > 1 ? days.join('/') : days[0]),
                start_time: sortedGroup[0].start_time,
                end_time: sortedGroup[0].end_time,
                room: sortedGroup[0].room, // Use the first room (assuming all are the same)
                location_type: sortedGroup[0].location_type,
                virtual_meeting_url: sortedGroup[0].virtual_meeting_url
            });
        });
        
        return result;
    };
    
    // Helper to check if arrays are equal
    const arraysEqual = (a, b) => {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    };

    // Format schedule display for a group of schedules
    const ScheduleInfo = ({ schedule }) => {
        if (!schedule) return null;
        
        // Handle time format
        const formatTime = (time) => {
            if (!time) return '';
            // Handle both H:i and H:i:s formats
            return time.substring(0, 5); // Show only HH:MM part
        };
        
        return (
            <div className="flex items-center text-xs text-gray-500">
                <Clock className="mr-1 h-3 w-3" />
                <span>
                    <strong>{schedule.pattern}</strong>, {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                </span>
            </div>
        );
    };

    return (
        <AppLayout userRole={userRole} school={userSchool}>
            <Head title={`${userSchool.name} - Class Sections`} />

            <div className="mb-6 space-y-4">
                <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Class Sections</h1>
                        <p className="text-gray-600">{userSchool.name}</p>
                    </div>
                    <div className="flex space-x-2">
                        <Link
                            href={route('sections.calendar', userSchool.id)}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <Calendar className="mr-2 h-4 w-4" /> Calendar View
                        </Link>
                        <Link
                            href={route('sections.create', userSchool.id)}
                            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            <Plus className="mr-2 h-4 w-4" /> Create Section
                        </Link>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-6">
                    {/* Search */}
                    <div className="relative md:col-span-3">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Search by section code, course title or instructor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Term Filter */}
                    <div>
                        <select
                            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                            value={termFilter}
                            onChange={(e) => setTermFilter(e.target.value)}
                        >
                            <option value="">All Terms</option>
                            {terms.map(term => (
                                <option key={term.id} value={term.id}>
                                    {term.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                        <select
                            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="unscheduled">Unscheduled</option>
                            <option value="full">Full</option>
                            <option value="draft">Draft</option>
                        </select>
                    </div>

                    {/* Clear Filters */}
                    {(searchTerm || termFilter || statusFilter) && (
                        <div className="flex items-center">
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setTermFilter('');
                                    setStatusFilter('');
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">{flash.success}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Section</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Course</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Term</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Instructor</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Schedule</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredSections.map((section) => (
                            <tr key={section.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                    <div className="flex items-center">
                                        <BookOpen className="mr-2 h-4 w-4 text-gray-400" />
                                        {section.section_code}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">
                                        {section.course?.title || 'N/A'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {section.course?.course_code || 'N/A'}
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                                        {section.term?.name || 'Not assigned'}
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <User className="mr-2 h-4 w-4 text-gray-400" />
                                        {section.professor?.name || 'Not assigned'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {section.schedules && Array.isArray(section.schedules) && section.schedules.length > 0 ? (
                                        <div className="space-y-2">
                                            {groupSchedulesByPattern(section.schedules).map((scheduleGroup, idx) => (
                                                <div key={idx}>
                                                    <ScheduleInfo schedule={scheduleGroup} />
                                                    {scheduleGroup.room && (
                                                        <div className="mt-1 text-xs text-gray-500">
                                                            Room {scheduleGroup.room.room_number}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <Link
                                            href={route('schedules.create', { school: userSchool.id, section_id: section.id })}
                                            className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                                        >
                                            <CalendarPlus className="mr-1 h-3 w-3" />
                                            Add Schedule
                                        </Link>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                    <SectionStatusBadge section={section} />
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <Link
                                            href={route('sections.show', [userSchool.id, section.id])}
                                            className="rounded p-1 text-gray-500 hover:bg-blue-100 hover:text-blue-600"
                                            title="View details"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </Link>
                                        <Link
                                            href={route('sections.edit', [userSchool.id, section.id])}
                                            className="rounded p-1 text-gray-500 hover:bg-yellow-100 hover:text-yellow-600"
                                            title="Edit section"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </Link>
                                        
                                        {section.schedules && Array.isArray(section.schedules) && section.schedules.length > 0 ? (
                                            <Link
                                                href={section.schedules.length === 1 
                                                    ? route('schedules.edit', [userSchool.id, section.schedules[0].id])
                                                    : route('sections.show', [userSchool.id, section.id])}
                                                className="rounded p-1 text-gray-500 hover:bg-green-100 hover:text-green-600"
                                                title={section.schedules.length === 1 ? "Edit schedule" : "View all schedules"}
                                            >
                                                <Calendar className="h-5 w-5" />
                                            </Link>
                                        ) : (
                                            <Link
                                                href={route('schedules.create', { school: userSchool.id, section_id: section.id })}
                                                className="rounded p-1 text-gray-500 hover:bg-green-100 hover:text-green-600"
                                                title="Add schedule"
                                            >
                                                <CalendarPlus className="h-5 w-5" />
                                            </Link>
                                        )}
                                        
                                        <Link
                                            href={route('sections.destroy', [userSchool.id, section.id])}
                                            method="delete"
                                            as="button"
                                            className="rounded p-1 text-gray-500 hover:bg-red-100 hover:text-red-600"
                                            title="Delete section"
                                            onClick={(e) => {
                                                if (!confirm('Are you sure you want to delete this section?')) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredSections.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">
                                    {searchTerm || termFilter || statusFilter
                                        ? 'No sections found matching your search criteria'
                                        : 'No sections found. Create your first section to get started.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
