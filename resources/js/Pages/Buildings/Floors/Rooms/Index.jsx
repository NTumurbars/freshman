import Block from '@/Components/ui/Block';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ rooms, floor }) {
    const { auth, flash } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editRoom, setEditRoom] = useState(null);
    const [editMode, setEditMode] = useState(false);

    // Create Form
    const { data, setData, post, processing, reset } = useForm({
        room_number: '',
        capacity: '',
        floor_id: floor.id,
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        console.log(e);

        post(route('floors.rooms.store', { floor: floor.id }), {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
            },
        });
    };

    // Edit Form
    const {
        data: editData,
        setData: setEditData,
        put,
        processing: updating,
    } = useForm({
        room_number: '',
        capacity: '',
    });

    const handleEditSubmit = (e) => {
        e.preventDefault();
        put(
            route('floors.rooms.update', {
                floor: floor.id,
                room: editRoom.id,
            }),
            {
                onSuccess: () => setEditRoom(null),
            },
        );
    };

    // Delete Function
    const { delete: destroy, processing: deleting } = useForm();
    const handleDelete = (roomId) => {
        if (confirm('Are you sure you want to delete this Room?')) {
            destroy(
                route('floors.rooms.destroy', {
                    floor: floor.id,
                    room: roomId,
                }),
            );
        }
    };

    const navigateToRooms = (floorId) => {
        router.get(
            route('floors.rooms.index', {
                school: school.id,
                floor: floorId,
            }),
        );
    };

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Room Management" />
            <h1 className="mb-4 text-3xl font-bold">
                Rooms in Floor {floor.name}
            </h1>

            {/* Flash Messages */}
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

            {/* Edit Mode Checkbox */}
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
                            title=";) New Room !!!"
                            children="Create it here."
                            tagline="Click to add a new room to this floor."
                        />
                    </div>
                )}
                {rooms.length > 0 &&
                    rooms.map((room, index) => (
                        <div
                            key={room.id}
                            className="relative cursor-pointer"
                            onClick={() => navigateToRooms(floor.id)}
                        >
                            <Block
                                title={`Room ${index + 1}`}
                                children={room.room_number}
                                tagline={`Capacity: ${room.capacity}`}
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
                                            setEditRoom(room);
                                            setEditData({
                                                room_number: room.room_number,
                                                capacity: room.capacity,
                                            });
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(room.id);
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

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-96 bg-white p-6 shadow-lg">
                        <h2 className="mb-4 text-xl font-semibold">
                            Create Room
                        </h2>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="mb-4">
                                <label className="block">Room Number</label>
                                <input
                                    type="text"
                                    value={data.room_number}
                                    onChange={(e) =>
                                        setData('room_number', e.target.value)
                                    }
                                    className="w-full rounded border p-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block">Capacity</label>
                                <input
                                    type="number"
                                    value={data.capacity}
                                    onChange={(e) =>
                                        setData('capacity', e.target.value)
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

            {/* Edit Modal */}
            {editRoom && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-96 bg-white p-6 shadow-lg">
                        <h2 className="mb-4 text-xl font-semibold">
                            Edit Room
                        </h2>
                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-4">
                                <label className="block">Room Number</label>
                                <input
                                    type="text"
                                    value={editData.room_number}
                                    onChange={(e) =>
                                        setEditData(
                                            'room_number',
                                            e.target.value,
                                        )
                                    }
                                    className="w-full rounded border p-2"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block">Capacity</label>
                                <input
                                    type="number"
                                    value={editData.capacity}
                                    onChange={(e) =>
                                        setEditData('capacity', e.target.value)
                                    }
                                    className="w-full rounded border p-2"
                                    required
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setEditRoom(null)}
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
