// resources/js/Pages/Profile/Show.jsx

import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Show({ user, status }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="My Profile" />

            <div className="mx-auto max-w-xl rounded bg-white p-6 shadow">
                <h2 className="mb-4 text-2xl font-bold">My Profile</h2>

                {status && (
                    <div className="mb-4 rounded bg-green-100 p-2 text-green-800">
                        {status}
                    </div>
                )}

                <div className="space-y-4 text-gray-800">
                    <div>
                        <span className="font-semibold">Name:</span> {user.name}
                    </div>

                    <div>
                        <span className="font-semibold">Email:</span>{' '}
                        {user.email}
                    </div>

                    <div>
                        <span className="font-semibold">Joined:</span>{' '}
                        {new Date(user.created_at).toLocaleDateString()}
                    </div>
                </div>

                <div className="mt-6">
                    <Link
                        href={route('profile.edit')}
                        className="inline-block rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                    >
                        Edit Profile
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
