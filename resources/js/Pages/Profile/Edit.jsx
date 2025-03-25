import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Edit({ user }) {
    const { data, setData, patch, errors, processing } = useForm({
        name: user.name || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <AppLayout>
            <Head title="Edit Profile" />

            <div className="max-w-xl mx-auto bg-white shadow-md rounded p-6">
                <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

                <form onSubmit={submit}>
                    <div className="mb-4">
                        <label className="block font-medium text-gray-700">Name</label>
                        <input
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded shadow-sm"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            className="mt-1 block w-full bg-gray-100 border-gray-300 rounded shadow-sm"
                            value={user.email}
                            disabled
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium text-gray-700">
                            New Password (optional)
                        </label>
                        <input
                            type="password"
                            className="mt-1 block w-full border-gray-300 rounded shadow-sm"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium text-gray-700">Confirm Password</label>
                        <input
                            type="password"
                            className="mt-1 block w-full border-gray-300 rounded shadow-sm"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                        {errors.password_confirmation && (
                            <div className="text-red-500 text-sm">{errors.password_confirmation}</div>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                            disabled={processing}
                        >
                            Save Changes
                        </button>

                        <Link
                            href={route('profile.show')}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
