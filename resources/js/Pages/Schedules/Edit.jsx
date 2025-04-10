import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import ScheduleForm from './Form';

export default function Edit({ schedule, sections, rooms, school }) {
    return (
        <AppLayout>
            <Head title="Edit Schedule" />

            <div className="mx-auto max-w-3xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Edit Schedule
                    </h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Modify the schedule for{' '}
                        {schedule.section?.course?.title || 'Unknown Course'} -
                        Section {schedule.section?.section_code || ''}
                    </p>
                </div>

                <div className="rounded-lg bg-white p-6 shadow">
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
