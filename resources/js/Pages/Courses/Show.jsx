import AppLayout from '@/Layouts/AppLayout';
import { CalendarIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Head, Link } from '@inertiajs/react';
import { Badge, Card, Title } from '@tremor/react';

export default function Show({ course, school }) {
    // Debug output
    console.log('Course data:', course);
    console.log('School data:', school);

    if (course.sections && course.sections.length > 0) {
        console.log('First section:', course.sections[0]);
        console.log('Section term data:', course.sections[0].term);
        console.log('Professor data:', course.sections[0].professor_profile);
    }

    // Helper function to format time
    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString;
    };

    // Helper function to get status badge color
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'active':
                return 'green';
            case 'canceled':
                return 'red';
            case 'full':
                return 'amber';
            case 'pending':
                return 'gray';
            default:
                return 'gray';
        }
    };

    // Helper function to get delivery method badge color
    const getDeliveryMethodBadgeColor = (method) => {
        switch (method) {
            case 'in-person':
                return 'blue';
            case 'online':
                return 'indigo';
            case 'hybrid':
                return 'violet';
            default:
                return 'gray';
        }
    };

    return (
        <AppLayout>
            <Head title={`${course.code} - ${course.title}`} />

            <div className="p-6">
                <div className="flex items-center justify-between pb-6">
                    <h1 className="text-2xl font-bold">
                        {course.code}: {course.title}
                    </h1>
                    <div className="flex space-x-2">
                        <Link
                            href={route('courses.edit', {
                                school: school.id,
                                course: course.id,
                            })}
                            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none"
                        >
                            Edit
                        </Link>
                        <Link
                            href={route('courses.index', { school: school.id })}
                            className="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400 focus:outline-none"
                        >
                            Back to Courses
                        </Link>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <h2 className="mb-2 text-lg font-semibold text-gray-700">
                                    Course Information
                                </h2>
                                <dl className="space-y-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Department
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {course.department?.name}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Major
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {course.major?.name || 'N/A'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">
                                            Credits
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {course.credits}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                            <div>
                                <h2 className="mb-2 text-lg font-semibold text-gray-700">
                                    Description
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {course.description ||
                                        'No description available.'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-4 flex items-center justify-between">
                    <Title>Sections</Title>
                    <Link
                        href={route('sections.create', {
                            school: school.id,
                            course: course.id,
                        })}
                        className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Add Section
                    </Link>
                </div>

                {course.sections && course.sections.length > 0 ? (
                    <Card>
                        <div className="overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Section Code
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Term
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Instructor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Delivery
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Schedule
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {course.sections.map((section) => (
                                        <tr
                                            key={section.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <Link
                                                    href={route(
                                                        'sections.show',
                                                        [school.id, section.id],
                                                    )}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    {section.section_code}
                                                </Link>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                {section.term ? (
                                                    <span>
                                                        {section.term.name}
                                                    </span>
                                                ) : (
                                                    <Badge color="gray">
                                                        Not Assigned
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                {section.professor_profile
                                                    ?.user ? (
                                                    <span>
                                                        {
                                                            section
                                                                .professor_profile
                                                                .user.name
                                                        }
                                                    </span>
                                                ) : (
                                                    <Badge color="gray">
                                                        Not Assigned
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                {section.status ? (
                                                    <Badge
                                                        color={getStatusBadgeColor(
                                                            section.status,
                                                        )}
                                                    >
                                                        {section.status
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            section.status.slice(
                                                                1,
                                                            )}
                                                    </Badge>
                                                ) : (
                                                    <Badge color="gray">
                                                        Unknown
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                {section.delivery_method ? (
                                                    <Badge
                                                        color={getDeliveryMethodBadgeColor(
                                                            section.delivery_method,
                                                        )}
                                                    >
                                                        {section.delivery_method
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            section.delivery_method.slice(
                                                                1,
                                                            )}
                                                    </Badge>
                                                ) : (
                                                    <Badge color="gray">
                                                        Unknown
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                {section.schedules &&
                                                section.schedules.length > 0 ? (
                                                    <div>
                                                        {section.schedules
                                                            .length === 1 ? (
                                                            <span>
                                                                {
                                                                    section
                                                                        .schedules[0]
                                                                        .day_of_week
                                                                }
                                                                ,{' '}
                                                                <span className="text-gray-500">
                                                                    {formatTime(
                                                                        section
                                                                            .schedules[0]
                                                                            .start_time,
                                                                    )}{' '}
                                                                    -{' '}
                                                                    {formatTime(
                                                                        section
                                                                            .schedules[0]
                                                                            .end_time,
                                                                    )}
                                                                </span>
                                                            </span>
                                                        ) : (
                                                            <span>
                                                                {section.schedules
                                                                    .map(
                                                                        (
                                                                            schedule,
                                                                        ) =>
                                                                            schedule.day_of_week,
                                                                    )
                                                                    .join(
                                                                        '/',
                                                                    )}{' '}
                                                                <span className="text-gray-500">
                                                                    {formatTime(
                                                                        section
                                                                            .schedules[0]
                                                                            .start_time,
                                                                    )}{' '}
                                                                    -{' '}
                                                                    {formatTime(
                                                                        section
                                                                            .schedules[0]
                                                                            .end_time,
                                                                    )}
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <Badge color="gray">
                                                        Not Scheduled
                                                    </Badge>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                <div className="flex justify-end space-x-2">
                                                    <Link
                                                        href={route(
                                                            'sections.edit',
                                                            [
                                                                school.id,
                                                                section.id,
                                                            ],
                                                        )}
                                                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    >
                                                        <PencilIcon className="mr-1 h-3 w-3" />
                                                        Edit
                                                    </Link>

                                                    {(!section.schedules ||
                                                        section.schedules
                                                            .length === 0) && (
                                                        <Link
                                                            href={route(
                                                                'schedules.create',
                                                                {
                                                                    school: school.id,
                                                                    section_id:
                                                                        section.id,
                                                                },
                                                            )}
                                                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-green-700 shadow-sm hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                                                        >
                                                            <CalendarIcon className="mr-1 h-3 w-3" />
                                                            Add Schedule
                                                        </Link>
                                                    )}

                                                    {section.schedules &&
                                                        section.schedules
                                                            .length > 0 && (
                                                            <Link
                                                                href={route(
                                                                    'schedules.edit',
                                                                    [
                                                                        school.id,
                                                                        section
                                                                            .schedules[0]
                                                                            .id,
                                                                    ],
                                                                )}
                                                                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-amber-700 shadow-sm hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                            >
                                                                <CalendarIcon className="mr-1 h-3 w-3" />
                                                                Edit Schedule
                                                            </Link>
                                                        )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                ) : (
                    <Card>
                        <div className="p-4 text-center">
                            <p className="text-gray-500">
                                No sections available for this course.
                            </p>
                            <Link
                                href={route('sections.create', {
                                    school: school.id,
                                    course: course.id,
                                })}
                                className="mt-4 inline-flex items-center rounded-md border border-transparent bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Create First Section
                            </Link>
                        </div>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
