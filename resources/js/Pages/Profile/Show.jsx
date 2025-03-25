// resources/js/Pages/Profile/Show.jsx

import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Show({ user, status }) {
    return (
        <AppLayout>
            <Head title="My Profile" />

            <div className="max-w-xl mx-auto bg-white shadow rounded p-6">
                <h2 className="text-2xl font-bold mb-4">My Profile</h2>

                {status && (
                    <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
                        {status}
                    </div>
                )}

                <div className="space-y-4 text-gray-800">
                    <div>
                        <span className="font-semibold">Name:</span> {user.name}
                    </div>

                    <div>
                        <span className="font-semibold">Email:</span> {user.email}
                    </div>

                    <div>
                        <span className="font-semibold">Joined:</span>{' '}
                        {new Date(user.created_at).toLocaleDateString()}
                    </div>
                </div>

                <div className="mt-6">
                    <Link
                        href={route('profile.edit')}
                        className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                    >
                        Edit Profile
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
