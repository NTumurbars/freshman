import AppLayout from '@/Layouts/AppLayout';
import {
    ArrowLeftIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Badge,
    Button,
    Card,
    Divider,
    Flex,
    Grid,
    Metric,
    NumberInput,
    Text,
    Title,
} from '@tremor/react';
import { Layers } from 'lucide-react';
import { useState } from 'react';

const FloorCard = ({ floor, onEdit, onDelete, editMode, isAdmin }) => (
    <Card
        className={`${!editMode ? 'cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg' : ''} floor-index-card`}
    >
        <div className="flex items-start justify-between">
            <div>
                <Title className="text-blue-700">Floor {floor.number}</Title>
                <Text className="mt-1 text-gray-500">ID: {floor.id}</Text>
            </div>
            <div className="floor-icon-wrapper">
                <Layers className="h-8 w-8 text-blue-500" />
            </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <Text className="text-gray-600">Rooms</Text>
                <Badge color="indigo" size="lg">
                    {floor.rooms_count}
                </Badge>
            </div>
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
                    className="edit-btn"
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
                    className="delete-btn"
                >
                    Delete
                </Button>
            </div>
        ) : (
            <div className="mt-4">
                <div className="flex items-center justify-between">
                    <Text className="text-gray-500">Click to manage rooms</Text>
                    <Badge color="blue" size="sm">
                        View
                    </Badge>
                </div>
            </div>
        )}
    </Card>
);

export default function Index({ floors, building }) {
    const { auth, flash } = usePage().props;
    const school = auth.user.school;
    const isAdmin = auth.user.role.id === 1;
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
                route('buildings.floors.show', {
                    school: school.id,
                    building: building.id,
                    floor: floorId,
                }),
            );
        }
    };

    return (
        <AppLayout>
            <Head title={`Floors - ${building.name}`} />

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
                                Back to Buildings
                            </Button>
                        </Link>
                        <div className="flex items-center">
                            <Layers className="mr-3 h-8 w-8 text-blue-600" />
                            <div>
                                <Title>{building.name} Floors</Title>
                                <Text>Manage floors and their rooms</Text>
                            </div>
                        </div>
                    </div>
                    {isAdmin && (
                        <div className="mt-4 flex space-x-3 sm:mt-0">
                            <Button
                                variant={!editMode ? 'light' : 'primary'}
                                color={!editMode ? 'gray' : 'blue'}
                                icon={PencilIcon}
                                onClick={() => setEditMode(!editMode)}
                            >
                                {editMode ? 'Done Editing' : 'Edit Floors'}
                            </Button>
                            <Button
                                icon={PlusIcon}
                                onClick={() => setShowCreateModal(true)}
                            >
                                Add Floor
                            </Button>
                        </div>
                    )}
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
                            <Metric>
                                {floors.reduce(
                                    (sum, floor) => sum + floor.rooms_count,
                                    0,
                                )}
                            </Metric>
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
                        <Grid
                            numItems={1}
                            numItemsSm={2}
                            numItemsLg={3}
                            className="gap-6"
                        >
                            {floors
                                .sort((a, b) => b.number - a.number)
                                .map((floor) => (
                                    <div
                                        key={floor.id}
                                        onClick={() =>
                                            navigateToRooms(floor.id)
                                        }
                                    >
                                        <FloorCard
                                            floor={floor}
                                            onEdit={setEditFloor}
                                            onDelete={handleDelete}
                                            editMode={editMode}
                                            isAdmin={isAdmin}
                                        />
                                    </div>
                                ))}
                        </Grid>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <Card className="w-full max-w-lg">
                        <div className="mb-4 flex items-center justify-between">
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
                                    onValueChange={(value) =>
                                        setData('number', value)
                                    }
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <Card className="w-full max-w-lg">
                        <div className="mb-4 flex items-center justify-between">
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
                                    onValueChange={(value) =>
                                        setEditData('number', value)
                                    }
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
