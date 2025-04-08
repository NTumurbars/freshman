import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import ScheduleForm from './Form';

export default function Edit({ auth, schedule, sections, rooms, school }) {
    const userRole = auth.user.role.id;
    const userSchool = school || auth.user.school;

    return (
        <AppLayout userRole={userRole} school={userSchool}>
            <Head title="Edit Schedule" />

            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Edit Schedule</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Modify the schedule for {schedule.section?.course?.title || 'Unknown Course'} - Section {schedule.section?.section_code || ''}
                    </p>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <ScheduleForm
                        schedule={schedule}
                        sections={sections}
                        rooms={rooms}
                        submitLabel="Update Schedule"
                    />
                </div>
            </div>
        </AppLayout>
    );
}
