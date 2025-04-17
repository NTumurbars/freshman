import AppLayout from '@/Layouts/AppLayout';
import { PencilIcon, TrashIcon, UsersIcon } from '@heroicons/react/24/outline';
import { Head, usePage } from '@inertiajs/react';
import {
    Button,
    Card,
    Divider,
    Grid,
    Metric,
    Text,
    Title,
} from '@tremor/react';
import { CalendarIcon, Layers } from 'lucide-react';

export default function TermShow({ term, school }) {
    const { auth } = usePage().props;
    const role = auth.user.role.id;

    return (
        <AppLayout>
            <Head title={`Term: ${term.name}`} />

            <div className="mx-auto max-w-6xl space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Title className="text-3xl font-bold">
                            {term.name}
                        </Title>
                        <Text className="text-gray-500">
                            {school.name} | {term.start_date} to {term.end_date}
                        </Text>
                    </div>
                    {/* <Link href={route('schools.show', school.id)}>
                        <Button icon={ArrowLeftIcon} variant="light">
                            Back to School
                        </Button>
                    </Link> */}
                </div>

                <Divider />

                {/* Sections Overview */}
                <Grid
                    numItems={1}
                    numItemsMd={2}
                    numItemsLg={3}
                    className="gap-4"
                >
                    <Card>
                        <Metric>{term.sections.length}</Metric>
                        <Text>Sections</Text>
                    </Card>
                    <Card>
                        <Metric>
                            {term.sections.reduce(
                                (total, s) => total + s.number_of_students,
                                0,
                            )}
                        </Metric>
                        <Text>Total Students</Text>
                    </Card>
                    <Card>
                        <Metric>
                            {
                                term.sections.filter(
                                    (s) => s.professor_name !== 'Not assigned',
                                ).length
                            }
                        </Metric>
                        <Text>Assigned Professors</Text>
                    </Card>
                </Grid>

                {/* Sections List */}
                <div className="space-y-4">
                    <Title className="mt-6">Sections</Title>
                    {term.sections.length === 0 ? (
                        <Text className="text-gray-500">
                            No sections for this term.
                        </Text>
                    ) : (
                        term.sections.map((section) => (
                            <Card
                                key={section.id}
                                className="rounded-xl border"
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <div>
                                        <Text className="text-sm text-gray-500">
                                            {section.section_code}
                                        </Text>
                                        <Title className="text-lg font-semibold">
                                            {section.course_name}
                                        </Title>
                                    </div>

                                    {/* Action buttons if you want them later */}
                                    {role !== 4 && role !== 5 && (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                icon={PencilIcon}
                                                size="xs"
                                                variant="light"
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                icon={TrashIcon}
                                                size="xs"
                                                color="red"
                                                variant="light"
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <Grid
                                    numItems={1}
                                    numItemsMd={2}
                                    className="mb-2 gap-2"
                                >
                                    <Text className="flex items-center gap-2 text-gray-700">
                                        <UsersIcon className="h-5 w-5" />
                                        {section.number_of_students} Students
                                    </Text>
                                    <Text className="flex items-center gap-2 text-gray-700">
                                        <Layers className="h-5 w-5" />
                                        Professor:{' '}
                                        <span className="font-medium">
                                            {section.professor_name}
                                        </span>
                                    </Text>
                                </Grid>

                                <Divider />

                                {/* Schedules */}
                                <div>
                                    <Title className="mb-2 text-base">
                                        Schedules
                                    </Title>
                                    {section.schedules.length === 0 ? (
                                        <Text className="text-sm text-gray-400">
                                            No schedules assigned
                                        </Text>
                                    ) : (
                                        <ul className="space-y-2 text-sm">
                                            {section.schedules.map(
                                                (schedule) => (
                                                    <li
                                                        key={schedule.id}
                                                        className="flex items-center gap-2 border-l-4 border-blue-500 pl-2"
                                                    >
                                                        <CalendarIcon className="h-4 w-4 text-blue-500" />
                                                        <span className="font-medium">
                                                            {
                                                                schedule.day_of_week
                                                            }
                                                        </span>
                                                        :&nbsp;
                                                        {
                                                            schedule.start_time
                                                        } - {schedule.end_time}{' '}
                                                        (
                                                        <span className="italic">
                                                            {schedule.room_name}
                                                        </span>
                                                        )
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    )}
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
