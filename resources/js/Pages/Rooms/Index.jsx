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
    PencilIcon,
    ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';
import { DoorOpen, Hotel, Layers } from 'lucide-react';

const RoomCard = ({ room, school }) => {
    const features = room.features || [];
    const floor = room.floor || {};
    const building = floor.building || {};

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <Title>{room.room_number}</Title>
                    <Text className="mt-1">Capacity: {room.capacity}</Text>
                </div>
                <DoorOpen className="h-8 w-8 text-blue-500" />
            </div>

            <div className="mt-4">
                <div className="flex items-center">
                    <Hotel className="h-4 w-4 text-gray-500 mr-1" />
                    <Text className="text-sm">{building.name || 'Unknown Building'}</Text>
                </div>
                <div className="flex items-center mt-1">
                    <Layers className="h-4 w-4 text-gray-500 mr-1" />
                    <Text className="text-sm">{floor.name || 'Unknown Floor'}</Text>
                </div>
            </div>

            {features.length > 0 && (
                <div className="mt-4">
                    <Text className="font-medium text-sm">Features:</Text>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {features.slice(0, 3).map(feature => (
                            <Badge key={feature.id} color="blue" size="sm">
                                {feature.name}
                            </Badge>
                        ))}
                        {features.length > 3 && (
                            <Badge color="gray" size="sm">
                                +{features.length - 3} more
                            </Badge>
                        )}
                    </div>
                </div>
            )}

            <Divider className="my-4" />

            <Flex justifyContent="end" className="space-x-2">
                <Link href={route('rooms.show', { school: school.id, room: room.id })}>
                    <Button 
                        variant="light" 
                        color="blue"
                        icon={ArrowTopRightOnSquareIcon}
                        size="xs"
                    >
                        View
                    </Button>
                </Link>
                <Link href={route('rooms.edit', { school: school.id, room: room.id })}>
                    <Button 
                        variant="light" 
                        color="yellow"
                        icon={PencilIcon}
                        size="xs"
                    >
                        Edit
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
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filterBuilding, setFilterBuilding] = useState('');
    
    // Extract unique buildings from rooms for filter dropdown
    const buildings = [...new Map(
        rooms
            .filter(room => room.floor?.building)
            .map(room => [room.floor.building.id, room.floor.building])
    ).values()];
    
    // Filter rooms based on search and building filter
    const filteredRooms = rooms.filter(room => {
        const matchesSearch = !searchTerm || 
            (room.room_number && room.room_number.toLowerCase().includes(searchTerm.toLowerCase()));
            
        const matchesBuilding = !filterBuilding || 
            (room.floor?.building && room.floor.building.id.toString() === filterBuilding);
            
        return matchesSearch && matchesBuilding;
    });

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Room Management" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between mb-6">
                    <div className="flex items-center">
                        <DoorOpen className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                            <Title>Room Management</Title>
                            <Text>View and manage all rooms across campus</Text>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Link href={route('rooms.create', { school: school.id })}>
                            <Button icon={PlusIcon}>
                                Add Room
                            </Button>
                        </Link>
                    </div>
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
                                onChange={e => setSearchTerm(e.target.value)}
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
                                {buildings.map(building => (
                                    <SelectItem key={building.id} value={building.id.toString()}>
                                        {building.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                    </div>
                </Card>

                {filteredRooms.length === 0 ? (
                    <Card>
                        <div className="flex flex-col items-center justify-center py-12">
                            <DoorOpen className="h-12 w-12 text-gray-400" />
                            <Text className="mt-2">
                                {searchTerm || filterBuilding 
                                    ? 'No rooms found matching your filters' 
                                    : 'No rooms found'}
                            </Text>
                            <Link href={route('rooms.create', { school: school.id })} className="mt-4">
                                <Button variant="light" icon={PlusIcon}>
                                    Add your first room
                                </Button>
                            </Link>
                        </div>
                    </Card>
                ) : (
                    <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
                        {filteredRooms.map(room => (
                            <Col key={room.id}>
                                <RoomCard room={room} school={school} />
                            </Col>
                        ))}
                    </Grid>
                )}
            </div>
        </AppLayout>
    );
}
