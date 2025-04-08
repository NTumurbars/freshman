import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TermForm from './Form';

export default function Create({ auth, school }) {
    const { auth: pageAuth } = usePage().props;

    // Ensure we have the correct school data
    console.log('School from props:', school);
    console.log('School from auth:', auth?.school);

    // Get the correct role ID
    const userRole = pageAuth?.user?.role?.id || auth?.user?.role_id;

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Create Term" />

            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Create New Term</h1>
                    <p className="mt-2 text-sm text-gray-700">Add a new academic term for {school.name}</p>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <TermForm
                        school={school}
                        submitLabel="Create Term"
                    />
                </div>
            </div>
        </AppLayout>
    );
}
