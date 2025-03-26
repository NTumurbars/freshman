// resources/js/Pages/Departments/Index.jsx

import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Index({ departments, flash }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Departments" />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">
                    All Departments
                </h1>
                <Link
                    href={route('departments.create')}
                    className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                    Create Department
                </Link>
            </div>

            {flash.success && (
                <div className="mb-4 rounded bg-green-100 p-2 text-green-800">
                    {flash.success}
                </div>
            )}

            <table className="w-full overflow-hidden rounded bg-white shadow">
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
                            <td className="space-x-2 p-3">
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
