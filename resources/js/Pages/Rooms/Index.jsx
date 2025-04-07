import React, { useState } from 'react';
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
    Badge,
    TextInput,
    Select,
    SelectItem,
    Tab,
    TabList,
    TabGroup,
    TabPanel,
    TabPanels,
} from '@tremor/react';
import {
    HomeModernIcon,
    MagnifyingGlassIcon,
    BuildingOffice2Icon,
    UsersIcon,
    WrenchScrewdriverIcon,
    TagIcon,
    PlusIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';

const RoomCard = ({ room, parentSchool, schoolId }) => {
    const features = room.features || [];
    const building = room.floor?.building;
    const school = parentSchool || building?.school;

    return (
        <Card>
            <div className="flex items-start justify-between">
                <div>
                    <Title>{room.room_number}</Title>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                        <BuildingOffice2Icon className="h-4 w-4 mr-1" />
                        <span>{building?.name || 'Unknown Building'}</span>
                        <span className="mx-1">•</span>
                        <span>{room.floor?.name || 'Unknown Floor'}</span>
                    </div>
                </div>
                <Badge size="lg" color="gray">
                    Capacity: {room.capacity}
                </Badge>
            </div>

            {features.length > 0 && (
                <div className="mt-4">
                    <Text className="font-medium">Features:</Text>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {features.map(feature => (
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
                <Link href={route('rooms.edit', {
                    school: schoolId || school?.id || room.floor?.building?.school_id,
                    room: room.id
                })}>
                    <Button variant="light" icon={WrenchScrewdriverIcon}>
                        Manage Room
                    </Button>
                </Link>
            </Flex>
        </Card>
    );
};

export default function Index({ rooms }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;

    // If no school directly available, try to get it from the first room
    const schoolId = school?.id || (rooms[0]?.floor?.building?.school_id);

    const [search, setSearch] = useState('');
    const [selectedBuilding, setSelectedBuilding] = useState('');
    const [selectedFloor, setSelectedFloor] = useState('');
    const [selectedFeature, setSelectedFeature] = useState('');

    // Extract unique buildings, floors and features for filters
    const buildings = [...new Map(
        rooms
            .filter(room => room.floor?.building)
            .map(room => [room.floor.building.id, {
                id: room.floor.building.id,
                name: room.floor.building.name
            }])
    ).values()];

    const floors = [...new Map(
        rooms
            .filter(room => room.floor &&
                   (!selectedBuilding || room.floor.building_id.toString() === selectedBuilding))
            .map(room => [room.floor.id, {
                id: room.floor.id,
                name: room.floor.name,
                building_id: room.floor.building_id
            }])
    ).values()];

    const features = [...new Map(
        rooms.flatMap(room => room.features || [])
            .map(feature => [feature.id, {
                id: feature.id,
                name: feature.name
            }])
    ).values()];

    // Filter rooms based on search and selections
    const filteredRooms = rooms.filter(room => {
        const matchesSearch = search === '' ||
            room.room_number.toLowerCase().includes(search.toLowerCase()) ||
            room.floor?.name?.toLowerCase().includes(search.toLowerCase()) ||
            room.floor?.building?.name?.toLowerCase().includes(search.toLowerCase());

        const matchesBuilding = selectedBuilding === '' ||
            (room.floor?.building_id && room.floor.building_id.toString() === selectedBuilding);

        const matchesFloor = selectedFloor === '' ||
            (room.floor_id && room.floor_id.toString() === selectedFloor);

        const matchesFeature = selectedFeature === '' ||
            room.features?.some(f => f.id.toString() === selectedFeature);

        return matchesSearch && matchesBuilding && matchesFloor && matchesFeature;
    });

    // Calculate statistics
    const totalCapacity = filteredRooms.reduce((sum, room) => sum + room.capacity, 0);
    const totalScheduledSessions = filteredRooms.reduce(
        (sum, room) => sum + (room.schedules?.length || 0), 0
    );

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Rooms Management" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between mb-6">
                    <div>
                        <Title>Room Management</Title>
                        <Text>Manage rooms across all buildings and floors</Text>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Link href={route('rooms.create', { school: schoolId })}>
                            <Button icon={PlusIcon}>Add Room</Button>
                        </Link>
                    </div>
                </div>

                <Card className="mb-6">
                    <Flex>
                        <div>
                            <Title>Room Summary</Title>
                            <Text>Filtered overview of rooms and capacity</Text>
                        </div>
                    </Flex>

                    <Divider className="my-4" />

                    <Grid numItems={1} numItemsSm={3} className="gap-6">
                        <Card decoration="top" decorationColor="blue">
                            <Flex alignItems="center">
                                <HomeModernIcon className="h-6 w-6 text-blue-600 mr-2" />
                                <Text>Total Rooms</Text>
                            </Flex>
                            <Metric>{filteredRooms.length}</Metric>
                        </Card>
                        <Card decoration="top" decorationColor="indigo">
                            <Flex alignItems="center">
                                <UsersIcon className="h-6 w-6 text-indigo-600 mr-2" />
                                <Text>Total Capacity</Text>
                            </Flex>
                            <Metric>{totalCapacity}</Metric>
                        </Card>
                        <Card decoration="top" decorationColor="purple">
                            <Flex alignItems="center">
                                <CalendarIcon className="h-6 w-6 text-purple-600 mr-2" />
                                <Text>Scheduled Sessions</Text>
                            </Flex>
                            <Metric>{totalScheduledSessions}</Metric>
                        </Card>
                    </Grid>
                </Card>

                <Card className="mb-6">
                    <Flex flexDirection="col" className="space-y-4">
                        <Title>Filters</Title>

                        <div>
                            <Text>Search Rooms</Text>
                            <TextInput
                                icon={MagnifyingGlassIcon}
                                placeholder="Search by room number, building, or floor..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="mt-1"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div>
                                <Text>Building</Text>
                                <Select
                                    value={selectedBuilding}
                                    onValueChange={setSelectedBuilding}
                                    placeholder="All Buildings"
                                    className="mt-1"
                                >
                                    <SelectItem value="">All Buildings</SelectItem>
                                    {buildings.map(building => (
                                        <SelectItem key={building.id} value={building.id.toString()}>
                                            {building.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>

                            <div>
                                <Text>Floor</Text>
                                <Select
                                    value={selectedFloor}
                                    onValueChange={setSelectedFloor}
                                    placeholder="All Floors"
                                    className="mt-1"
                                    disabled={!selectedBuilding}
                                >
                                    <SelectItem value="">All Floors</SelectItem>
                                    {floors.map(floor => (
                                        <SelectItem key={floor.id} value={floor.id.toString()}>
                                            {floor.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>

                            <div>
                                <Text>Feature</Text>
                                <Select
                                    value={selectedFeature}
                                    onValueChange={setSelectedFeature}
                                    placeholder="All Features"
                                    className="mt-1"
                                >
                                    <SelectItem value="">All Features</SelectItem>
                                    {features.map(feature => (
                                        <SelectItem key={feature.id} value={feature.id.toString()}>
                                            {feature.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>
                        </div>
                    </Flex>
                </Card>

                <TabGroup>
                    <TabList>
                        <Tab>All Rooms ({filteredRooms.length})</Tab>
                        <Tab>Available Now ({filteredRooms.filter(r => (r.schedules || []).length === 0).length})</Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <div className="mt-8">
                                {filteredRooms.length === 0 ? (
                                    <Card>
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <HomeModernIcon className="h-12 w-12 text-gray-400" />
                                            <Text className="mt-2">No rooms found with the current filters</Text>
                                            <Button
                                                variant="light"
                                                onClick={() => {
                                                    setSearch('');
                                                    setSelectedBuilding('');
                                                    setSelectedFloor('');
                                                    setSelectedFeature('');
                                                }}
                                                className="mt-4"
                                            >
                                                Clear Filters
                                            </Button>
                                            {filteredRooms.length === 0 && rooms.length === 0 && (
                                                <Link href={route('rooms.create', { school: schoolId })} className="mt-4">
                                                    <Button variant="light" icon={PlusIcon}>
                                                        Add your first room
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </Card>
                                ) : (
                                    <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
                                        {filteredRooms.map(room => (
                                            <Col key={room.id}>
                                                <RoomCard room={room} parentSchool={school} schoolId={schoolId} />
                                            </Col>
                                        ))}
                                    </Grid>
                                )}
                            </div>
                        </TabPanel>

                        <TabPanel>
                            <div className="mt-8">
                                {filteredRooms.filter(r => (r.schedules || []).length === 0).length === 0 ? (
                                    <Card>
                                        <div className="flex flex-col items-center justify-center py-12">
                                            <HomeModernIcon className="h-12 w-12 text-gray-400" />
                                            <Text className="mt-2">No available rooms found with the current filters</Text>
                                            <Button
                                                variant="light"
                                                onClick={() => {
                                                    setSearch('');
                                                    setSelectedBuilding('');
                                                    setSelectedFloor('');
                                                    setSelectedFeature('');
                                                }}
                                                className="mt-4"
                                            >
                                                Clear Filters
                                            </Button>
                                            {filteredRooms.length === 0 && rooms.length === 0 && (
                                                <Link href={route('rooms.create', { school: schoolId })} className="mt-4">
                                                    <Button variant="light" icon={PlusIcon}>
                                                        Add your first room
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </Card>
                                ) : (
                                    <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
                                        {filteredRooms
                                            .filter(r => (r.schedules || []).length === 0)
                                            .map(room => (
                                                <Col key={room.id}>
                                                    <RoomCard room={room} parentSchool={school} schoolId={schoolId} />
                                                </Col>
                                            ))
                                        }
                                    </Grid>
                                )}
                            </div>
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </div>
        </AppLayout>
    );
}
