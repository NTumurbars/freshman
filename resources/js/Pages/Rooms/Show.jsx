import AppLayout from '@/Layouts/AppLayout';
import {
    ArrowLeftIcon,
    CalendarIcon,
    PencilIcon,
    TrashIcon,
    UsersIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Badge,
    Button,
    Card,
    Divider,
    Grid,
    Metric,
    ProgressBar,
    Text,
    Title,
} from '@tremor/react';
import { DoorOpen, Hotel, Layers, Percent, Clock } from 'lucide-react';
import RoomCalendar from '@/Components/RoomCalendar';

export default function Show({ room }) {
    const { auth } = usePage().props;
    const school = auth.user.school;

    const features = room.features || [];
    const schedules = room.schedules || [];
    const floor = room.floor || {};
    const building = floor.building || {};
    const utilization = room.utilization || {
        utilization_percentage: 0,
        used_slots: 0,
        total_slots: 60,
        available_slots: 60
    };

    // Determine color based on utilization percentage
    const getUtilizationColor = (percentage) => {
        if (percentage >= 75) return 'red';
        if (percentage >= 50) return 'amber';
        if (percentage >= 25) return 'emerald';
        return 'blue';
    };

    const utilizationColor = getUtilizationColor(utilization.utilization_percentage);

    // Determine utilization status text
    const getUtilizationStatus = (percentage) => {
        if (percentage >= 75) return 'Heavily Utilized';
        if (percentage >= 50) return 'Moderately Utilized';
        if (percentage >= 25) return 'Lightly Utilized';
        return 'Underutilized';
    };

    const utilizationStatus = getUtilizationStatus(utilization.utilization_percentage);

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
                        <Button
                            variant="primary"
                            icon={CalendarIcon}
                            className="bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => {
                                // Use the useForm visit method with data to pre-fill values
                                const url = route('schedules.create', { school: school.id });
                                window.location.href = `${url}?room_id=${room.id}&location_type=in-person&return_url=${encodeURIComponent(
                                    route('rooms.show', {
                                        school: school.id,
                                        room: room.id
                                    })
                                )}`;
                            }}
                        >
                            Create Schedule
                        </Button>
                        <Link
                            href={route('rooms.edit', {
                                school: school.id,
                                room: room.id,
                            })}
                        >
                            <Button
                                variant="secondary"
                                icon={PencilIcon}
                                className="border-blue-500 text-blue-600 hover:bg-blue-50"
                            >
                                Edit Room
                            </Button>
                        </Link>
                        <Button
                            variant="secondary"
                            icon={TrashIcon}
                            className="border-red-500 text-red-600 hover:bg-red-50"
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

                <Grid numItems={1} numItemsSm={3} className="mb-6 gap-6">
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

                    <Card decoration="top" decorationColor={utilizationColor}>
                        <div className="flex items-center justify-between">
                            <div>
                                <Text>Utilization</Text>
                                <Metric>{utilization.utilization_percentage}%</Metric>
                            </div>
                            <Percent className="h-8 w-8 text-blue-500" />
                        </div>
                    </Card>
                </Grid>

                {/* Room Utilization Section */}
                <Card className="mb-6">
                    <div className="flex items-center">
                        <Percent className="mr-2 h-5 w-5 text-gray-500" />
                        <Title>Room Utilization</Title>
                    </div>
                    <Divider className="my-4" />

                    <div className="mb-5">
                        <div className="flex items-center justify-between mb-2">
                            <Text>Current Utilization</Text>
                            <Badge color={utilizationColor} size="lg">
                                {utilizationStatus}
                            </Badge>
                        </div>
                        <ProgressBar
                            value={utilization.utilization_percentage}
                            color={utilizationColor}
                            className="h-2"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className={`rounded-md bg-${utilizationColor}-50 p-4`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Clock className="mr-1 h-4 w-4 text-gray-600" />
                                    <Text>Used Slots</Text>
                                </div>
                                <Text className="font-semibold">{utilization.used_slots}</Text>
                            </div>
                        </div>

                        <div className="rounded-md bg-green-50 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Clock className="mr-1 h-4 w-4 text-gray-600" />
                                    <Text>Available Slots</Text>
                                </div>
                                <Text className="font-semibold">{utilization.available_slots}</Text>
                            </div>
                        </div>

                        <div className="rounded-md bg-gray-50 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <Clock className="mr-1 h-4 w-4 text-gray-600" />
                                    <Text>Total Slots</Text>
                                </div>
                                <Text className="font-semibold">{utilization.total_slots}</Text>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <Text className="text-xs text-gray-500">
                            *Utilization is calculated based on 12 hours per day, 5 days per week (60 total possible time slots)
                        </Text>
                    </div>
                </Card>

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

                    <RoomCalendar schedules={schedules} room={room} school={school} />
                </Card>
            </div>
        </AppLayout>
    );
}
