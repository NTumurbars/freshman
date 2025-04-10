import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import TermForm from './Form';

export default function Create({ auth, school }) {
    // Ensure we have the correct school data
    console.log('School from props:', school);
    console.log('School from auth:', auth?.school);

    return (
        <AppLayout>
            <Head title="Create Term" />

            <div className="mx-auto max-w-3xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Create New Term
                    </h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Add a new academic term for {school.name}
                    </p>
                </div>

                <div className="rounded-lg bg-white p-6 shadow">
                    <TermForm school={school} submitLabel="Create Term" />
                </div>
            </div>
        </AppLayout>
    );
}
