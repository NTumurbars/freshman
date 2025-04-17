import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    CalendarPlus,
    ChevronLeft,
    Clock,
    Edit,
    MapPin,
    User,
    Users,
} from 'lucide-react';
import { useEffect } from 'react';

// Helper component to render professor info
const ProfessorInfo = ({ professor, school }) => (
    <div className="flex items-center">
        <User className="mr-1 h-4 w-4" />
        {professor?.user ? (
            <Link
                href={route('users.show', {
                    school: school?.id,
                    user: professor.user.id,
                })}
                className="text-blue-600 hover:underline"
            >
                {professor.user.name}
            </Link>
        ) : 'Not assigned'}
        {professor?.title && (
            <span className="text-xs text-gray-500"> ({professor.title})</span>
        )}
    </div>
);

export default function Show({ section, school }) {
    const { auth } = usePage().props;
    const isSchoolAdmin = auth.user.role.name === 'school_admin' || auth.user.role.name === 'super_admin';

    useEffect(() => {
        console.log('Section full data object:', section);
        console.log('Section data:', section);
        console.log('Section schedules:', section.schedules);
        if (section.schedules && section.schedules.length > 0) {
            console.log('First schedule:', section.schedules[0]);
        }
        console.log('Course registrations:', section.courseRegistrations);
        console.log('Section has courseRegistrations property:', section.hasOwnProperty('courseRegistrations'));
        if (section.courseRegistrations && section.courseRegistrations.length > 0) {
            console.log('First registration:', section.courseRegistrations[0]);
            console.log('Student data:', section.courseRegistrations[0].student);
        }
    }, [section]);

    // Helper: Compare two arrays for equality.
    const arraysEqual = (a, b) => {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    };

    // Group schedules by time and deduce a pattern.
    const groupSchedulesByPattern = (schedules) => {
        if (!Array.isArray(schedules) || schedules.length === 0) return [];

        const timeGroups = {};
        schedules.forEach((schedule) => {
            const timeKey = `${schedule.start_time}-${schedule.end_time}`;
            if (!timeGroups[timeKey]) timeGroups[timeKey] = [];
            timeGroups[timeKey].push(schedule);
        });

        const result = [];
        Object.values(timeGroups).forEach((group) => {
            const sortedGroup = [...group].sort((a, b) => {
                const days = [
                    'Sunday',
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                ];
                return (
                    days.indexOf(a.day_of_week) - days.indexOf(b.day_of_week)
                );
            });
            const days = sortedGroup.map((s) => s.day_of_week);
            let patternName = '';

            if (arraysEqual(days, ['Monday', 'Wednesday', 'Friday'])) {
                patternName = 'MWF';
            } else if (arraysEqual(days, ['Tuesday', 'Thursday'])) {
                patternName = 'TTh';
            } else if (arraysEqual(days, ['Monday', 'Wednesday'])) {
                patternName = 'MW';
            } else if (
                arraysEqual(days, [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                ])
            ) {
                patternName = 'Weekly';
            }

            result.push({
                group: sortedGroup,
                pattern:
                    patternName || (days.length > 1 ? days.join('/') : days[0]),
                start_time: sortedGroup[0].start_time,
                end_time: sortedGroup[0].end_time,
                room: sortedGroup[0].room, // Assumes room consistency
                location_type: sortedGroup[0].location_type,
                virtual_meeting_url: sortedGroup[0].virtual_meeting_url,
            });
        });
        return result;
    };

    // Format a grouped schedule display.
    const formatSchedule = (schedule) => {
        if (!schedule) return 'Not scheduled';
        const formatTime = (time) => (time ? time.substring(0, 5) : '');
        return `${schedule.pattern}, ${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`;
    };

    // Format an individual schedule.
    const formatIndividualSchedule = (schedule) => {
        if (!schedule) return 'Not scheduled';
        const formatTime = (time) => (time ? time.substring(0, 5) : '');
        return `${schedule.day_of_week}, ${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}`;
    };

    const groupedSchedules = groupSchedulesByPattern(section.schedules || []);

    // Group required features by category.
    const groupFeaturesByCategory = (features) => {
        if (!Array.isArray(features)) return {};
        return features.reduce((acc, feature) => {
            const category = feature.category || 'Other';
            if (!acc[category]) acc[category] = [];
            acc[category].push(feature);
            return acc;
        }, {});
    };

    const featuresGrouped = groupFeaturesByCategory(section.requiredFeatures);

    return (
        <AppLayout>
            <Head
                title={`Section: ${section.section_code} - ${section.course?.title || ''}`}
            />

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
                            {section.course ? (
                                <Link
                                    href={route('courses.show', {
                                        school: school.id,
                                        course: section.course.id,
                                    })}
                                    className="hover:text-blue-600 hover:underline"
                                >
                                    {section.course.title || 'Section Details'}
                                </Link>
                            ) : 'Section Details'}
                        </h1>
                        <div className="flex items-center">
                            <span className="mr-2 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                {section.section_code}
                            </span>
                            <span className="text-gray-600">
                                {section.course?.code || ''}
                            </span>
                        </div>
                    </div>
                    {isSchoolAdmin && (
                        <div className="flex space-x-3">
                            <Link
                                href={route('sections.edit', [
                                    school.id,
                                    section.id,
                                ])}
                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Section
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Section Info */}
                <div className="col-span-2 space-y-6">
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <h2 className="text-lg font-medium text-gray-900">
                                Section Information
                            </h2>
                            {isSchoolAdmin && (!section.schedules ||
                            section.schedules.length === 0 ? (
                                <Link
                                    href={route('schedules.create', {
                                        school: school.id,
                                        section_id: section.id,
                                    })}
                                    className="inline-flex items-center rounded-md bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                                >
                                    <CalendarPlus className="mr-1.5 h-4 w-4" />
                                    Add Schedule
                                </Link>
                            ) : (
                                <Link
                                    href={route('schedules.edit', [
                                        school.id,
                                        section.schedules[0].id,
                                    ])}
                                    className="inline-flex items-center rounded-md bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2"
                                >
                                    <Calendar className="mr-1.5 h-4 w-4" />
                                    Edit Schedule
                                </Link>
                            ))}
                        </div>
                        <div className="px-6 py-4">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="flex items-center text-sm font-medium text-gray-500">
                                        <BookOpen className="mr-1 h-4 w-4" />{' '}
                                        Course
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {section.course ? (
                                            <>
                                                <Link
                                                    href={route('courses.show', {
                                                        school: school.id,
                                                        course: section.course.id,
                                                    })}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {section.course.title || 'N/A'}
                                                </Link>
                                                <span className="text-xs text-gray-500">
                                                    {' '}
                                                    ({section.course.code || 'N/A'})
                                                </span>
                                            </>
                                        ) : 'N/A'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="flex items-center text-sm font-medium text-gray-500">
                                        <Calendar className="mr-1 h-4 w-4" />{' '}
                                        Term
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {section.term?.name || 'Not assigned'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="flex items-center text-sm font-medium text-gray-500">
                                        <User className="mr-1 h-4 w-4" />{' '}
                                        Professor
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        <ProfessorInfo
                                            professor={
                                                section.professor_profile
                                            }
                                            school={school}
                                        />
                                    </dd>
                                </div>
                                <div>
                                    <dt className="flex items-center text-sm font-medium text-gray-500">
                                        <Users className="mr-1 h-4 w-4" />{' '}
                                        Enrollment
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {section.students_count} /{' '}
                                        {section.effective_capacity ||
                                            'No limit'}
                                        {section.capacity && (
                                            <span className="ml-1 text-xs text-gray-500">
                                                (Section capacity:{' '}
                                                {section.capacity})
                                            </span>
                                        )}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="flex items-center text-sm font-medium text-gray-500">
                                        <MapPin className="mr-1 h-4 w-4" /> Room
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {groupedSchedules.length > 0 &&
                                        groupedSchedules[0].room
                                            ? (
                                                <Link
                                                    href={route('rooms.show', {
                                                        school: school.id,
                                                        room: groupedSchedules[0].room.id,
                                                    })}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {`${groupedSchedules[0].room.room_number} (${
                                                        groupedSchedules[0].room.floor
                                                            ?.building?.name || ''
                                                    })`}
                                                </Link>
                                            )
                                            : 'Not assigned'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="flex items-center text-sm font-medium text-gray-500">
                                        <Clock className="mr-1 h-4 w-4" />{' '}
                                        Schedule
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {groupedSchedules.length > 0
                                            ? formatSchedule(
                                                  groupedSchedules[0],
                                              )
                                            : 'Not scheduled'}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Schedule Information */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <h2 className="text-lg font-medium text-gray-900">
                                Schedule Information
                            </h2>
                        </div>
                        {groupedSchedules.length > 0 ? (
                            <div className="space-y-4 px-6 py-4">
                                {groupedSchedules.map((scheduleGroup, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-md border border-blue-100 bg-white shadow-sm transition-all hover:shadow-md"
                                    >
                                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <Calendar className="h-5 w-5 text-blue-600" />
                                                    <h3 className="ml-2 text-base font-semibold text-blue-900">
                                                        {scheduleGroup.pattern}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center rounded-full bg-blue-200 px-3 py-1">
                                                    <Clock className="mr-1 h-3.5 w-3.5 text-blue-700" />
                                                    <span className="text-xs font-medium text-blue-800">
                                                        {scheduleGroup.start_time.substring(0, 5)} - {scheduleGroup.end_time.substring(0, 5)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div className="flex items-start">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                        <MapPin className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-xs font-medium uppercase text-gray-500">Location</p>
                                                        {scheduleGroup.room ? (
                                                            <div className="mt-1">
                                                                <Link
                                                                    href={route('rooms.show', {
                                                                        school: school.id,
                                                                        room: scheduleGroup.room.id,
                                                                    })}
                                                                    className="text-sm font-medium text-blue-600 hover:underline"
                                                                >
                                                                    {scheduleGroup.room.room_number}
                                                                </Link>
                                                                <p className="text-sm text-gray-600">
                                                                    {scheduleGroup.room.floor?.building?.name || 'Unknown Building'}
                                                                </p>
                                                                <p className="mt-1 text-xs text-gray-500">
                                                                    Capacity: {scheduleGroup.room.capacity} students
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            <p className="mt-1 text-sm text-gray-700">No room assigned</p>
                                                        )}
                                                    </div>
                                                </div>

                                                {scheduleGroup.location_type && scheduleGroup.location_type !== 'in_person' && (
                                                    <div className="flex items-start">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                                                                <path d="M17 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                                                                <path d="M7 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                                                                <path d="M12 7m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                                                                <path d="M12 17m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                                                                <path d="M12 12l0 .01" />
                                                            </svg>
                                                        </div>
                                                        <div className="ml-3">
                                                            <p className="text-xs font-medium uppercase text-gray-500">Meeting Type</p>
                                                            <p className="mt-1 text-sm font-medium text-gray-800">
                                                                {scheduleGroup.location_type === 'virtual' ? 'Virtual (Online)' : 'Hybrid'}
                                                            </p>
                                                            {scheduleGroup.virtual_meeting_url && (
                                                                <a
                                                                    href={scheduleGroup.virtual_meeting_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="mt-1.5 inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 hover:bg-purple-200"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-3.5 w-3.5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <path d="M15 10l-4 4l6 6l4 -16l-16 4l6 6l4 -4" />
                                                                    </svg>
                                                                    Join Meeting
                                                                </a>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {scheduleGroup.group.length > 1 && (
                                                <div className="mt-4 border-t border-gray-100 pt-4">
                                                    <h4 className="mb-2 text-xs font-medium text-gray-600">
                                                        Individual Sessions
                                                    </h4>
                                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                                                        {scheduleGroup.group.map((schedule, i) => (
                                                            <div
                                                                key={i}
                                                                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                                                            >
                                                                <div className="flex items-center">
                                                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                                                    <span className="ml-2 text-xs font-medium text-gray-700">
                                                                        {schedule.day_of_week}
                                                                    </span>
                                                                </div>
                                                                {isSchoolAdmin && (
                                                                    <Link
                                                                        href={route('schedules.edit', [school.id, schedule.id])}
                                                                        className="rounded-md bg-white px-2 py-1 text-xs font-medium text-blue-600 shadow-sm hover:bg-blue-50 hover:text-blue-700"
                                                                    >
                                                                        Edit
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {isSchoolAdmin && (
                                                <div className="mt-4 flex justify-end space-x-3">
                                                    {scheduleGroup.group.length === 1 && (
                                                        <Link
                                                            href={route('schedules.edit', [school.id, scheduleGroup.group[0].id])}
                                                            className="inline-flex items-center rounded-md bg-white px-3 py-1.5 text-sm font-medium text-blue-600 shadow-sm ring-1 ring-inset ring-blue-200 hover:bg-blue-50"
                                                        >
                                                            <Edit className="mr-1.5 h-3.5 w-3.5" />
                                                            Edit
                                                        </Link>
                                                    )}
                                                    <Link
                                                        href={route('schedules.create', {
                                                            school: school.id,
                                                            section_id: section.id,
                                                        })}
                                                        className="inline-flex items-center rounded-md bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-600 shadow-sm ring-1 ring-inset ring-blue-200 hover:bg-blue-100"
                                                    >
                                                        <CalendarPlus className="mr-1.5 h-3.5 w-3.5" />
                                                        Add Schedule
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                                    <Calendar className="h-8 w-8 text-blue-500" />
                                </div>
                                <h3 className="mt-4 text-base font-semibold text-gray-900">
                                    No Schedule Assigned
                                </h3>
                                <p className="mt-1 max-w-md text-sm text-gray-500">
                                    This section doesn't have a schedule yet. Create one to assign time and location for students.
                                </p>
                                {isSchoolAdmin && (
                                    <div className="mt-6">
                                        <Link
                                            href={route('schedules.create', {
                                                school: school.id,
                                                section_id: section.id,
                                            })}
                                            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                        >
                                            <CalendarPlus className="mr-2 h-4 w-4" />
                                            Create Schedule
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Academic Information */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <h2 className="text-lg font-medium text-gray-900">
                                Academic Information
                            </h2>
                        </div>
                        <div className="px-6 py-4">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Department
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {section.course?.department?.name ||
                                            'N/A'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">
                                        Major
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {section.course?.major?.code
                                            ? section.course.major.code
                                            : 'None'}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Course Description */}
                    {section.course?.description && (
                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                                <h2 className="text-lg font-medium text-gray-900">
                                    Course Description
                                </h2>
                            </div>
                            <div className="px-6 py-4">
                                <p className="text-sm text-gray-700">
                                    {section.course.description}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Required Room Features */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <h2 className="text-lg font-medium text-gray-900">
                                Required Room Features
                            </h2>
                        </div>
                        <div className="px-6 py-4">
                            {Object.keys(featuresGrouped).length > 0 ? (
                                Object.entries(featuresGrouped).map(
                                    ([category, features]) => (
                                        <div key={category} className="mb-4">
                                            <h3 className="mb-2 text-sm font-medium text-gray-700">
                                                {category}
                                            </h3>
                                            <ul className="space-y-2">
                                                {features.map((feature) => (
                                                    <li
                                                        key={feature.id}
                                                        className="flex items-center text-sm"
                                                    >
                                                        <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                                                        {feature.name}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ),
                                )
                            ) : (
                                <p className="text-sm text-gray-500">
                                    No special features required
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Enrolled Students */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <h2 className="text-lg font-medium text-gray-900">
                                Enrolled Students
                            </h2>
                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                {section.courseRegistrations?.length || 0}
                            </span>
                        </div>
                        <div className="px-6 py-4">
                            {section.courseRegistrations &&
                            section.courseRegistrations.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {section.courseRegistrations.map(
                                        (registration) => (
                                            <li
                                                key={registration.id}
                                                className="py-2"
                                            >
                                                <p className="text-sm font-medium text-gray-900">
                                                    {(registration.student && registration.student.name) ||
                                                     'Unknown Student'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {(registration.student && registration.student.email) ||
                                                     ''}
                                                </p>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    No students enrolled
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
