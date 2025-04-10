import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, Eye, Calendar, User, BookOpen, Clock, CalendarPlus } from 'lucide-react';
import { Badge } from '@tremor/react';

export default function Index({ sections, flash, school }) {
  const { auth } = usePage().props;
  const userRole = auth.user.role.id;
  const userSchool = auth.user.school;

  const [searchTerm, setSearchTerm] = useState('');
  const [termFilter, setTermFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Extract unique terms from sections for the term filter.
  const terms = useMemo(() => {
    const uniqueTerms = new Set();
    sections.forEach(section => {
      if (section.term) uniqueTerms.add(section.term.id);
    });
    return Array.from(uniqueTerms).map(id => sections.find(s => s.term?.id === id)?.term);
  }, [sections]);

  // Determine the status of a section.
  const getSectionStatus = (section) => {
    if (!section.term) return 'draft';
    if (section.students_count >= (section.course?.capacity || 0)) return 'full';
    if (section.schedules?.length > 0) return 'scheduled';
    return 'unscheduled';
  };

  // Filter sections based on search term, term, and status filters.
  const filteredSections = useMemo(() => {
    return sections.filter(section => {
      if (termFilter && section.term?.id !== parseInt(termFilter)) return false;

      if (statusFilter && getSectionStatus(section) !== statusFilter) return false;

      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        (section.section_code && section.section_code.toLowerCase().includes(searchLower)) ||
        (section.course?.title && section.course.title.toLowerCase().includes(searchLower)) ||
        (section.course?.code && section.course.code.toLowerCase().includes(searchLower)) ||
        (section.professor_profile?.user?.name && section.professor_profile.user.name.toLowerCase().includes(searchLower))
      );
    });
  }, [sections, searchTerm, termFilter, statusFilter]);

  // Helper: Check if two arrays are equal.
  const arraysEqual = (a, b) => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  // Group schedules by their start and end times and deduce a meeting pattern.
  const groupSchedulesByPattern = (schedules) => {
    if (!Array.isArray(schedules) || !schedules.length) return [];

    const timeGroups = {};
    schedules.forEach(schedule => {
      const timeKey = `${schedule.start_time}-${schedule.end_time}`;
      if (!timeGroups[timeKey]) timeGroups[timeKey] = [];
      timeGroups[timeKey].push(schedule);
    });

    const result = [];
    Object.values(timeGroups).forEach(group => {
      // Sort by day order.
      const sortedGroup = [...group].sort((a, b) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days.indexOf(a.day_of_week) - days.indexOf(b.day_of_week);
      });
      const days = sortedGroup.map(s => s.day_of_week);
      let patternName = '';

      // Check if a meeting pattern is predefined.
      const firstWithPattern = sortedGroup.find(s => s.meeting_pattern && s.meeting_pattern !== 'single');
      if (firstWithPattern) {
        switch (firstWithPattern.meeting_pattern) {
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
          default:
            patternName = '';
        }
      } else {
        // Fallback: deduce based on sorted days.
        if (arraysEqual(days, ['Monday', 'Wednesday', 'Friday'])) patternName = 'MWF';
        else if (arraysEqual(days, ['Tuesday', 'Thursday'])) patternName = 'TTh';
        else if (arraysEqual(days, ['Monday', 'Wednesday'])) patternName = 'MW';
        else if (arraysEqual(days, ['Tuesday', 'Friday'])) patternName = 'TF';
        else if (arraysEqual(days, ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])) patternName = 'Weekly';
      }

      result.push({
        group: sortedGroup,
        pattern: patternName || (days.length > 1 ? days.join('/') : days[0]),
        start_time: sortedGroup[0].start_time,
        end_time: sortedGroup[0].end_time,
        room: sortedGroup[0].room, // Assumes room is consistent across the group.
        location_type: sortedGroup[0].location_type,
        virtual_meeting_url: sortedGroup[0].virtual_meeting_url,
      });
    });
    return result;
  };

  // Display schedule details.
  const ScheduleInfo = ({ schedule }) => {
    const formatTime = (time) => (time ? time.substring(0, 5) : '');
    return (
      <div className="flex items-center text-xs text-gray-500">
        <Clock className="mr-1 h-3 w-3" />
        <span>
          <strong>{schedule.pattern}</strong>, {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
        </span>
      </div>
    );
  };

  // Display section status as a badge.
  const SectionStatusBadge = ({ section }) => {
    const badgeProps = { size: "xs" };

    if (section.status === 'full' || (section.effective_capacity && section.students_count >= section.effective_capacity)) {
      return <Badge color="red" {...badgeProps}>Full</Badge>;
    }

    if (section.effective_capacity && section.students_count >= section.effective_capacity * 0.9) {
      return <Badge color="orange" {...badgeProps}>Nearly Full</Badge>;
    }

    if (section.status === 'active' || section.status === 'open') {
      return <Badge color="green" {...badgeProps}>Open</Badge>;
    }

    if (section.status === 'canceled' || section.status === 'cancelled') {
      return <Badge color="red" {...badgeProps}>Canceled</Badge>;
    }

    if (section.status === 'pending') {
      return <Badge color="yellow" {...badgeProps}>Pending</Badge>;
    }

    if (section.status === 'waitlist') {
      return <Badge color="blue" {...badgeProps}>Waitlist</Badge>;
    }

    if (!section.schedules || section.schedules.length === 0) {
      return <Badge color="amber" {...badgeProps}>Unscheduled</Badge>;
    }

    return <Badge color="gray" {...badgeProps}>{section.status}</Badge>;
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
          {/* Search Input */}
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
              {terms.map((term) => (
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
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{flash.success}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sections Table */}
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Section</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Term</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Instructor</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Schedule</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Enrollment</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
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
                    {section.course?.code || 'N/A'}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                    {section.term?.name || 'Not assigned'}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <ProfessorInfo section={section} />
                </td>
                <td className="px-6 py-4">
                  {section.schedules && Array.isArray(section.schedules) && section.schedules.length > 0 ? (
                    <div className="space-y-2">
                      {groupSchedulesByPattern(section.schedules).map((scheduleGroup, idx) => (
                        <div key={idx}>
                          <ScheduleInfo schedule={scheduleGroup} />
                          {scheduleGroup.room && (
                            <div className="mt-1 text-xs text-gray-500">Room {scheduleGroup.room.room_number}</div>
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
                  <div className="flex flex-col">
                    <span className="font-medium">{section.students_count || 0}</span>
                    {section.effective_capacity && (
                      <span className="text-xs text-gray-500">
                        of {section.effective_capacity}
                        {section.capacity && section.effective_capacity !== section.capacity && (
                          <span> (limited to {section.capacity})</span>
                        )}
                      </span>
                    )}
                    {!section.effective_capacity && section.capacity && (
                      <span className="text-xs text-gray-500">of {section.capacity}</span>
                    )}
                    {!section.effective_capacity && !section.capacity && section.delivery_method === 'online' && (
                      <span className="text-xs text-gray-500">unlimited</span>
                    )}
                  </div>
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
                        href={
                          section.schedules.length === 1
                            ? route('schedules.edit', [userSchool.id, section.schedules[0].id])
                            : route('sections.show', [userSchool.id, section.id])
                        }
                        className="rounded p-1 text-gray-500 hover:bg-green-100 hover:text-green-600"
                        title={
                          section.schedules.length === 1 ? 'Edit schedule' : 'View all schedules'
                        }
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

// Component to display professor information.
const ProfessorInfo = ({ section }) => {
  const professorName = section.professor_profile?.user?.name || 'Not assigned';
  return (
    <div className="flex items-center text-sm text-gray-500">
      <User className="mr-2 h-4 w-4 text-gray-400" />
      {professorName}
    </div>
  );
};
