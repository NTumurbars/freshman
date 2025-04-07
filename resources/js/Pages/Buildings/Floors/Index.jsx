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
} from '@tremor/react';
import {
    BuildingOffice2Icon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ArrowLeftIcon,
    HomeModernIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const FloorCard = ({ floor, onEdit, onDelete, editMode }) => (
    <Card className={`${!editMode ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}>
        <div className="flex items-start justify-between">
            <div>
                <Title>{floor.name}</Title>
                <Text className="mt-1">Floor ID: {floor.id}</Text>
            </div>
            <HomeModernIcon className="h-8 w-8 text-blue-500" />
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
        name: '',
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
        name: '',
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
                            <BuildingOffice2Icon className="h-8 w-8 text-blue-600 mr-3" />
                            <div>
                                <Title>{building.name} Floors</Title>
                                <Text>Manage floors and their rooms</Text>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-3 sm:mt-0">
                        <Badge
                            color={editMode ? "amber" : "gray"}
                            size="lg"
                            icon={PencilIcon}
                            className="cursor-pointer"
                            onClick={() => setEditMode(!editMode)}
                        >
                            {editMode ? "Edit Mode On" : "Edit Mode Off"}
                        </Badge>

                        {!editMode && (
                            <Button icon={PlusIcon} onClick={() => setShowCreateModal(true)}>
                                Add Floor
                            </Button>
                        )}
                    </div>
                </div>

                {flash?.success && (
                    <div className="mb-6 bg-green-100 p-4 rounded-md text-green-800">
                        {flash.success}
                    </div>
                )}
                {flash?.fail && (
                    <div className="mb-6 bg-red-100 p-4 rounded-md text-red-800">
                        {flash.fail}
                    </div>
                )}

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
                                <HomeModernIcon className="h-12 w-12 text-gray-400" />
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
                            {floors.map((floor) => (
                                <Col key={floor.id} onClick={() => navigateToRooms(floor.id)}>
                                    <FloorCard
                                        floor={floor}
                                        editMode={editMode}
                                        onEdit={setEditFloor}
                                        onDelete={handleDelete}
                                    />
                                </Col>
                            ))}
                        </Grid>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <Card className="w-full max-w-md">
                        <Flex justifyContent="between" alignItems="center" className="mb-6">
                            <Title>Add New Floor</Title>
                            <Button
                                variant="light"
                                color="gray"
                                icon={XMarkIcon}
                                onClick={() => setShowCreateModal(false)}
                                className="!p-2"
                            />
                        </Flex>

                        <form onSubmit={handleCreateSubmit}>
                            <div className="mb-6">
                                <Text>Floor Name</Text>
                                <TextInput
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Enter floor name (e.g. First Floor, Basement)"
                                    className="mt-1"
                                    required
                                />
                            </div>

                            <Flex justifyContent="end" className="space-x-2">
                                <Button
                                    variant="secondary"
                                    color="gray"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    loading={processing}
                                >
                                    Create Floor
                                </Button>
                            </Flex>
                        </form>
                    </Card>
                </div>
            )}

            {/* Edit Modal */}
            {editFloor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <Card className="w-full max-w-md">
                        <Flex justifyContent="between" alignItems="center" className="mb-6">
                            <Title>Edit Floor</Title>
                            <Button
                                variant="light"
                                color="gray"
                                icon={XMarkIcon}
                                onClick={() => setEditFloor(null)}
                                className="!p-2"
                            />
                        </Flex>

                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-6">
                                <Text>Floor Name</Text>
                                <TextInput
                                    value={editData.name}
                                    onChange={(e) => setEditData('name', e.target.value)}
                                    placeholder="Enter floor name"
                                    className="mt-1"
                                    required
                                />
                            </div>

                            <Flex justifyContent="end" className="space-x-2">
                                <Button
                                    variant="secondary"
                                    color="gray"
                                    onClick={() => setEditFloor(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    loading={updating}
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
