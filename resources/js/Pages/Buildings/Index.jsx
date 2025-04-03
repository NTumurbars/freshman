import Block from '@/Components/ui/Block';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ buildings }) {
    const { auth, flash } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editBuilding, setEditBuilding] = useState(null);
    const [editMode, setEditMode] = useState(false);

    // Create Form
    const { data, setData, post, processing, reset } = useForm({
        name: '',
        school_id: school.id,
    });

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post(route('buildings.store'), {
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
        name: '',
    });

    const handleEditSubmit = (e) => {
        e.preventDefault();
        put(
            route('buildings.update', {
                school: school.id,
                building: editBuilding.id,
            }),
            {
                onSuccess: () => setEditBuilding(null),
            },
        );
    };

    // Delete Function
    const { delete: destroy, processing: deleting } = useForm();
    const handleDelete = (buildingId) => {
        if (confirm('Are you sure you want to delete this building?')) {
            destroy(
                route('buildings.destroy', {
                    school: school.id,
                    building: buildingId,
                }),
            );
        }
    };

    const navigateToFloors = (buildingId) => {
        if (!editMode) {
            router.get(
                route('buildings.floors.index', {
                    school: school.id,
                    building: buildingId,
                }),
            );
        }
    };

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Building Management" />
            <h1 className="mb-4 text-3xl font-bold">Buildings</h1>

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
                {buildings.length > 0 ? (
                    buildings.map((building, index) => (
                        <div
                            key={building.id}
                            className="relative cursor-pointer"
                            onClick={() => navigateToFloors(building.id)}
                        >
                            <Block
                                title={`Building ${index + 1}`}
                                children={building.name}
                                tagline={`Floors: ${building.floor_count}`}
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
                                            setEditBuilding(building);
                                            setEditData({
                                                name: building.name,
                                            });
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(building.id);
                                        }}
                                        disabled={deleting}
                                    >
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div
                        onClick={() => setShowCreateModal(true)}
                        className="cursor-pointer"
                    >
                        <Block
                            title=":( No data found"
                            children="Create your first building."
                            tagline="Click to open the form."
                        />
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-96 bg-white p-6 shadow-lg">
                        <h2 className="mb-4 text-xl font-semibold">
                            Create Building
                        </h2>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="mb-4">
                                <label className="block">Building Name</label>
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

            {/* Edit Modal */}
            {editBuilding && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-96 bg-white p-6 shadow-lg">
                        <h2 className="mb-4 text-xl font-semibold">
                            Edit Building
                        </h2>
                        <form onSubmit={handleEditSubmit}>
                            <div className="mb-4">
                                <label className="block">Building Name</label>
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
                                    onClick={() => setEditBuilding(null)}
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
