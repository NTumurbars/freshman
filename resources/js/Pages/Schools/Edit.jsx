import React from 'react';
import { useForm, Head, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Edit({ user, roles, schools }) {
    const { flash } = usePage().props;

    const { data, setData, put, errors, processing } = useForm({
        name: user.name || '',
        email: user.email || '',
        role_id: user.role_id || '',
        school_id: user.school_id || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('users.update', user.id));
    };

    return (
        <AppLayout>
            <Head title="Edit User" />

            <div className="max-w-xl mx-auto bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Edit User</h2>

                {flash?.success && (
                    <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
                        {flash.success}
                    </div>
                )}

                <form onSubmit={submit}>
                    {/* Name */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Name"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
                    </div>

                    {/* Role */}
                    <div className="mb-4">
                        <select
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            value={data.role_id}
                            onChange={(e) => setData('role_id', e.target.value)}
                        >
                            <option value="">Select Role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name.replace('_', ' ').toUpperCase()}
                                </option>
                            ))}
                        </select>
                        {errors.role_id && <div className="text-red-500 text-sm">{errors.role_id}</div>}
                    </div>

                    {/* School */}
                    <div className="mb-4">
                        <select
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            value={data.school_id}
                            onChange={(e) => setData('school_id', e.target.value)}
                        >
                            <option value="">No School (Optional)</option>
                            {schools.map((school) => (
                                <option key={school.id} value={school.id}>
                                    {school.name}
                                </option>
                            ))}
                        </select>
                        {errors.school_id && <div className="text-red-500 text-sm">{errors.school_id}</div>}
                    </div>

                    {/* Password (Optional) */}
                    <div className="mb-4">
                        <input
                            type="password"
                            placeholder="New Password (leave blank to keep current)"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
                    </div>

                    <div className="mb-4">
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                        {errors.password_confirmation && (
                            <div className="text-red-500 text-sm">{errors.password_confirmation}</div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                        disabled={processing}
                    >
                        {processing ? 'Updating...' : 'Update User'}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
