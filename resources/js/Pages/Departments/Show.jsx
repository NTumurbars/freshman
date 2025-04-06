import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Show({ department }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title={`${department.name} Department`} />

            <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {department.name} Department
                    </h1>
                    <Link
                        href={route('departments.index', { school: school.id })}
                        className="bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-gray-200"
                    >
                        Back to Departments
                    </Link>
                </div>

                {/* Majors Section */}
                <div className="bg-white shadow sm:rounded-lg mb-6">
                    <div className="px-4 py-5 sm:p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Majors
                        </h2>
                        {department.majors?.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {department.majors.map((major) => (
                                    <div
                                        key={major.id}
                                        className="bg-gray-50 p-4 rounded-lg shadow-sm"
                                    >
                                        <h3 className="font-medium text-gray-900">
                                            {major.code}
                                        </h3>
                                        {major.description && (
                                            <p className="mt-2 text-sm text-gray-600">
                                                {major.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600">No majors found in this department.</p>
                        )}
                    </div>
                </div>

                {/* Courses Section */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Courses
                        </h2>
                        {department.courses?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Course Code
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Capacity
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {department.courses.map((course) => (
                                            <tr key={course.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Link
                                                        href={route('courses.show', {
                                                            school: school.id,
                                                            course: course.id
                                                        })}
                                                        className="text-blue-600 hover:text-blue-900 hover:underline"
                                                    >
                                                        {course.course_code}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {course.title}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {course.capacity}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-600">No courses found in this department.</p>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
