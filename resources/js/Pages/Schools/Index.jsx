// resources/js/Pages/Schools/Index.jsx

import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Index({ schools, flash }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="School Management" />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">
                    All Schools
                </h1>
                <Link
                    href={route('schools.create')}
                    className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                    Create School
                </Link>
            </div>

            {flash?.success && (
                <div className="mb-4 rounded bg-green-100 p-2 text-green-800">
                    {flash.success}
                </div>
            )}

            <table className="w-full overflow-hidden rounded bg-white shadow">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Personal Mail</th>
                        <th className="p-3 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {schools.map((school) => (
                        <tr
                            key={school.id}
                            className="border-b last:border-b-0"
                        >
                            <td className="p-3">
                                <Link
                                    href={route('schools.show', school.id)}
                                    className="text-blue-600 hover:underline"
                                >
                                    {school.name}
                                </Link>
                            </td>
                            <td className="p-3">{school.email}</td>
                            <td className="space-x-2 p-3">
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
