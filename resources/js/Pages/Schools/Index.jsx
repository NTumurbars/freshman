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
                <h1 className="text-3xl font-semibold text-gray-800">
                    All Schools
                </h1>
                <Link
                    href={route('schools.create')}
                    className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition duration-200 hover:bg-blue-700"
                >
                    Create School
                </Link>
            </div>

            {flash?.success && (
                <div className="mb-6 rounded-lg bg-green-100 p-4 text-green-800">
                    {flash.success}
                </div>
            )}

            <div className="overflow-x-auto rounded-lg bg-white shadow">
                <table className="w-full table-auto">
                    <thead className="bg-gray-200 text-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-left">Name</th>
                            <th className="px-6 py-4 text-left">
                                Personal Mail
                            </th>
                            <th className="px-6 py-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schools.map((school) => (
                            <tr
                                key={school.id}
                                className="border-b last:border-b-0 hover:bg-gray-50"
                            >
                                <td className="px-6 py-4">
                                    <Link
                                        href={route('schools.show', school.id)}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {school.name}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {school.email}
                                </td>
                                <td className="space-x-4 px-6 py-4">
                                    <Link
                                        href={route('schools.edit', school.id)}
                                        className="text-blue-600 hover:text-blue-700"
                                    >
                                        Edit
                                    </Link>
                                    <Link
                                        href={route(
                                            'schools.destroy',
                                            school.id,
                                        )}
                                        method="delete"
                                        as="button"
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        Delete
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
