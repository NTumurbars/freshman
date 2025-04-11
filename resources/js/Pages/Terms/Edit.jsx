import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import TermForm from './Form';

export default function Edit({ auth, term, school }) {
    // Debug information
    console.log('Edit component - School prop:', school);
    console.log('Edit component - Auth school:', auth?.school);

    return (
        <AppLayout>
            <Head title={`Edit ${term.name}`} />

            <div className="mx-auto max-w-3xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Edit Term
                    </h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Update details for {term.name}
                    </p>
                </div>

                <div className="rounded-lg bg-white p-6 shadow">
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
