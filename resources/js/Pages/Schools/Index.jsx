import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Index({ schools, flash }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;

    return (
        <AppLayout>
            <Head title="School Management" />

            <div className="mb-8 flex items-center justify-between">
                <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                    All Schools
                </h1>
                {userRole == 1 && (
                    <Link
                        href={route('schools.create')}
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 border border-transparent rounded-lg font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create School
                    </Link>
                )}
            </div>

            {flash?.success && (
                <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-800 border border-green-200 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {flash.success}
                </div>
            )}

            <div className="overflow-hidden rounded-xl bg-white shadow-lg border border-gray-100">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 text-sm font-medium">
                            <th className="px-6 py-4 text-left">Name</th>
                            <th className="px-6 py-4 text-left">Email</th>
                            <th className="px-6 py-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {schools.map((school) => (
                            <tr
                                key={school.id}
                                className="transition-colors hover:bg-gray-50/50"
                            >
                                <td className="px-6 py-4">
                                    <Link
                                        href={route('schools.show', school.id)}
                                        className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                                    >
                                        {school.name}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    {school.email}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex space-x-3">
                                        <Link
                                            href={route('schools.edit', school.id)}
                                            className="text-gray-600 hover:text-indigo-600 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </Link>
                                        <Link
                                            href={route('schools.destroy', school.id)}
                                            method="delete"
                                            as="button"
                                            className="text-gray-600 hover:text-red-600 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}