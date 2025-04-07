// resources/js/Pages/Departments/Index.jsx

import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Index({ departments }) {
    const { auth, flash } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Departments" />

            <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                {flash?.success && (
                    <div className="mb-4 rounded bg-green-100 p-4 text-green-700">
                        {flash.success}
                    </div>
                )}

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Departments</h1>
                    <Link
                        href={route('departments.create', { school: school.id })}
                        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                        Create Department
                    </Link>
                </div>

                <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Department
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Majors
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Courses
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {departments.map((department) => (
                                <tr key={department.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link
                                            href={route('departments.show', {
                                                school: school.id,
                                                department: department.id
                                            })}
                                            className="text-blue-600 hover:text-blue-900 hover:underline"
                                        >
                                            {department.name}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {department.majors?.length || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {department.courses?.length || 0}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <Link
                                            href={route('departments.edit', {
                                                school: school.id,
                                                department: department.id
                                            })}
                                            className="text-blue-600 hover:underline mr-4"
                                        >
                                            Edit
                                        </Link>
                                        <Link
                                            href={route('departments.destroy', {
                                                school: school.id,
                                                department: department.id
                                            })}
                                            method="delete"
                                            as="button"
                                            className="text-red-600 hover:underline"
                                            preserveScroll
                                        >
                                            Delete
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
