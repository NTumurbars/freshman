import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Show({ course, school }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title={`${course.course_code} - ${course.title}`} />

            <div className="p-6">
                <div className="flex items-center justify-between pb-6">
                    <h1 className="text-2xl font-bold">{course.course_code}: {course.title}</h1>
                    <div className="flex space-x-2">
                        <a
                            href={route('courses.edit', { school: school.id, course: course.id })}
                            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none"
                        >
                            Edit
                        </a>
                        <a
                            href={route('courses.index', { school: school.id })}
                            className="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400 focus:outline-none"
                        >
                            Back to Courses
                        </a>
                    </div>
                </div>

                <div className="mb-8 overflow-hidden rounded-lg bg-white shadow">
                    <div className="px-6 py-5">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <h3 className="mb-1 text-sm font-medium text-gray-500">Department</h3>
                                <p className="text-base">{course.department?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <h3 className="mb-1 text-sm font-medium text-gray-500">Major</h3>
                                <p className="text-base">{course.major?.code || 'Not Specified'}</p>
                            </div>
                            <div>
                                <h3 className="mb-1 text-sm font-medium text-gray-500">Course Code</h3>
                                <p className="text-base">{course.course_code}</p>
                            </div>
                            <div>
                                <h3 className="mb-1 text-sm font-medium text-gray-500">Capacity</h3>
                                <p className="text-base">{course.capacity}</p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="mb-1 text-sm font-medium text-gray-500">Description</h3>
                            <p className="text-base">{course.description || 'No description available.'}</p>
                        </div>
                    </div>
                </div>

                {course.sections && course.sections.length > 0 ? (
                    <div>
                        <h2 className="mb-4 text-xl font-semibold">Sections</h2>
                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Section Number
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Instructor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Room
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Schedule
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {course.sections.map((section) => (
                                        <tr key={section.id}>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                {section.section_number}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                {section.professor_profile?.user?.name || 'TBA'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                {section.room?.name || 'TBA'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4">
                                                {section.schedule?.day_of_week
                                                    ? `${section.schedule.day_of_week} ${section.schedule.start_time} - ${section.schedule.end_time}`
                                                    : 'TBA'
                                                }
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="rounded-lg bg-white p-4 shadow">
                        <p className="text-gray-500">No sections available for this course.</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
