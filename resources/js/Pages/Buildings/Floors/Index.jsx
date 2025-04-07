import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm, usePage, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    Card,
    Title,
    Text,
    Grid,
    Col,
    Button,
    Badge,
    Metric,
    Flex,
    TextInput,
    Divider,
    NumberInput,
} from '@tremor/react';
import {
    BuildingOffice2Icon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ArrowLeftIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { Layers } from 'lucide-react';

const FloorCard = ({ floor, onEdit, onDelete, editMode }) => (
    <Card className={`${!editMode ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}>
        <div className="flex items-start justify-between">
            <div>
                <Title>Floor {floor.number}</Title>
                <Text className="mt-1">Floor ID: {floor.id}</Text>
            </div>
            <Layers className="h-8 w-8 text-blue-500" />
        </div>

        <div className="mt-4">
            <Badge color="indigo" size="lg">{floor.rooms_count} Rooms</Badge>
        </div>

        {editMode ? (
            <div className="mt-4 flex justify-end space-x-2">
                <Button
                    variant="light"
                    color="yellow"
                    icon={PencilIcon}
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(floor);
                    }}
                >
                    Edit
                </Button>
                <Button
                    variant="light"
                    color="red"
                    icon={TrashIcon}
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(floor.id);
                    }}
                >
                    Delete
                </Button>
            </div>
        ) : (
            <div className="mt-4">
                <Text>Click to manage rooms</Text>
            </div>
        )}
    </Card>
);

export default function Index({ floors, building }) {
    const { auth, flash } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editFloor, setEditFloor] = useState(null);
    const [editMode, setEditMode] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        number: '',
        building_id: building.id,
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post(
            route('buildings.floors.store', {
                school: school.id,
                building: building.id,
            }),
            {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                },
            },
        );
    };

    const {
        data: editData,
        setData: setEditData,
        put,
        processing: updating,
    } = useForm({
        number: '',
    });

    const handleEditSubmit = (e) => {
        e.preventDefault();
        put(
            route('buildings.floors.update', {
                school: school.id,
                building: building.id,
                floor: editFloor.id,
            }),
            {
                onSuccess: () => setEditFloor(null),
            },
        );
    };

    const { delete: destroy, processing: deleting } = useForm();
    const handleDelete = (floorId) => {
        if (confirm('Are you sure you want to delete this floor?')) {
            destroy(
                route('buildings.floors.destroy', {
                    school: school.id,
                    building: building.id,
                    floor: floorId,
                }),
            );
        }
    };

    const navigateToRooms = (floorId) => {
        if (!editMode) {
            router.get(
                route('buildings.floors.rooms.index', {
                    school: school.id,
                    building: building.id,
                    floor: floorId,
                }),
            );
        }
    };

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title={`Floors - ${building.name}`} />

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
                                Back to Buildings
                            </Button>
                        </Link>
                        <div className="flex items-center">
                            <Layers className="h-8 w-8 text-blue-600 mr-3" />
                            <div>
                                <Title>{building.name} Floors</Title>
                                <Text>Manage floors and their rooms</Text>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex space-x-3">
                        <Button
                            variant={!editMode ? 'light' : 'primary'}
                            color={!editMode ? 'gray' : 'blue'}
                            icon={PencilIcon}
                            onClick={() => setEditMode(!editMode)}
                        >
                            {editMode ? 'Done Editing' : 'Edit Floors'}
                        </Button>
                        <Button icon={PlusIcon} onClick={() => setShowCreateModal(true)}>
                            Add Floor
                        </Button>
                    </div>
                </div>

                <Card className="mb-6">
                    <Flex>
                        <div>
                            <Title>Floor Summary</Title>
                            <Text>Overview of {building.name} floors</Text>
                        </div>
                    </Flex>

                    <Divider className="my-4" />

                    <Grid numItems={1} numItemsSm={2} className="gap-6">
                        <Card decoration="top" decorationColor="blue">
                            <Text>Total Floors</Text>
                            <Metric>{floors.length}</Metric>
                        </Card>
                        <Card decoration="top" decorationColor="indigo">
                            <Text>Total Rooms</Text>
                            <Metric>{floors.reduce((sum, floor) => sum + floor.rooms_count, 0)}</Metric>
                        </Card>
                    </Grid>
                </Card>

                <div className="mt-8">
                    <Title className="mb-4">Floors</Title>

                    {floors.length === 0 ? (
                        <Card>
                            <div className="flex flex-col items-center justify-center py-12">
                                <Layers className="h-12 w-12 text-gray-400" />
                                <Text className="mt-2">No floors found</Text>
                                <Button
                                    variant="light"
                                    icon={PlusIcon}
                                    className="mt-4"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    Add your first floor
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
                            {floors.sort((a, b) => b.number - a.number).map((floor) => (
                                <Col key={floor.id}>
                                    <Card 
                                        className={`hover:shadow-lg transition-shadow ${!editMode ? 'cursor-default' : ''}`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <Title className="text-2xl font-bold">Floor {floor.number}</Title>
                                                <div className="flex items-center mt-2">
                                                    <BuildingOffice2Icon className="h-5 w-5 text-gray-500 mr-2" />
                                                    <Text>{building.name}</Text>
                                                </div>
                                            </div>
                                            <Layers className="h-12 w-12 text-blue-500" />
                                        </div>

                                        <Divider className="my-4" />

                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            <div className="bg-blue-50 p-3 rounded-lg text-center">
                                                <Text>Rooms</Text>
                                                <Metric className="text-blue-700">{floor.rooms_count}</Metric>
                                            </div>
                                            <div className="bg-indigo-50 p-3 rounded-lg text-center">
                                                <Text>Floor #</Text>
                                                <Metric className="text-indigo-700">{floor.number}</Metric>
                                            </div>
                                        </div>

                                        {editMode && (
                                            <Flex justifyContent="end" className="mt-4 space-x-2">
                                                <Button
                                                    variant="light"
                                                    color="yellow"
                                                    icon={PencilIcon}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditData({ number: floor.number });
                                                        setEditFloor(floor);
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="light"
                                                    color="red" 
                                                    icon={TrashIcon}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(floor.id);
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </Flex>
                                        )}

                                        {!editMode && (
                                            <div className="mt-4 text-center">
                                                <Link href={route('buildings.floors.show', {
                                                    school: school.id,
                                                    building: building.id,
                                                    floor: floor.id
                                                })}>
                                                    <Button variant="light" color="blue">
                                                        View Floor Details
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                    </Card>
                                </Col>
                            ))}
                        </Grid>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <Title>Add New Floor</Title>
                            <Button
                                variant="light"
                                color="gray"
                                icon={XMarkIcon}
                                onClick={() => setShowCreateModal(false)}
                            />
                        </div>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="mb-4">
                                <Text>Floor Number</Text>
                                <NumberInput
                                    value={data.number}
                                    onValueChange={(value) => setData('number', value)}
                                    placeholder="Enter floor number"
                                    className="mt-1"
                                />
                            </div>
                            <Flex justifyContent="end">
                                <Button
                                    type="submit"
                                    loading={processing}
                                    disabled={processing}
                                >
                                    Save Floor
                                </Button>
                            </Flex>
                        </form>
                    </Card>
                </div>
            )}

            {/* Edit Modal */}
            {editFloor && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <Title>Edit Floor</Title>
                            <Button
                                variant="light"
                                color="gray"
                                icon={XMarkIcon}
                                onClick={() => setEditFloor(null)}
                            />
                        </div>
                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-4">
                                <Text>Floor Number</Text>
                                <NumberInput
                                    value={editData.number || editFloor.number}
                                    onValueChange={(value) => setEditData('number', value)}
                                    placeholder="Enter floor number"
                                    className="mt-1"
                                />
                            </div>
                            <Flex justifyContent="end">
                                <Button
                                    type="submit"
                                    loading={updating}
                                    disabled={updating}
                                >
                                    Update Floor
                                </Button>
                            </Flex>
                        </form>
                    </Card>
                </div>
            )}
        </AppLayout>
    );
}
