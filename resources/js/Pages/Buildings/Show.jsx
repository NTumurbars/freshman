import AppLayout from '@/Layouts/AppLayout';
import {
    ArrowLeftIcon,
    BuildingOffice2Icon,
    BuildingStorefrontIcon,
    HomeModernIcon,
    PencilIcon,
} from '@heroicons/react/24/outline';
import { Head, Link } from '@inertiajs/react';
import {
    Badge,
    Button,
    Card,
    Divider,
    Flex,
    Grid,
    Metric,
    ProgressBar,
    Text,
    Title,
} from '@tremor/react';
import { Layers, Percent, Clock } from 'lucide-react';

const FloorCard = ({ floor }) => {
    const totalRooms = floor.rooms.length;
    const totalCapacity = floor.rooms.reduce(
        (sum, room) => sum + room.capacity,
        0,
    );
    const totalOccupied = floor.rooms.reduce(
        (sum, room) => sum + room.occupied_slots,
        0,
    );

    // Get floor utilization
    const floorUtilization = floor.utilization || {
        rooms_count: totalRooms,
        utilization_percentage: 0,
        used_slots: 0,
        possible_slots: 0
    };

    // Determine color based on utilization percentage
    const getUtilizationColor = (percentage) => {
        if (percentage >= 75) return 'red';
        if (percentage >= 50) return 'amber';
        if (percentage >= 25) return 'emerald';
        return 'blue';
    };

    const utilizationColor = getUtilizationColor(floorUtilization.utilization_percentage);

    return (
        <Card>
            <div className="flex items-start justify-between">
                <div>
                    <Title>Floor {floor.number}</Title>
                    <Text className="mt-1">Floor ID: {floor.id}</Text>
                </div>
                <Layers className="h-8 w-8 text-blue-500" />
            </div>

            <Grid numItems={1} numItemsSm={3} className="mt-6 gap-6">
                <Card decoration="top" decorationColor="blue">
                    <Text>Rooms</Text>
                    <Metric>{totalRooms}</Metric>
                </Card>
                <Card decoration="top" decorationColor="indigo">
                    <Text>Total Capacity</Text>
                    <Metric>{totalCapacity}</Metric>
                </Card>
                <Card decoration="top" decorationColor={utilizationColor}>
                    <Text>Utilization</Text>
                    <Metric>{floorUtilization.utilization_percentage}%</Metric>
                </Card>
            </Grid>

            {/* Utilization progress bar */}
            <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                    <Text className="text-sm">Room Utilization</Text>
                    <Badge color={utilizationColor} size="sm">
                        {floorUtilization.used_slots} of {floorUtilization.possible_slots} slots used
                    </Badge>
                </div>
                <ProgressBar value={floorUtilization.utilization_percentage} color={utilizationColor} />
            </div>
        </Card>
    );
};

export default function Show({ building, school, utilization }) {
    // Sort floors by number in descending order (top floor first)
    const sortedFloors = [...building.floors].sort(
        (a, b) => b.number - a.number,
    );
    const totalFloors = building.floors.length;
    const totalRooms = building.floors.reduce(
        (sum, floor) => sum + floor.rooms.length,
        0,
    );

    // Determine color based on utilization percentage
    const getUtilizationColor = (percentage) => {
        if (percentage >= 75) return 'red';
        if (percentage >= 50) return 'amber';
        if (percentage >= 25) return 'emerald';
        return 'blue';
    };

    const utilizationColor = getUtilizationColor(utilization?.utilization_percentage || 0);

    // Format room number with floor
    const formatRoomDisplay = (room) => {
        return `Floor ${room.floor_number}, Room ${room.room_number}`;
    };

    return (
        <AppLayout>
            <Head title={building.name} />

            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center">
                        <Link href={route('buildings.index', school.id)}>
                            <Button
                                variant="light"
                                color="gray"
                                icon={ArrowLeftIcon}
                                className="mr-4"
                            >
                                Back
                            </Button>
                        </Link>
                        <div className="flex items-center">
                            <BuildingOffice2Icon className="mr-3 h-8 w-8 text-blue-600" />
                            <div>
                                <Title>{building.name}</Title>
                                <Text>
                                    Building details and floor information
                                </Text>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Link
                            href={route('buildings.edit', {
                                school: school.id,
                                building: building.id,
                            })}
                        >
                            <Button icon={PencilIcon} variant="secondary">
                                Edit Building
                            </Button>
                        </Link>
                    </div>
                </div>

                <Card className="mb-6">
                    <Flex>
                        <div>
                            <Title>Building Summary</Title>
                        </div>
                        <Link
                            href={route('buildings.floors.index', {
                                school: school.id,
                                building: building.id,
                            })}
                        >
                            <Button>Manage Floors</Button>
                        </Link>
                    </Flex>

                    <Divider className="my-4" />

                    <Grid numItems={1} numItemsSm={3} className="gap-6">
                        <Card decoration="top" decorationColor="blue">
                            <Flex alignItems="center">
                                <BuildingOffice2Icon className="mr-2 h-6 w-6 text-blue-600" />
                                <Text>Total Floors</Text>
                            </Flex>
                            <Metric>{totalFloors}</Metric>
                        </Card>
                        <Card decoration="top" decorationColor="indigo">
                            <Flex alignItems="center">
                                <BuildingStorefrontIcon className="mr-2 h-6 w-6 text-indigo-600" />
                                <Text>Total Rooms</Text>
                            </Flex>
                            <Metric>{totalRooms}</Metric>
                        </Card>
                        <Card decoration="top" decorationColor={utilizationColor}>
                            <Flex alignItems="center">
                                <Percent className="mr-2 h-6 w-6 text-blue-600" />
                                <Text>Utilization</Text>
                            </Flex>
                            <Metric>{utilization?.utilization_percentage || 0}%</Metric>
                        </Card>
                    </Grid>
                </Card>

                {/* Building Utilization Section */}
                <Card className="mb-6">
                    <div className="flex items-center">
                        <Percent className="mr-2 h-5 w-5 text-gray-500" />
                        <Title>Building Utilization</Title>
                    </div>
                    <Divider className="my-4" />

                    <div className="mb-6">
                        <Text className="mb-2">Overall Space Utilization</Text>
                        <ProgressBar
                            value={utilization?.utilization_percentage || 0}
                            color={utilizationColor}
                            className="h-2.5"
                        />
                        <div className="mt-2 text-right text-xs text-gray-500">
                            {utilization?.used_slots || 0} of {utilization?.possible_slots || 0} slots used
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Most Utilized Rooms */}
                        <div>
                            <Text className="mb-2 font-medium text-gray-700">Most Utilized Rooms</Text>
                            <div className="space-y-2">
                                {utilization?.most_utilized_rooms?.map((room, index) => (
                                    <div key={room.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                                                    {index + 1}
                                                </div>
                                                <div className="ml-3">
                                                    <Link
                                                        href={route('rooms.show', {
                                                            school: school.id,
                                                            room: room.id,
                                                        })}
                                                        className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                                                    >
                                                        {formatRoomDisplay(room)}
                                                    </Link>
                                                    <div className="text-xs text-gray-500">
                                                        Capacity: {room.capacity}
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge color={getUtilizationColor(room.utilization_percentage)}>
                                                {room.utilization_percentage}%
                                            </Badge>
                                        </div>
                                    </div>
                                ))}

                                {(!utilization?.most_utilized_rooms || utilization.most_utilized_rooms.length === 0) && (
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-gray-500">
                                        No room utilization data available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Least Utilized Rooms */}
                        <div>
                            <Text className="mb-2 font-medium text-gray-700">Least Utilized Rooms</Text>
                            <div className="space-y-2">
                                {utilization?.least_utilized_rooms?.map((room, index) => (
                                    <div key={room.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700">
                                                    {index + 1}
                                                </div>
                                                <div className="ml-3">
                                                    <Link
                                                        href={route('rooms.show', {
                                                            school: school.id,
                                                            room: room.id,
                                                        })}
                                                        className="font-medium text-gray-900 hover:text-blue-600 hover:underline"
                                                    >
                                                        {formatRoomDisplay(room)}
                                                    </Link>
                                                    <div className="text-xs text-gray-500">
                                                        Capacity: {room.capacity}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Badge color="green">
                                                    {room.available_slots} free slots
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {(!utilization?.least_utilized_rooms || utilization.least_utilized_rooms.length === 0) && (
                                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-center text-gray-500">
                                        No room utilization data available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <Text className="text-xs text-gray-500">
                            *Utilization is calculated based on 12 hours per day (8am-8pm), 5 days per week
                        </Text>
                    </div>
                </Card>

                <div className="mt-8">
                    <Flex
                        justifyContent="between"
                        alignItems="center"
                        className="mb-4"
                    >
                        <Title>Building Layout</Title>
                        <Link
                            href={route('buildings.floors.create', {
                                school: school.id,
                                building: building.id,
                            })}
                        >
                            <Button variant="light" icon={PencilIcon}>
                                Add Floor
                            </Button>
                        </Link>
                    </Flex>

                    {sortedFloors.length === 0 ? (
                        <Card>
                            <div className="flex flex-col items-center justify-center py-12">
                                <HomeModernIcon className="h-12 w-12 text-gray-400" />
                                <Text className="mt-2">No floors found</Text>
                                <Link
                                    href={route('buildings.floors.create', {
                                        school: school.id,
                                        building: building.id,
                                    })}
                                    className="mt-4"
                                >
                                    <Button variant="light">
                                        Add your first floor
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ) : (
                        <div className="building-container">
                            {sortedFloors.map((floor) => (
                                <Card key={floor.id} className="floor-card mb-4">
                                    <div className="floor-header">
                                        <div className="flex items-center">
                                            <HomeModernIcon className="h-5 w-5 mr-2 text-white" />
                                            <h3>Floor {floor.number}</h3>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                href={route(
                                                    'buildings.floors.show',
                                                    {
                                                        school: school.id,
                                                        building: building.id,
                                                        floor: floor.id,
                                                    },
                                                )}
                                            >
                                                <Button
                                                    variant="light"
                                                    size="xs"
                                                    className="text-white border-white hover:bg-blue-700"
                                                >
                                                    Manage
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="rooms-container">
                                        {floor.rooms &&
                                        floor.rooms.length > 0 ? (
                                            <div className="rooms-grid">
                                                {floor.rooms.map((room) => (
                                                    <Link
                                                        key={room.id}
                                                        href={route(
                                                            'rooms.show',
                                                            {
                                                                school: school.id,
                                                                room: room.id,
                                                            },
                                                        )}
                                                        className="room-link"
                                                    >
                                                        <div className="room-box">
                                                            <div className="room-number">
                                                                {room.room_number}
                                                            </div>
                                                            <div className="room-capacity">
                                                                Capacity: {room.capacity}
                                                            </div>
                                                            <div className="room-status">
                                                                {room.occupied_slots > 0 ? (
                                                                    <Badge color="orange">
                                                                        {room.occupied_slots} Session{room.occupied_slots !== 1 ? 's' : ''}
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge color="green">
                                                                        Available
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="no-rooms">
                                                <Text>No rooms</Text>
                                            </div>
                                        )}
                                    </div>
                                    <div className="floor-footer">
                                        <Badge color="indigo">
                                            {floor.rooms
                                                ? floor.rooms.length
                                                : 0}{' '}
                                            Rooms
                                        </Badge>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
