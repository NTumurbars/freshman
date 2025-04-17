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
    Text,
    Title,
} from '@tremor/react';

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

    return (
        <Card>
            <div className="flex items-start justify-between">
                <div>
                    <Title>Floor {floor.number}</Title>
                    <Text className="mt-1">Floor ID: {floor.id}</Text>
                </div>
                <HomeModernIcon className="h-8 w-8 text-blue-500" />
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
                <Card decoration="top" decorationColor="purple">
                    <Text>Scheduled Sessions</Text>
                    <Metric>{totalOccupied}</Metric>
                </Card>
            </Grid>
        </Card>
    );
};

export default function Show({ building, school }) {
    // Sort floors by number in descending order (top floor first)
    const sortedFloors = [...building.floors].sort(
        (a, b) => b.number - a.number,
    );
    const totalFloors = building.floors.length;
    const totalRooms = building.floors.reduce(
        (sum, floor) => sum + floor.rooms.length,
        0,
    );

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

                    <Grid numItems={1} numItemsSm={2} className="gap-6">
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
                    </Grid>
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
                        <Card>
                            <div className="building-layout">
                                {sortedFloors.map((floor) => (
                                    <div key={floor.id} className="floor-box">
                                        <div className="floor-header">
                                            <h3>Floor {floor.number}</h3>
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
                                                >
                                                    Manage
                                                </Button>
                                            </Link>
                                        </div>
                                        <div className="rooms-container">
                                            {floor.rooms &&
                                            floor.rooms.length > 0 ? (
                                                <div className="rooms-grid">
                                                    {floor.rooms.map((room) => (
                                                        <div
                                                            key={room.id}
                                                            className="room-box"
                                                        >
                                                            <span>
                                                                {
                                                                    room.room_number
                                                                }
                                                            </span>
                                                            <div className="mt-1 text-xs text-gray-500">
                                                                Cap:{' '}
                                                                {room.capacity}
                                                            </div>
                                                        </div>
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
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
