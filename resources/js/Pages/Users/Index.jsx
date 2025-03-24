import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Index({ users }) {
    const { flash } = usePage().props;

    return (
        <AppLayout>
            {flash?.success && (
                <div className="bg-green-100 text-green-800 p-2 mb-4 rounded">
                    {flash.success}
                </div>
            )}

            <h1 className="text-2xl font-bold mb-4">User Management</h1>

            <Link
                href={route('users.create')}
                className="inline-block bg-blue-500 text-white px-4 py-2 mb-4 rounded"
            >
                Create New User
            </Link>

            <table className="w-full bg-white shadow rounded">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left">ID</th>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Email</th>
                        <th className="p-3 text-left">Role</th>
                        <th className="p-3 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.id} className="border-b last:border-b-0">
                            <td className="p-3">{u.id}</td>
                            <td className="p-3">{u.name}</td>
                            <td className="p-3">{u.email}</td>
                            <td className="p-3">{u.role?.name}</td>
                            <td className="p-3 space-x-2">
                                <Link
                                    href={route('users.edit', u.id)}
                                    className="text-blue-600 hover:underline"
                                >
                                    Edit
                                </Link>
                                <Link
                                    href={route('users.destroy', u.id)}
                                    method="delete"
                                    as="button"
                                    className="text-red-600 hover:underline"
                                    onClick={(e) => {
                                        if (!confirm('Are you sure?')) {
                                            e.preventDefault();
                                        }
                                    }}
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
