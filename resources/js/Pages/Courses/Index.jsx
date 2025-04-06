// resources/js/Pages/Courses/Index.jsx

import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Index({ courses, flash }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const userSchool = auth.user.school;

    return (
        <AppLayout userRole={userRole} school={userSchool}>
            <Head title={`${userSchool.name} - Courses`} />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Courses
                    </h1>
                    <p className="text-gray-600">{userSchool.name}</p>
                </div>
                <Link
                    href={route('courses.create', userSchool.id)}
                    className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                    Create Course
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full overflow-hidden rounded bg-white shadow">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left">Course Code</th>
                            <th className="p-3 text-left">Title</th>
                            <th className="p-3 text-left">Department</th>
                            <th className="p-3 text-left">Major</th>
                            <th className="p-3 text-left">Capacity</th>
                            <th className="p-3 text-left">Sections</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course) => (
                            <tr key={course.id} className="border-b last:border-b-0">
                                <td className="p-3">{course.major?.code || '-'}</td>
                                <td className="p-3">{course.course_code}</td>
                                <td className="p-3">
                                    <div className="font-medium">{course.title}</div>
                                    {course.description && (
                                        <div className="text-sm text-gray-500">
                                            {course.description}
                                        </div>
                                    )}
                                </td>
                                <td className="p-3">{course.department?.name}</td>
                                <td className="p-3">{course.capacity}</td>
                                <td className="p-3">{course.sections?.length || 0}</td>
                                <td className="space-x-2 p-3">
                                    <Link
                                        href={route('courses.edit', [userSchool.id, course.id])}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Edit
                                    </Link>
                                    <Link
                                        href={route('courses.destroy', [userSchool.id, course.id])}
                                        method="delete"
                                        as="button"
                                        className="text-red-600 hover:underline"
                                    >
                                        Delete
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {courses.length === 0 && (
                            <tr>
                                <td colSpan="7" className="p-3 text-center text-gray-500">
                                    No courses found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
