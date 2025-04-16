import AppLayout from '@/Layouts/AppLayout';
import {
    ArrowLeftIcon,
    ComputerDesktopIcon,
    PlusIcon,
    UsersIcon,
    WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Badge,
    Button,
    Card,
    Col,
    Divider,
    Flex,
    Grid,
    Metric,
    Text,
    Title,
} from '@tremor/react';
import { DoorOpen, Hotel, Layers } from 'lucide-react';

const RoomCard = ({ room, school, building, floor }) => {
    const features = room.features || [];

    return (
        <Card>
            <div className="flex items-start justify-between">
                <div>
                    <Title>{room.room_number}</Title>
                    <Text className="mt-1">Capacity: {room.capacity}</Text>
                </div>
                <DoorOpen className="h-8 w-8 text-blue-500" />
            </div>

            {features.length > 0 && (
                <div className="mt-4">
                    <Text className="font-medium">Features:</Text>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {features.map((feature) => (
                            <Badge key={feature.id} color="blue">
                                {feature.name}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-4">
                <Text className="font-medium">Scheduled Sessions:</Text>
                <Metric>{room.schedules?.length || 0}</Metric>
            </div>

            <Divider className="my-4" />

            <Flex justifyContent="end">
                <Link
                    href={route('rooms.edit', {
                        school: school.id,
                        room: room.id,
                        return_url: route('buildings.floors.rooms.index', {
                            school: school.id,
                            building: building.id,
                            floor: floor.id,
                        }),
                    })}
                >
                    <Button variant="light" icon={WrenchScrewdriverIcon}>
                        Manage Room
                    </Button>
                </Link>
            </Flex>
        </Card>
    );
};

export default function Index({ rooms, floor, building, school }) {
    const { visit } = useForm();

    const handleAddRoom = () => {
        // Use Inertia's visit method with the proper parameters
        visit(route('rooms.create', { school: school.id }), {
            data: {
                floor_id: floor.id,
                return_url: route('buildings.floors.rooms.index', {
                    school: school.id,
                    building: building.id,
                    floor: floor.id,
                }),
            },
            preserveState: false,
        });
    };

    return (
        <AppLayout>
            <Head title={`Rooms - ${floor.name}`} />

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
                            <Layers className="mr-3 h-8 w-8 text-blue-600" />
                            <div>
                                <Title>Floor {floor.number} Rooms</Title>
                                <Text>
                                    Manage rooms in {building.name}, Floor{' '}
                                    {floor.number}
                                </Text>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Button icon={PlusIcon} onClick={handleAddRoom}>
                            Add Room
                        </Button>
                    </div>
                </div>

                <Card className="mb-6">
                    <Flex alignItems="center">
                        <div className="flex items-center">
                            <Hotel className="mr-2 h-6 w-6 text-blue-600" />
                            <Title>Room Summary</Title>
                        </div>
                    </Flex>

                    <Divider className="my-4" />

                    <Grid numItems={1} numItemsSm={3} className="gap-6">
                        <Card decoration="top" decorationColor="blue">
                            <Flex alignItems="center">
                                <DoorOpen className="mr-2 h-6 w-6 text-blue-600" />
                                <Text>Total Rooms</Text>
                            </Flex>
                            <Metric>{rooms.length}</Metric>
                        </Card>
                        <Card decoration="top" decorationColor="indigo">
                            <Flex alignItems="center">
                                <UsersIcon className="mr-2 h-6 w-6 text-indigo-600" />
                                <Text>Total Capacity</Text>
                            </Flex>
                            <Metric>
                                {rooms.reduce(
                                    (sum, room) => sum + room.capacity,
                                    0,
                                )}
                            </Metric>
                        </Card>
                        <Card decoration="top" decorationColor="purple">
                            <Flex alignItems="center">
                                <ComputerDesktopIcon className="mr-2 h-6 w-6 text-purple-600" />
                                <Text>Features Available</Text>
                            </Flex>
                            <Metric>
                                {
                                    new Set(
                                        rooms
                                            .flatMap(
                                                (room) => room.features || [],
                                            )
                                            .map((f) => f.id),
                                    ).size
                                }
                            </Metric>
                        </Card>
                    </Grid>
                </Card>

                <div className="mt-8">
                    <Title className="mb-4">Rooms</Title>
                    {rooms.length === 0 ? (
                        <Card>
                            <div className="flex flex-col items-center justify-center py-12">
                                <DoorOpen className="h-12 w-12 text-gray-400" />
                                <Text className="mt-2">
                                    No rooms found in this floor
                                </Text>
                                <Button
                                    variant="light"
                                    icon={PlusIcon}
                                    onClick={handleAddRoom}
                                    className="mt-4"
                                >
                                    Add your first room
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        <Grid
                            numItems={1}
                            numItemsSm={2}
                            numItemsLg={3}
                            className="gap-6"
                        >
                            {rooms.map((room) => (
                                <Col key={room.id}>
                                    <RoomCard
                                        room={room}
                                        school={school}
                                        building={building}
                                        floor={floor}
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
