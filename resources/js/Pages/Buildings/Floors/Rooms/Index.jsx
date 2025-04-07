import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
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
} from '@tremor/react';
import {
    BuildingOffice2Icon,
    PlusIcon,
    ArrowLeftIcon,
    HomeModernIcon,
    UsersIcon,
    ComputerDesktopIcon,
    WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

const RoomCard = ({ room, school, building, floor }) => {
    const features = room.features || [];

    return (
        <Card>
            <div className="flex items-start justify-between">
                <div>
                    <Title>{room.room_number}</Title>
                    <Text className="mt-1">Capacity: {room.capacity}</Text>
                </div>
                <HomeModernIcon className="h-8 w-8 text-blue-500" />
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
                    id: room.id,
                    return_url: route('buildings.floors.rooms.index', {
                        school: school.id,
                        building: building.id,
                        floor: floor.id
                    })
                })}>
                    <Button variant="light" icon={WrenchScrewdriverIcon}>
                        Manage Room
                    </Button>
                </Link>
            </Flex>
        </Card>
    );
};

export default function Index({ rooms, floor, building, school }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title={`Rooms - ${floor.name}`} />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between mb-6">
                    <div className="flex items-center">
                        <Link href={route('buildings.floors.index', {
                            school: school.id,
                            building: building.id
                        })}>
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
                            <HomeModernIcon className="h-8 w-8 text-blue-600 mr-3" />
                            <div>
                                <Title>{floor.name} Rooms</Title>
                                <Text>Manage rooms in {building.name}, {floor.name}</Text>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Link href={route('rooms.create', {
                            floor_id: floor.id,
                            return_url: route('buildings.floors.rooms.index', {
                                school: school.id,
                                building: building.id,
                                floor: floor.id
                            })
                        })}>
                            <Button icon={PlusIcon}>
                                Add Room
                            </Button>
                        </Link>
                    </div>
                </div>

                <Card className="mb-6">
                    <Flex alignItems="center">
                        <div className="flex items-center">
                            <BuildingOffice2Icon className="h-6 w-6 text-blue-600 mr-2" />
                            <Title>Room Summary</Title>
                        </div>
                    </Flex>

                    <Divider className="my-4" />

                    <Grid numItems={1} numItemsSm={3} className="gap-6">
                        <Card decoration="top" decorationColor="blue">
                            <Flex alignItems="center">
                                <HomeModernIcon className="h-6 w-6 text-blue-600 mr-2" />
                                <Text>Total Rooms</Text>
                            </Flex>
                            <Metric>{rooms.length}</Metric>
                        </Card>
                        <Card decoration="top" decorationColor="indigo">
                            <Flex alignItems="center">
                                <UsersIcon className="h-6 w-6 text-indigo-600 mr-2" />
                                <Text>Total Capacity</Text>
                            </Flex>
                            <Metric>{rooms.reduce((sum, room) => sum + room.capacity, 0)}</Metric>
                        </Card>
                        <Card decoration="top" decorationColor="purple">
                            <Flex alignItems="center">
                                <ComputerDesktopIcon className="h-6 w-6 text-purple-600 mr-2" />
                                <Text>Features Available</Text>
                            </Flex>
                            <Metric>
                                {new Set(rooms.flatMap(room => room.features || []).map(f => f.id)).size}
                            </Metric>
                        </Card>
                    </Grid>
                </Card>

                <div className="mt-8">
                    <Title className="mb-4">Rooms</Title>
                    {rooms.length === 0 ? (
                        <Card>
                            <div className="flex flex-col items-center justify-center py-12">
                                <HomeModernIcon className="h-12 w-12 text-gray-400" />
                                <Text className="mt-2">No rooms found in this floor</Text>
                                <Link href={route('rooms.create', {
                                    floor_id: floor.id,
                                    return_url: route('buildings.floors.rooms.index', {
                                        school: school.id,
                                        building: building.id,
                                        floor: floor.id
                                    })
                                })} className="mt-4">
                                    <Button variant="light" icon={PlusIcon}>
                                        Add your first room
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ) : (
                        <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
                            {rooms.map(room => (
                                <Col key={room.id}>
                                    <RoomCard room={room} school={school} building={building} floor={floor} />
                                </Col>
                            ))}
                        </Grid>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
