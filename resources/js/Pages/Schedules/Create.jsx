import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ScheduleForm from './Form';

export default function Create({ auth, sections, rooms }) {
    return (
        <AppLayout userRole={auth.user.role_id} school={auth.school}>
            <Head title="Create Schedule" />

            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Create New Schedule</h1>
                    <p className="mt-2 text-sm text-gray-700">Add a new class schedule</p>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <ScheduleForm
                        sections={sections}
                        rooms={rooms}
                        submitLabel="Create Schedule"
                    />
                </div>
            </div>
        </AppLayout>
    );
}
