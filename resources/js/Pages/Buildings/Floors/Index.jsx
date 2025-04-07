import Block from '@/Components/ui/Block';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

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
                route('floors.rooms.index', {
                    school: school.id,
                    building: building.id,
                    floor: floorId,
                }),
            );
        }
    };

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Floor Management" />
            <h1 className="mb-4 text-3xl font-bold">
                Floors of {building.name}
            </h1>

            {flash?.success && (
                <div className="mb-6 bg-green-100 p-4 text-green-800">
                    {flash.success}
                </div>
            )}
            {flash?.fail && (
                <div className="mb-6 bg-red-100 p-4 text-red-800">
                    {flash.fail}
                </div>
            )}

            <div className="mb-4">
                <label className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={editMode}
                        onChange={() => setEditMode(!editMode)}
                        className="form-checkbox h-5 w-5"
                    />
                    <span>Edit Mode</span>
                </label>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {!editMode && (
                    <div
                        onClick={() => setShowCreateModal(true)}
                        className="cursor-pointer"
                    >
                        <Block
                            title=":)"
                            children="Create New Floor."
                            tagline="Open form to add a Floor."
                        />
                    </div>
                )}
                {floors.length > 0 &&
                    floors.map((floor, index) => (
                        <div
                            key={floor.id}
                            className="relative cursor-pointer"
                            onClick={() => navigateToRooms(floor.id)}
                        >
                            <Block
                                title={`Floor ${index + 1}`}
                                children={floor.name}
                                tagline={`Rooms: ${floor.rooms_count}`}
                                className={
                                    editMode ? 'pointer-events-none' : ''
                                }
                            />
                            {editMode && (
                                <div className="absolute right-2 top-2 flex space-x-2">
                                    <button
                                        className="bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditFloor(floor);
                                            setEditData({
                                                name: floor.name,
                                            });
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(floor.id);
                                        }}
                                        disabled={deleting}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
            </div>

            {showCreateModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-96 bg-white p-6 shadow-lg">
                        <h2 className="mb-4 text-xl font-semibold">
                            Create Floor
                        </h2>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="mb-4">
                                <label className="block">Floor Name</label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    className="w-full rounded border p-2"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="bg-gray-300 px-4 py-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 px-4 py-2 text-white"
                                    disabled={processing}
                                >
                                    {processing ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editFloor && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-96 bg-white p-6 shadow-lg">
                        <h2 className="mb-4 text-xl font-semibold">
                            Edit Floor
                        </h2>
                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-4">
                                <label className="block">Floor Name</label>
                                <input
                                    type="text"
                                    value={editData.name}
                                    onChange={(e) =>
                                        setEditData('name', e.target.value)
                                    }
                                    className="w-full rounded border p-2"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setEditFloor(null)}
                                    className="bg-gray-300 px-4 py-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-500 px-4 py-2 text-white"
                                    disabled={updating}
                                >
                                    {updating ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
