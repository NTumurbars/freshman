import AppLayout from '@/Layouts/AppLayout';
import {
    ArrowLeftIcon,
    BuildingOffice2Icon,
    HomeModernIcon,
    PencilIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Badge,
    Button,
    Card,
    Col,
    Divider,
    Flex,
    Grid,
    Metric,
    ProgressBar,
    Text,
    Title,
} from '@tremor/react';
import { Percent } from 'lucide-react';

const RoomCard = ({ room, school, building, floor, isAdmin }) => {
    const features = room.features || [];
    const utilization = room.utilization || {
        utilization_percentage: 0,
        used_slots: 0,
        available_slots: 60,
        total_slots: 60,
    };

    // Determine color based on utilization percentage
    const getUtilizationColor = (percentage) => {
        if (percentage >= 75) return 'red';
        if (percentage >= 50) return 'amber';
        if (percentage >= 25) return 'emerald';
        return 'blue';
    };

    const utilizationColor = getUtilizationColor(
        utilization.utilization_percentage,
    );

    return (
        <Card className="room-detail-card transition-all hover:-translate-y-1 hover:shadow-lg">
            <Link
                href={route('rooms.show', {
                    school: school.id,
                    room: room.id,
                })}
                className="block"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <Title className="text-blue-700">
                            {room.room_number}
                        </Title>
                        <div className="mt-1 flex items-center">
                            <UsersIcon className="mr-1 h-4 w-4 text-gray-500" />
                            <Text className="text-gray-600">
                                Capacity: {room.capacity}
                            </Text>
                        </div>
                    </div>
                    <div className="room-icon-wrapper">
                        <HomeModernIcon className="h-8 w-8 text-blue-500" />
                    </div>
                </div>

                {/* Room Utilization Section */}
                <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center">
                            <Percent className="mr-1 h-4 w-4 text-gray-500" />
                            <Text className="text-sm font-medium">
                                Utilization
                            </Text>
                        </div>
                        <Badge color={utilizationColor} size="sm">
                            {utilization.utilization_percentage}%
                        </Badge>
                    </div>
                    <ProgressBar
                        value={utilization.utilization_percentage}
                        color={utilizationColor}
                        className="mt-1"
                    />
                    <div className="mt-1 flex justify-between text-xs text-gray-500">
                        <span>Used: {utilization.used_slots} slots</span>
                        <span>
                            Available: {utilization.available_slots} slots
                        </span>
                    </div>
                </div>

                {features.length > 0 && (
                    <div className="room-features mt-4">
                        <Text className="font-medium text-gray-700">
                            Features:
                        </Text>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {features.map((feature) => (
                                <Badge
                                    key={feature.id}
                                    color="blue"
                                    className="feature-badge"
                                >
                                    {feature.name}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}

                <div className="view-details-hint mt-2 text-right">
                    <Badge color="indigo" size="sm">
                        View Details
                    </Badge>
                </div>
            </Link>

            <Divider className="my-4" />

            {isAdmin && (
                <Flex justifyContent="end">
                    <Link
                        href={route('rooms.edit', {
                            school: school.id,
                            room: room.id,
                            return_url: route('buildings.floors.show', {
                                school: school.id,
                                building: building.id,
                                floor: floor.id,
                            }),
                        })}
                    >
                        <Button
                            variant="light"
                            icon={PencilIcon}
                            className="edit-room-btn"
                        >
                            Edit Room
                        </Button>
                    </Link>
                </Flex>
            )}
        </Card>
    );
};

export default function Show({
    floor,
    building,
    school,
    utilization,
    processed_rooms,
}) {
    const rooms = floor.rooms || [];

    const { auth } = usePage().props;
    const isAdmin = auth.user.role.id === 2;

    const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);

    // Determine color based on utilization percentage
    const getUtilizationColor = (percentage) => {
        if (percentage >= 75) return 'red';
        if (percentage >= 50) return 'amber';
        if (percentage >= 25) return 'emerald';
        return 'blue';
    };

    const utilizationColor = getUtilizationColor(
        utilization?.utilization_percentage || 0,
    );

    return (
        <AppLayout>
            <Head title={`Floor ${floor.number} - ${building.name}`} />

            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center">
                        <Link
                            href={route('buildings.floors.index', {
                                school: school.id,
                                building: building.id,
                            })}
                        >
                            <Button
                                variant="light"
                                color="gray"
                                icon={ArrowLeftIcon}
                                className="mr-4"
                            >
                                Back to Floors
                            </Button>
                        </Link>
                        <div className="flex items-center">
                            <BuildingOffice2Icon className="mr-3 h-8 w-8 text-blue-600" />
                            <div>
                                <Title>Floor {floor.number}</Title>
                                <Text>Floor details in {building.name}</Text>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex space-x-3 sm:mt-0">
                        {isAdmin && (
                            <Link
                                href={route('buildings.floors.edit', {
                                    school: school.id,
                                    building: building.id,
                                    floor: floor.id,
                                })}
                            >
                                <Button variant="secondary" icon={PencilIcon}>
                                    Edit Floor
                                </Button>
                            </Link>
                        )}
                        <Link
                            href={route('buildings.floors.rooms.index', {
                                school: school.id,
                                building: building.id,
                                floor: floor.id,
                            })}
                        >
                            <Button>Manage Rooms</Button>
                        </Link>
                    </div>
                </div>

                <Card className="mb-6">
                    <Flex>
                        <div>
                            <Title>Floor Summary</Title>
                            <Text>Overview of rooms and capacity</Text>
                        </div>
                    </Flex>

                    <Divider className="my-4" />

                    <Grid numItems={1} numItemsSm={3} className="gap-6">
                        <Card decoration="top" decorationColor="blue">
                            <Flex alignItems="center">
                                <HomeModernIcon className="mr-2 h-6 w-6 text-blue-600" />
                                <Text>Total Rooms</Text>
                            </Flex>
                            <Metric>{rooms.length}</Metric>
                        </Card>
                        <Card decoration="top" decorationColor="indigo">
                            <Flex alignItems="center">
                                <UsersIcon className="mr-2 h-6 w-6 text-indigo-600" />
                                <Text>Total Capacity</Text>
                            </Flex>
                            <Metric>{totalCapacity}</Metric>
                        </Card>
                        <Card
                            decoration="top"
                            decorationColor={utilizationColor}
                        >
                            <Flex alignItems="center">
                                <Percent className="mr-2 h-6 w-6 text-blue-600" />
                                <Text>Utilization</Text>
                            </Flex>
                            <Metric>
                                {utilization?.utilization_percentage || 0}%
                            </Metric>
                        </Card>
                    </Grid>
                </Card>

                {/* Floor Utilization Section */}
                <Card className="mb-6">
                    <div className="flex items-center">
                        <Percent className="mr-2 h-5 w-5 text-gray-500" />
                        <Title>Floor Utilization</Title>
                    </div>
                    <Divider className="my-4" />

                    <div className="mb-6">
                        <Text className="mb-2">Overall Floor Utilization</Text>
                        <ProgressBar
                            value={utilization?.utilization_percentage || 0}
                            color={utilizationColor}
                            className="h-2.5"
                        />
                        <div className="mt-2 text-right text-xs text-gray-500">
                            {utilization?.used_slots || 0} of{' '}
                            {utilization?.possible_slots || 0} slots used
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Most Utilized Rooms */}
                        <div>
                            <Text className="mb-2 font-medium text-gray-700">
                                Most Utilized Rooms
                            </Text>
                            <div className="space-y-2">
                                {utilization?.most_utilized_rooms?.map(
                                    (room, index) => (
                                        <div
                                            key={room.id}
                                            className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                                        {index + 1}
                                                    </div>
                                                    <div className="ml-3">
                                                        <Link
                                                            href={route(
                                                                'rooms.show',
                                                                {
                                                                    school: school.id,
                                                                    room: room.id,
                                                                },
                                                            )}
                                                            className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                                                        >
                                                            Room{' '}
                                                            {room.room_number}
                                                        </Link>
                                                        <div className="text-xs text-gray-500">
                                                            Capacity:{' '}
                                                            {room.capacity}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Badge
                                                    color={getUtilizationColor(
                                                        room.utilization_percentage,
                                                    )}
                                                >
                                                    {
                                                        room.utilization_percentage
                                                    }
                                                    %
                                                </Badge>
                                            </div>
                                        </div>
                                    ),
                                )}

                                {(!utilization?.most_utilized_rooms ||
                                    utilization.most_utilized_rooms.length ===
                                        0) && (
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-gray-500">
                                        No room utilization data available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Least Utilized Rooms */}
                        <div>
                            <Text className="mb-2 font-medium text-gray-700">
                                Least Utilized Rooms
                            </Text>
                            <div className="space-y-2">
                                {utilization?.least_utilized_rooms?.map(
                                    (room, index) => (
                                        <div
                                            key={room.id}
                                            className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                                                        {index + 1}
                                                    </div>
                                                    <div className="ml-3">
                                                        <Link
                                                            href={route(
                                                                'rooms.show',
                                                                {
                                                                    school: school.id,
                                                                    room: room.id,
                                                                },
                                                            )}
                                                            className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                                                        >
                                                            Room{' '}
                                                            {room.room_number}
                                                        </Link>
                                                        <div className="text-xs text-gray-500">
                                                            Capacity:{' '}
                                                            {room.capacity}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <Badge color="green">
                                                        {room.available_slots}{' '}
                                                        free slots
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ),
                                )}

                                {(!utilization?.least_utilized_rooms ||
                                    utilization.least_utilized_rooms.length ===
                                        0) && (
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-gray-500">
                                        No room utilization data available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <Text className="text-xs text-gray-500">
                            *Utilization is calculated based on 12 hours per day
                            (8am-8pm), 5 days per week
                        </Text>
                    </div>
                </Card>

                <div className="mt-8">
                    <Flex
                        justifyContent="between"
                        alignItems="center"
                        className="mb-4"
                    >
                        <Title>Rooms on Floor {floor.number}</Title>
                        {isAdmin && (
                            <Link
                                href={route('rooms.create', {
                                    school: school.id,
                                    floor_id: floor.id,
                                    return_url: route('buildings.floors.show', {
                                        school: school.id,
                                        building: building.id,
                                        floor: floor.id,
                                    }),
                                })}
                            >
                                <Button variant="light" icon={PencilIcon}>
                                    Add Room
                                </Button>
                            </Link>
                        )}
                    </Flex>

                    {rooms.length === 0 ? (
                        <Card className="empty-rooms-card">
                            <div className="flex flex-col items-center justify-center py-12">
                                <HomeModernIcon className="h-12 w-12 text-gray-400" />
                                <Text className="mt-2">
                                    No rooms found in this floor
                                </Text>
                                {isAdmin && (
                                    <Link
                                        href={route('rooms.create', {
                                            school: school.id,
                                            floor_id: floor.id,
                                            return_url: route(
                                                'buildings.floors.show',
                                                {
                                                    school: school.id,
                                                    building: building.id,
                                                    floor: floor.id,
                                                },
                                            ),
                                        })}
                                        className="mt-4"
                                    >
                                        <Button
                                            variant="light"
                                            icon={PencilIcon}
                                        >
                                            Add your first room
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </Card>
                    ) : (
                        <Grid
                            numItems={1}
                            numItemsSm={2}
                            numItemsLg={3}
                            className="rooms-grid gap-6"
                        >
                            {rooms.map((room) => (
                                <Col key={room.id}>
                                    <RoomCard
                                        room={room}
                                        school={school}
                                        building={building}
                                        floor={floor}
                                        isAdmin={isAdmin}
                                    />
                                </Col>
                            ))}
                        </Grid>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
