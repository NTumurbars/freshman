import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Edit({ department }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;

    const { data, setData, put, errors } = useForm({
        name: department.name,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('departments.update', {
            school: school.id,
            department: department.id
        }));
    };

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Edit Department" />

            <div className="mx-auto max-w-2xl py-6 sm:px-6 lg:px-8">
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h1 className="text-xl font-bold text-gray-900 mb-4">
                            Edit Department
                        </h1>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block font-medium text-gray-700 mb-2">
                                    Department Name
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                />
                                {errors.name && (
                                    <div className="mt-1 text-sm text-red-600">
                                        {errors.name}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="submit"
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                >
                                    Update Department
                                </button>

                                <a
                                    href={route('departments.index', school.id)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded"
                                >
                                    Cancel
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
