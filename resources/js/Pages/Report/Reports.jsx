import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Reports({ reports, flash }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Reports" />
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">
                    All Reports
                </h1>
            </div>

            {flash?.success && (
                <div className="mb-4 rounded bg-green-100 p-2 text-green-800">
                    {flash.success}
                </div>
            )}

            <table className="w-full overflow-hidden rounded bg-white shadow">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left">ID</th>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Content</th>
                        <th className="p-3 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map((report) => (
                        <tr
                            key={report.id}
                            className="border-b last:border-b-0"
                        >
                            <td className="p-3">{report.id}</td>
                            <td className="p-3">{report.name}</td>
                            <td className="p-3">{report.content}</td>
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
