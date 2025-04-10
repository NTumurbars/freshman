import ScheduleCalendar from '@/Components/UI/ScheduleCalendar';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { Callout, Card, Col, Grid } from '@tremor/react';
import { Calendar, ChevronLeft, Clock } from 'lucide-react';
import { useState } from 'react';
import ScheduleForm from './Form';

export default function Create({
    auth,
    sections,
    rooms,
    school,
    preselectedSectionId,
}) {
    const userSchool = school || auth.user.school;
    const [previewSchedule, setPreviewSchedule] = useState(null);
    const [notification, setNotification] = useState(null);

    // Handler to update the preview schedule
    const handleSchedulePreview = (scheduleData) => {
        setPreviewSchedule(scheduleData);
    };

    // Handler for notifications
    const handleNotification = (message, type = 'success') => {
        setNotification({ message, type });
        // Auto-dismiss after 5 seconds
        setTimeout(() => setNotification(null), 5000);
    };

    return (
        <AppLayout>
            <Head title="Create Schedule" />

            <div className="mb-6 space-y-4">
                <div className="flex flex-col justify-between md:flex-row md:items-center">
                    <div>
                        <Link
                            href={route('schedules.index', userSchool.id)}
                            className="mb-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" /> Back to
                            Schedules
                        </Link>
                    </div>
                </div>
            </div>

            {notification && (
                <div className="mb-4">
                    <Callout
                        title={
                            notification.type === 'success'
                                ? 'Success'
                                : 'Error'
                        }
                        color={
                            notification.type === 'success' ? 'teal' : 'rose'
                        }
                        onClose={() => setNotification(null)}
                    >
                        {notification.message}
                    </Callout>
                </div>
            )}

            <Grid numItemsSm={1} numItemsLg={2} className="gap-6">
                <Col numColSpan={1}>
                    <Card className="overflow-hidden shadow-md">
                        <div className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                            <Clock className="mr-3 h-8 w-8 text-white" />
                            <h1 className="text-xl font-bold text-white">
                                Create New Schedule
                            </h1>
                        </div>

                        <div className="p-6">
                            <ScheduleForm
                                sections={sections}
                                rooms={rooms}
                                submitLabel="Create Schedule"
                                preselectedSectionId={preselectedSectionId}
                                onPreview={handleSchedulePreview}
                                onNotification={handleNotification}
                            />
                        </div>
                    </Card>
                </Col>

                <Col numColSpan={1}>
                    <Card className="overflow-hidden shadow-md">
                        <div className="flex items-center bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-4">
                            <Calendar className="mr-3 h-8 w-8 text-white" />
                            <h2 className="text-xl font-bold text-white">
                                Schedule Preview
                            </h2>
                        </div>

                        <div className="p-6">
                            <ScheduleCalendar
                                schedules={
                                    previewSchedule ? [previewSchedule] : []
                                }
                                showWeekView={true}
                                compact={true}
                            />

                            {!previewSchedule && (
                                <div className="mt-4 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-8 text-center italic text-gray-500">
                                    <Clock className="mx-auto mb-2 h-10 w-10 text-gray-400" />
                                    <p>
                                        Fill out the form to see a preview of
                                        your schedule
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>
            </Grid>
        </AppLayout>
    );
}
