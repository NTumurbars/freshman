// resources/js/Pages/Departments/Index.jsx

import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ departments, flash }) {
    return (
        <AppLayout>
            <Head title="Departments" />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">All Departments</h1>
                <Link
                    href={route('departments.create')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Create Department
                </Link>
            </div>

            {flash.success && (
                <div className="bg-green-100 text-green-800 p-2 mb-4 rounded">
                    {flash.success}
                </div>
            )}

            <table className="w-full bg-white shadow rounded overflow-hidden">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left">ID</th>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">School</th>
                        <th className="p-3 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {departments.map((dept) => (
                        <tr key={dept.id} className="border-b last:border-b-0">
                            <td className="p-3">{dept.id}</td>
                            <td className="p-3">{dept.name}</td>
                            <td className="p-3">{dept.school?.name}</td>
                            <td className="p-3 space-x-2">
                                <Link
                                    href={route('departments.edit', dept.id)}
                                    className="text-blue-600 hover:underline"
                                >
                                    Edit
                                </Link>
                                <Link
                                    href={route('departments.destroy', dept.id)}
                                    method="delete"
                                    as="button"
                                    className="text-red-600 hover:underline"
                                >
                                    Delete
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </AppLayout>
    );
}
