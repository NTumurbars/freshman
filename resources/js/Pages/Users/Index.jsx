// resources/js/Pages/Users/Index.jsx
import AppLayout from '@/Layouts/AppLayout';
import { Inertia } from '@inertiajs/inertia';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index() {
    // Provide a default empty object for filters to avoid undefined errors.
    const { users, schools, roles, filters = {} } = usePage().props;

    const [selectedSchool, setSelectedSchool] = useState(filters.school || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');

    const handleFilter = (e) => {
        e.preventDefault();
        Inertia.get(
            route('users.index'),
            { school: selectedSchool, role: selectedRole },
            { preserveState: true, preserveScroll: true },
        );
    };
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Users" />
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">
                    All Schools
                </h1>
                <Link
                    href={route('users.create')}
                    className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                    Create User
                </Link>
            </div>
            <div>
                <h1 className="mb-4 text-3xl font-bold">User Management</h1>

                {/* Filter Form */}
                <form
                    onSubmit={handleFilter}
                    className="mb-6 flex flex-wrap gap-4"
                >
                    <div>
                        <label
                            htmlFor="school"
                            className="block text-sm font-medium text-gray-700"
                        >
                            School
                        </label>
                        <select
                            id="school"
                            value={selectedSchool}
                            onChange={(e) => setSelectedSchool(e.target.value)}
                            className="mt-1 block w-64 rounded-md border-gray-300 shadow-sm"
                        >
                            <option value="">All Schools</option>
                            {schools &&
                                schools.map((school) => (
                                    <option key={school.id} value={school.id}>
                                        {school.name}
                                    </option>
                                ))}
                        </select>
                    </div>

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
                                    <option key={role.id} value={role.name}>
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
                <div className="overflow-x-auto">
                    <table className="min-w-full border bg-white">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2">ID</th>
                                <th className="border px-4 py-2">Name</th>
                                <th className="border px-4 py-2">Email</th>
                                <th className="border px-4 py-2">School</th>
                                <th className="border px-4 py-2">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users &&
                                users.data &&
                                users.data.map((user) => (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="border px-4 py-2">
                                            {user.id}
                                        </td>
                                        <td className="border px-4 py-2">
                                            {user.name}
                                        </td>
                                        <td className="border px-4 py-2">
                                            {user.email}
                                        </td>
                                        <td className="border px-4 py-2">
                                            {user.school ? (
                                                <Link
                                                    href={route(
                                                        'schools.departments.index',
                                                        user.school?.id,
                                                    )}
                                                    className="text-indigo-600 hover:underline"
                                                >
                                                    {user.school?.name}
                                                </Link>
                                            ) : (
                                                'N/A'
                                            )}
                                        </td>
                                        <td className="border px-4 py-2">
                                            {user.role ? user.role.name : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="mt-4">
                    {users &&
                        users.links &&
                        users.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url}
                                className="mx-1 rounded border px-3 py-1"
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                </div>
            </div>
        </AppLayout>
    );
}
