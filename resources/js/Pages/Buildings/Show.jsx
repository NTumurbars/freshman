import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Card,
    Title,
    Text,
    Grid,
    Col,
    Metric,
    Button,
    Flex,
    Divider,
} from '@tremor/react';
import {
    BuildingOffice2Icon,
    PencilIcon,
    ArrowLeftIcon,
    BuildingStorefrontIcon,
    HomeModernIcon,
} from '@heroicons/react/24/outline';

const FloorCard = ({ floor }) => {
    const totalRooms = floor.rooms.length;
    const totalCapacity = floor.rooms.reduce((sum, room) => sum + room.capacity, 0);
    const totalOccupied = floor.rooms.reduce((sum, room) => sum + room.occupied_slots, 0);

    return (
        <Card>
            <div className="flex items-start justify-between">
                <div>
                    <Title>{floor.name}</Title>
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
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;

    const totalFloors = building.floors.length;
    const totalRooms = building.floors.reduce(
        (sum, floor) => sum + floor.rooms.length, 0
    );

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title={building.name} />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between mb-6">
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
                            <BuildingOffice2Icon className="h-8 w-8 text-blue-600 mr-3" />
                            <div>
                                <Title>{building.name}</Title>
                                <Text>Building details and floor information</Text>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Link href={route('buildings.edit', { school: school.id, building: building.id })}>
                            <Button
                                icon={PencilIcon}
                                variant="secondary"
                            >
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
                        <Link href={route('buildings.floors.index', { school: school.id, building: building.id })}>
                            <Button>
                                Manage Floors
                            </Button>
                        </Link>
                    </Flex>

                    <Divider className="my-4" />

                    <Grid numItems={1} numItemsSm={2} className="gap-6">
                        <Card decoration="top" decorationColor="blue">
                            <Flex alignItems="center">
                                <BuildingOffice2Icon className="h-6 w-6 text-blue-600 mr-2" />
                                <Text>Total Floors</Text>
                            </Flex>
                            <Metric>{totalFloors}</Metric>
                        </Card>
                        <Card decoration="top" decorationColor="indigo">
                            <Flex alignItems="center">
                                <BuildingStorefrontIcon className="h-6 w-6 text-indigo-600 mr-2" />
                                <Text>Total Rooms</Text>
                            </Flex>
                            <Metric>{totalRooms}</Metric>
                        </Card>
                    </Grid>
                </Card>

                <div className="mt-8">
                    <Title className="mb-4">Floors</Title>
                    {building.floors.length === 0 ? (
                        <Card>
                            <div className="flex flex-col items-center justify-center py-12">
                                <HomeModernIcon className="h-12 w-12 text-gray-400" />
                                <Text className="mt-2">No floors found</Text>
                                <Link href={route('buildings.floors.create', { school: school.id, building: building.id })} className="mt-4">
                                    <Button variant="light">
                                        Add your first floor
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {building.floors.map((floor) => (
                                <FloorCard key={floor.id} floor={floor} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
