import AppLayout from '@/Layouts/AppLayout';
import {
    ArrowTopRightOnSquareIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    PlusIcon,
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
    ProgressBar,
    Select,
    SelectItem,
    Text,
    TextInput,
    Title,
} from '@tremor/react';
import { DoorOpen, Hotel, Layers, Percent } from 'lucide-react';
import { useState } from 'react';

const RoomCard = ({ room, school, isAdmin }) => {
    const features = room.features || [];
    const floor = room.floor || {};
    const building = floor.building || {};
    const utilization = room.utilization || {
        utilization_percentage: 0,
        used_slots: 0,
        total_slots: 60,
        available_slots: 60,
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
        <Card className="transition-shadow hover:shadow-lg">
            <div className="flex items-start justify-between">
                <div>
                    <Title>{room.room_number}</Title>
                    <Text className="mt-1">Capacity: {room.capacity}</Text>
                </div>
                <DoorOpen className="h-8 w-8 text-blue-500" />
            </div>

            <div className="mt-4">
                <div className="flex items-center">
                    <Hotel className="mr-1 h-4 w-4 text-gray-500" />
                    <Text className="text-sm">
                        {building.name || 'Unknown Building'}
                    </Text>
                </div>
                <div className="mt-1 flex items-center">
                    <Layers className="mr-1 h-4 w-4 text-gray-500" />
                    <Text className="text-sm">
                        {floor.number
                            ? `Floor ${floor.number}`
                            : 'Unknown Floor'}
                    </Text>
                </div>
            </div>

            {/* Room Utilization Section */}
            <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center">
                        <Percent className="mr-1 h-4 w-4 text-gray-500" />
                        <Text className="text-sm font-medium">Utilization</Text>
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
                    <span>Available: {utilization.available_slots} slots</span>
                </div>
            </div>

            {features.length > 0 && (
                <div className="mt-4">
                    <Text className="text-sm font-medium">Features:</Text>
                    <div className="mt-2 flex items-center gap-2">
                        {features.slice(0, 2).map((feature) => (
                            <Badge key={feature.id} color="blue" size="sm">
                                {feature.name}
                            </Badge>
                        ))}
                        {features.length > 2 && (
                            <Badge color="gray" size="sm">
                                +{features.length - 2} more
                            </Badge>
                        )}
                    </div>
                </div>
            )}

            <Divider className="my-4" />

            <Flex justifyContent="end" className="space-x-2">
                <Link
                    href={route('rooms.show', {
                        school: school.id,
                        room: room.id,
                    })}
                >
                    <Button
                        variant="light"
                        color="blue"
                        icon={ArrowTopRightOnSquareIcon}
                        size="xs"
                    >
                        View
                    </Button>
                </Link>
                {isAdmin && (
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
                            size="xs"
                        >
                            Edit
                        </Button>
                    </Link>
                )}
            </Flex>
        </Card>
    );
};

export default function Index({ rooms }) {
    const { auth } = usePage().props;
    const school = auth.user.school;
    const isAdmin = auth.user.role.id === 2;

    const [searchTerm, setSearchTerm] = useState('');
    const [filterBuilding, setFilterBuilding] = useState('');
    const [utilizationFilter, setUtilizationFilter] = useState('');

    // Extract unique buildings from rooms for filter dropdown
    const buildings = [
        ...new Map(
            rooms
                .filter((room) => room.floor?.building)
                .map((room) => [room.floor.building.id, room.floor.building]),
        ).values(),
    ];

    // Filter rooms based on search, building filter, and utilization
    const filteredRooms = rooms.filter((room) => {
        const matchesSearch =
            !searchTerm ||
            (room.room_number &&
                room.room_number
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()));

        const matchesBuilding =
            !filterBuilding ||
            (room.floor?.building &&
                room.floor.building.id.toString() === filterBuilding);

        // Utilization filter
        const percentage = room.utilization?.utilization_percentage || 0;
        const matchesUtilization =
            !utilizationFilter ||
            (utilizationFilter === 'high' && percentage >= 75) ||
            (utilizationFilter === 'medium' &&
                percentage >= 25 &&
                percentage < 75) ||
            (utilizationFilter === 'low' && percentage < 25);

        return matchesSearch && matchesBuilding && matchesUtilization;
    });

    return (
        <AppLayout>
            <Head title="Room Management" />

            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center">
                        <DoorOpen className="mr-3 h-8 w-8 text-blue-600" />
                        <div>
                            <Title>Room Management</Title>
                            <Text>View and manage all rooms across campus</Text>
                        </div>
                    </div>
                    {isAdmin && (
                        <div className="mt-4 sm:mt-0">
                            <Link
                                href={route('rooms.create', {
                                    school: school.id,
                                })}
                            >
                                <Button icon={PlusIcon}>Add Room</Button>
                            </Link>
                        </div>
                    )}
                </div>

                <Card className="mb-6">
                    <div className="sm:flex sm:items-center sm:justify-between">
                        <Title>Filters</Title>
                        <Text className="text-gray-500">
                            {filteredRooms.length} rooms found
                        </Text>
                    </div>
                    <Divider className="my-4" />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <Text>Search Rooms</Text>
                            <TextInput
                                icon={MagnifyingGlassIcon}
                                placeholder="Search by room number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Text>Filter by Building</Text>
                            <Select
                                value={filterBuilding}
                                onValueChange={setFilterBuilding}
                                placeholder="All Buildings"
                                className="mt-1"
                                icon={Hotel}
                            >
                                <SelectItem value="">All Buildings</SelectItem>
                                {buildings.map((building) => (
                                    <SelectItem
                                        key={building.id}
                                        value={building.id.toString()}
                                    >
                                        {building.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>

                        <div>
                            <Text>Filter by Utilization</Text>
                            <Select
                                value={utilizationFilter}
                                onValueChange={setUtilizationFilter}
                                placeholder="All Utilization Levels"
                                className="mt-1"
                                icon={Percent}
                            >
                                <SelectItem value="">
                                    All Utilization Levels
                                </SelectItem>
                                <SelectItem value="high">
                                    High (75%+)
                                </SelectItem>
                                <SelectItem value="medium">
                                    Medium (25-75%)
                                </SelectItem>
                                <SelectItem value="low">
                                    Low (&lt; 25%)
                                </SelectItem>
                            </Select>
                        </div>
                    </div>
                </Card>

                {/* Room utilization summary */}
                <Card className="mb-6">
                    <Title>Utilization Summary</Title>
                    <Text className="mt-1 text-gray-500">
                        Overview of room usage across campus
                    </Text>
                    <Divider className="my-4" />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="rounded-lg bg-blue-50 p-4">
                            <div className="flex items-center justify-between">
                                <Text>Total Rooms</Text>
                                <Badge color="blue" size="lg">
                                    {rooms.length}
                                </Badge>
                            </div>
                        </div>

                        <div className="rounded-lg bg-green-50 p-4">
                            <div className="flex items-center justify-between">
                                <Text>Available Slots</Text>
                                <Badge color="green" size="lg">
                                    {rooms.reduce(
                                        (sum, room) =>
                                            sum +
                                            (room.utilization
                                                ?.available_slots || 0),
                                        0,
                                    )}
                                </Badge>
                            </div>
                        </div>

                        <div className="rounded-lg bg-amber-50 p-4">
                            <div className="flex items-center justify-between">
                                <Text>Avg. Utilization</Text>
                                <Badge color="amber" size="lg">
                                    {Math.round(
                                        rooms.reduce(
                                            (sum, room) =>
                                                sum +
                                                (room.utilization
                                                    ?.utilization_percentage ||
                                                    0),
                                            0,
                                        ) / rooms.length,
                                    )}
                                    %
                                </Badge>
                            </div>
                        </div>
                    </div>
                </Card>

                {filteredRooms.length === 0 ? (
                    <Card>
                        <div className="flex flex-col items-center justify-center py-12">
                            <DoorOpen className="h-12 w-12 text-gray-400" />
                            <Text className="mt-2">
                                {searchTerm ||
                                filterBuilding ||
                                utilizationFilter
                                    ? 'No rooms found matching your filters'
                                    : 'No rooms found'}
                            </Text>
                            <Link
                                href={route('rooms.create', {
                                    school: school.id,
                                })}
                                className="mt-4"
                            >
                                <Button variant="light" icon={PlusIcon}>
                                    Add your first room
                                </Button>
                            </Link>
                        </div>
                    </Card>
                ) : (
                    <Grid
                        numItems={1}
                        numItemsSm={2}
                        numItemsLg={3}
                        className="gap-6"
                    >
                        {filteredRooms.map((room) => (
                            <Col key={room.id}>
                                <RoomCard
                                    room={room}
                                    school={school}
                                    isAdmin={isAdmin}
                                />
                            </Col>
                        ))}
                    </Grid>
                )}
            </div>
        </AppLayout>
    );
}
