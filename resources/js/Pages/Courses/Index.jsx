// resources/js/Pages/Courses/Index.jsx

import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Plus, Edit, Trash2, Search, Eye } from 'lucide-react';
import { useState } from 'react';

export default function Index({ courses, flash, school }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const userSchool = auth.user.school;
    const [searchTerm, setSearchTerm] = useState('');

    // Filter courses based on search term
    const filteredCourses = courses.filter(course =>
        (course.course_code && course.course_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (course.title && course.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (course.department?.name && course.department.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <AppLayout userRole={userRole} school={userSchool}>
            <Head title={`${userSchool.name} - Courses`} />

            <div className="mb-6 space-y-4">
                <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Courses</h1>
                        <p className="text-gray-600">{userSchool.name}</p>
                    </div>
                    <Link
                        href={route('courses.create', userSchool.id)}
                        className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Create Course
                    </Link>
                </div>

                {/* Search */}
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Department</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Course Code</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Title</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Major</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Capacity</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Sections</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredCourses.map((course) => (
                            <tr key={course.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{course.department?.name || "—"}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{course.course_code}</td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                    {course.description && (
                                        <div className="text-sm text-gray-500">
                                            {course.description.length > 60
                                                ? course.description.substring(0, 60) + '...'
                                                : course.description}
                                        </div>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{course.major?.code || "—"}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{course.capacity}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{course.sections?.length || 0}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <Link
                                            href={route('courses.show', [userSchool.id, course.id])}
                                            className="rounded p-1 text-gray-500 hover:bg-blue-100 hover:text-blue-600"
                                            title="View details"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </Link>
                                        <Link
                                            href={route('courses.edit', [userSchool.id, course.id])}
                                            className="rounded p-1 text-gray-500 hover:bg-yellow-100 hover:text-yellow-600"
                                            title="Edit course"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </Link>
                                        <Link
                                            href={route('courses.destroy', [userSchool.id, course.id])}
                                            method="delete"
                                            as="button"
                                            className="rounded p-1 text-gray-500 hover:bg-red-100 hover:text-red-600"
                                            title="Delete course"
                                            onClick={(e) => {
                                                if (!confirm('Are you sure you want to delete this course?')) {
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
                        {filteredCourses.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">
                                    {searchTerm
                                        ? 'No courses found matching your search criteria'
                                        : 'No courses found. Create your first course to get started.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
