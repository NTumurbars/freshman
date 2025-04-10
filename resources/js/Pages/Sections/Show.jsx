import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
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
const ProfessorInfo = ({ professor }) => (
    <div className="flex items-center">
        <User className="mr-1 h-4 w-4" />
        {professor?.user?.name || 'Not assigned'}
        {professor?.title && (
            <span className="text-xs text-gray-500"> ({professor.title})</span>
        )}
    </div>
);

export default function Show({ section, school }) {
    useEffect(() => {
        console.log('Section data:', section);
        console.log('Section schedules:', section.schedules);
        if (section.schedules && section.schedules.length > 0) {
            console.log('First schedule:', section.schedules[0]);
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
                            {section.course?.title || 'Section Details'}
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
                            {!section.schedules ||
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
                            )}
                        </div>
                        <div className="px-6 py-4">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="flex items-center text-sm font-medium text-gray-500">
                                        <BookOpen className="mr-1 h-4 w-4" />{' '}
                                        Course
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {section.course?.title || 'N/A'}
                                        <span className="text-xs text-gray-500">
                                            {' '}
                                            ({section.course?.code || 'N/A'})
                                        </span>
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
                                            ? `${groupedSchedules[0].room.room_number} (${
                                                  groupedSchedules[0].room.floor
                                                      ?.building?.name || ''
                                              })`
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
                            <div className="space-y-6 px-6 py-4">
                                {groupedSchedules.map((scheduleGroup, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-md bg-blue-50 p-4"
                                    >
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <Clock className="h-5 w-5 text-blue-400" />
                                            </div>
                                            <div className="ml-3 w-full">
                                                <h3 className="text-sm font-medium text-blue-800">
                                                    {scheduleGroup.pattern}
                                                </h3>
                                                <div className="mt-2 text-sm text-blue-700">
                                                    <p>
                                                        <span className="font-medium">
                                                            Time:
                                                        </span>{' '}
                                                        {scheduleGroup.start_time.substring(
                                                            0,
                                                            5,
                                                        )}{' '}
                                                        -{' '}
                                                        {scheduleGroup.end_time.substring(
                                                            0,
                                                            5,
                                                        )}
                                                    </p>
                                                    <p className="mt-1">
                                                        <span className="font-medium">
                                                            Room:
                                                        </span>{' '}
                                                        {scheduleGroup.room
                                                            ? `${scheduleGroup.room.room_number} (${
                                                                  scheduleGroup
                                                                      .room
                                                                      .floor
                                                                      ?.building
                                                                      ?.name ||
                                                                  'Unknown Building'
                                                              }) - Capacity: ${scheduleGroup.room.capacity}`
                                                            : 'No room assigned'}
                                                    </p>
                                                    {scheduleGroup.location_type &&
                                                        scheduleGroup.location_type !==
                                                            'in_person' && (
                                                            <>
                                                                <p className="mt-1">
                                                                    <span className="font-medium">
                                                                        Type:
                                                                    </span>{' '}
                                                                    {scheduleGroup.location_type ===
                                                                    'virtual'
                                                                        ? 'Virtual (Online)'
                                                                        : scheduleGroup.location_type ===
                                                                            'hybrid'
                                                                          ? 'Hybrid'
                                                                          : 'In Person'}
                                                                </p>
                                                                {scheduleGroup.virtual_meeting_url && (
                                                                    <p className="mt-1">
                                                                        <span className="font-medium">
                                                                            Meeting
                                                                            Link:
                                                                        </span>{' '}
                                                                        <a
                                                                            href={
                                                                                scheduleGroup.virtual_meeting_url
                                                                            }
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-blue-800 underline hover:text-blue-900"
                                                                        >
                                                                            Join
                                                                            Meeting
                                                                        </a>
                                                                    </p>
                                                                )}
                                                            </>
                                                        )}
                                                </div>
                                                {scheduleGroup.group.length >
                                                    1 && (
                                                    <div className="mt-3 border-t border-blue-200 pt-3">
                                                        <h4 className="mb-2 text-xs font-medium text-blue-800">
                                                            Individual
                                                            Schedules:
                                                        </h4>
                                                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                            {scheduleGroup.group.map(
                                                                (
                                                                    schedule,
                                                                    i,
                                                                ) => (
                                                                    <div
                                                                        key={i}
                                                                        className="flex items-center justify-between"
                                                                    >
                                                                        <span className="text-xs">
                                                                            {formatIndividualSchedule(
                                                                                schedule,
                                                                            )}
                                                                        </span>
                                                                        <Link
                                                                            href={route(
                                                                                'schedules.edit',
                                                                                [
                                                                                    school.id,
                                                                                    schedule.id,
                                                                                ],
                                                                            )}
                                                                            className="text-xs text-blue-800 hover:text-blue-900"
                                                                        >
                                                                            Edit
                                                                        </Link>
                                                                    </div>
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="mt-4 flex justify-between">
                                                    {scheduleGroup.group
                                                        .length === 1 ? (
                                                        <Link
                                                            href={route(
                                                                'schedules.edit',
                                                                [
                                                                    school.id,
                                                                    scheduleGroup
                                                                        .group[0]
                                                                        .id,
                                                                ],
                                                            )}
                                                            className="inline-flex items-center rounded-md bg-blue-200 px-2.5 py-1.5 text-sm font-medium text-blue-800 hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                                                        >
                                                            <Edit className="mr-1 h-3 w-3" />
                                                            Edit Schedule
                                                        </Link>
                                                    ) : (
                                                        <span></span>
                                                    )}
                                                    <Link
                                                        href={route(
                                                            'schedules.create',
                                                            {
                                                                school: school.id,
                                                                section_id:
                                                                    section.id,
                                                            },
                                                        )}
                                                        className="inline-flex items-center rounded-md bg-green-100 px-2.5 py-1.5 text-sm font-medium text-green-800 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                                                    >
                                                        <CalendarPlus className="mr-1 h-3 w-3" />
                                                        Add Schedule
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-8 text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                    <Calendar className="h-6 w-6 text-gray-400" />
                                </div>
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                                    No Schedule Assigned
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    This section doesn't have a schedule yet.
                                    Create one to assign time and location.
                                </p>
                                <div className="mt-6">
                                    <Link
                                        href={route('schedules.create', {
                                            school: school.id,
                                            section_id: section.id,
                                        })}
                                        className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                    >
                                        <CalendarPlus className="mr-1.5 h-4 w-4" />
                                        Add Schedule
                                    </Link>
                                </div>
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
                                                    {registration.student
                                                        ?.name ||
                                                        'Unknown Student'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {registration.student
                                                        ?.email || ''}
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
