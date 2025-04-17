import AppLayout from '@/Layouts/AppLayout';
import {
    ArrowLeftIcon,
    CalendarIcon,
    PencilIcon,
    TrashIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Badge,
    Button,
    Card,
    Divider,
    Grid,
    Metric,
    Text,
    Title,
} from '@tremor/react';
import { DoorOpen, Hotel, Layers } from 'lucide-react';
import RoomCalendar from '@/Components/RoomCalendar';

export default function Show({ room }) {
    const { auth } = usePage().props;
    const school = auth.user.school;

    const features = room.features || [];
    const schedules = room.schedules || [];
    const floor = room.floor || {};
    const building = floor.building || {};

    return (
        <AppLayout>
            <Head title={`Room - ${room.room_number}`} />

            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center">
                        <Link
                            href={route('buildings.floors.show', {
                                school: school.id,
                                building: building.id,
                                floor: floor.id,
                            })}
                        >
                            <Button
                                variant="light"
                                color="gray"
                                icon={ArrowLeftIcon}
                                className="mr-4"
                            >
                                Back to Floor
                            </Button>
                        </Link>
                        <div className="flex items-center">
                            <DoorOpen className="mr-3 h-8 w-8 text-blue-600" />
                            <div>
                                <Title>Room Details</Title>
                                <Text>{room.room_number}</Text>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex space-x-3 sm:mt-0">
                        <Link
                            href={route('rooms.edit', {
                                school: school.id,
                                room: room.id,
                            })}
                        >
                            <Button
                                variant="light"
                                color="yellow"
                                icon={PencilIcon}
                            >
                                Edit Room
                            </Button>
                        </Link>
                        <Button
                            variant="light"
                            color="red"
                            icon={TrashIcon}
                            onClick={() => {
                                if (
                                    confirm(
                                        'Are you sure you want to delete this room?',
                                    )
                                ) {
                                    // TODO: Handle delete
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                </div>

                <Grid numItems={1} numItemsSm={2} className="mb-6 gap-6">
                    <Card decoration="top" decorationColor="blue">
                        <div className="flex items-center justify-between">
                            <div>
                                <Text>Room Number</Text>
                                <Metric>{room.room_number}</Metric>
                            </div>
                            <DoorOpen className="h-8 w-8 text-blue-500" />
                        </div>
                    </Card>

                    <Card decoration="top" decorationColor="indigo">
                        <div className="flex items-center justify-between">
                            <div>
                                <Text>Capacity</Text>
                                <Metric>{room.capacity}</Metric>
                            </div>
                            <UsersIcon className="h-8 w-8 text-indigo-500" />
                        </div>
                    </Card>
                </Grid>

                <Card className="mb-6">
                    <Title>Location</Title>
                    <Divider className="my-4" />

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <div className="flex items-center">
                                <Hotel className="mr-2 h-5 w-5 text-gray-500" />
                                <Text>Building</Text>
                            </div>
                            <div className="mt-1">
                                <Link
                                    href={route('buildings.show', {
                                        school: school.id,
                                        building: building.id,
                                    })}
                                    className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                                >
                                    {building.name || 'N/A'}
                                </Link>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center">
                                <Layers className="mr-2 h-5 w-5 text-gray-500" />
                                <Text>Floor</Text>
                            </div>
                            <div className="mt-1">
                                <Link
                                    href={route('buildings.floors.show', {
                                        school: school.id,
                                        building: building.id,
                                        floor: floor.id,
                                    })}
                                    className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                                >
                                    Floor {floor.number || 'Unknown'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="mb-6">
                    <div className="flex items-center justify-between">
                        <Title>Features</Title>
                        <Badge color="blue">{features.length} Features</Badge>
                    </div>
                    <Divider className="my-4" />

                    {features.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {features.map((feature) => (
                                <Badge key={feature.id} color="blue" size="lg">
                                    {feature.name}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <Text>No features available for this room.</Text>
                    )}
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <Title>Room Schedule</Title>
                        <Badge color="purple">
                            {schedules.length} Sessions
                        </Badge>
                    </div>
                    <Divider className="my-4" />

                    <RoomCalendar schedules={schedules} room={room} />
                </Card>
            </div>
        </AppLayout>
    );
}
