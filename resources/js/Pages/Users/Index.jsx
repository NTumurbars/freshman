import NavLink from '@/Components/NavLink';
import AppLayout from '@/Layouts/AppLayout';
import { Inertia } from '@inertiajs/inertia';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index() {
    const { users, roles, filters = {} } = usePage().props;
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    const [selectedRole, setSelectedRole] = useState(filters.role || '');

    const handleFilter = (e) => {
        e.preventDefault();
        Inertia.get(
            route('users.index'),
            { school: school, role: selectedRole },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AppLayout
            userRole={userRole}
            school={school}
            navChildren={
                <NavLink
                    className="p-5"
                    href={route('users.create')}
                    active={route().current('users.create')}
                >
                    Create User
                </NavLink>
            }
        >
            <Head title="Users" />
            <div>
                <h1 className="mb-4 text-3xl font-bold">User Management</h1>

                {/* Filter Form */}
                <form
                    onSubmit={handleFilter}
                    className="mb-6 flex flex-wrap gap-4"
                >
                    <div>
                        <label
                            htmlFor="role"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Role
                        </label>
                        <select
                            id="role"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="mt-1 block w-64 rounded-md border-gray-300 shadow-sm"
                        >
                            <option value="">All Roles</option>
                            {roles &&
                                roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="rounded-md bg-indigo-600 px-4 py-2 text-white"
                        >
                            Filter
                        </button>
                    </div>
                </form>

                {/* Users Table */}
                {users && users.length === 0 ? (
                    <p>No users found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border bg-white">
                            <thead>
                                <tr>
                                    <th className="border px-4 py-2">Name</th>
                                    <th className="border px-4 py-2">Email</th>
                                    <th className="border px-4 py-2">Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users &&
                                    users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-gray-50"
                                        >
                                            <td className="hover:underlin border px-4 py-2 text-blue-600">
                                                <Link
                                                    href={route(
                                                        'users.show',
                                                        user.id,
                                                    )}
                                                >
                                                    {user.name}
                                                </Link>
                                            </td>
                                            <td className="border px-4 py-2">
                                                {user.email}
                                            </td>
                                            <td className="border px-4 py-2">
                                                {user.role
                                                    ? user.role.name
                                                    : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {users && users.links && users.links.length > 0 && (
                    <div className="mt-4">
                        {users.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url}
                                className="mx-1 rounded border px-3 py-1"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
