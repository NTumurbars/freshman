// resources/js/Pages/Schools/Index.jsx

import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ schools, flash }) {
    return (
        <AppLayout>
            <Head title="Schools" />

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">All Schools</h1>
                <Link
                    href={route('schools.create')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Create School
                </Link>
            </div>

            {flash?.success && (
                <div className="bg-green-100 text-green-800 p-2 mb-4 rounded">
                    {flash.success}
                </div>
            )}

            <table className="w-full bg-white shadow rounded overflow-hidden">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left">ID</th>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Domain</th>
                        <th className="p-3 text-left">Personal Mail</th>
                        <th className="p-3 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {schools.map((school) => (
                        <tr key={school.id} className="border-b last:border-b-0">
                            <td className="p-3">{school.id}</td>
                            <td className="p-3">{school.name}</td>
                            <td className="p-3">{school.domain}</td>
                            <td className="p-3">{school.personal_mail}</td>
                            <td className="p-3 space-x-2">
                                <Link
                                    href={route('schools.edit', school.id)}
                                    className="text-blue-600 hover:underline"
                                >
                                    Edit
                                </Link>
                                <Link
                                    href={route('schools.destroy', school.id)}
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
