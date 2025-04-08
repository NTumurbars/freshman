import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import TermForm from './Form';

export default function Edit({ auth, term, school }) {
    const { auth: pageAuth } = usePage().props;

    // Debug information
    console.log('Edit component - School prop:', school);
    console.log('Edit component - Auth school:', auth?.school);

    // Get the correct role ID
    const userRole = pageAuth?.user?.role?.id || auth?.user?.role_id;

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title={`Edit ${term.name}`} />

            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Edit Term</h1>
                    <p className="mt-2 text-sm text-gray-700">Update details for {term.name}</p>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <TermForm
                        term={term}
                        school={school}
                        submitLabel="Update Term"
                    />
                </div>
            </div>
        </AppLayout>
    );
}
