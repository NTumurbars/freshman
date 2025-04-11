import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Head, Link } from '@inertiajs/react';
import {
    Badge,
    Button,
    Card,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    Text,
    Title,
} from '@tremor/react';
import { BuildingIcon, Settings } from 'lucide-react';

export default function Show({ roomfeature, school }) {
    const categoryColors = {
        Technology: 'blue',
        Furniture: 'amber',
        Accessibility: 'green',
        Safety: 'red',
        Other: 'gray',
    };

    return (
        <AppLayout>
            <Head title={`${roomfeature.name} Feature`} />

            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center">
                    <Link href={route('roomfeatures.index', school.id)}>
                        <Button
                            variant="light"
                            color="gray"
                            icon={ArrowLeftIcon}
                            className="mr-4"
                        >
                            Back to Features
                        </Button>
                    </Link>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Settings className="mr-3 h-8 w-8 text-blue-600" />
                                <div>
                                    <Title>{roomfeature.name}</Title>
                                    <div className="mt-1 flex items-center">
                                        <Badge
                                            color={
                                                categoryColors[
                                                    roomfeature.category
                                                ] || 'gray'
                                            }
                                            size="md"
                                        >
                                            {roomfeature.category}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <Link
                                href={route('roomfeatures.edit', {
                                    school: school.id,
                                    roomfeature: roomfeature.id,
                                })}
                            >
                                <Button variant="light" icon={PencilIcon}>
                                    Edit Feature
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <Card className="mb-6">
                    <div className="flex items-start gap-4">
                        <div className="flex-1">
                            <Title className="mb-2">Description</Title>
                            <Text>
                                {roomfeature.description ||
                                    'No description provided.'}
                            </Text>
                        </div>
                        <div>
                            <Title className="mb-2">Category</Title>
                            <div className="flex items-center">
                                <Badge
                                    size="lg"
                                    color={
                                        categoryColors[roomfeature.category] ||
                                        'gray'
                                    }
                                >
                                    {roomfeature.category}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card>
                    <Title className="mb-4">Rooms with this feature</Title>

                    {roomfeature.rooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8">
                            <BuildingIcon className="mb-2 h-10 w-10 text-gray-400" />
                            <Text>No rooms currently have this feature</Text>
                        </div>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell>Building</TableHeaderCell>
                                    <TableHeaderCell>
                                        Room Number
                                    </TableHeaderCell>
                                    <TableHeaderCell>Capacity</TableHeaderCell>
                                    <TableHeaderCell>Actions</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {roomfeature.rooms.map((room) => (
                                    <TableRow key={room.id}>
                                        <TableCell>
                                            {room.building_name}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {room.room_number}
                                        </TableCell>
                                        <TableCell>{room.capacity}</TableCell>
                                        <TableCell>
                                            <Link
                                                href={route('rooms.show', {
                                                    school: school.id,
                                                    room: room.id,
                                                })}
                                            >
                                                <Button
                                                    size="xs"
                                                    variant="light"
                                                >
                                                    View
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
