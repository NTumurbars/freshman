import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';

export default function Show({ department }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data, setData, post, errors, reset } = useForm({
        code: '',
        department_id: department.id
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('majors.store', { 
            school: school.id,
            department: department.id 
        }), {
            preserveScroll: true,
            onSuccess: () => {
                setIsModalOpen(false);
                reset();
            },
            onError: (errors) => {
                console.log('Errors:', errors);
            }
        });
    };

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title={department.name} />

            <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {department.name}
                    </h1>
                    <Link
                        href={route('departments.index', { school: school.id })}
                        className="bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-gray-200"
                    >
                        Back to Departments
                    </Link>
                </div>

                {/* Majors Section */}
                <div className="bg-white shadow sm:rounded-lg mb-6">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Majors
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                            >
                                Add Major
                            </button>
                        </div>

                        {department.majors?.length > 0 ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {department.majors.map((major) => (
                                    <div
                                        key={major.id}
                                        className="bg-gray-50 p-4 rounded-lg shadow-sm"
                                    >
                                        <h3 className="font-medium text-gray-900">
                                            {major.code}
                                        </h3>
                                        {major.description && (
                                            <p className="mt-2 text-sm text-gray-600">
                                                {major.description}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-600">No majors found in this department.</p>
                        )}
                    </div>
                </div>

                {/* Modal for adding new major */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Add New Major
                                </h3>
                                <button
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        reset();
                                    }}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Major Code
                                    </label>
                                    <input
                                        type="text"
                                        value={data.code}
                                        onChange={e => setData('code', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200"
                                    />
                                    {errors.code && (
                                        <div className="mt-1 text-sm text-red-600">
                                            {errors.code}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            reset();
                                        }}
                                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    >
                                        Add Major
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Courses Section */}
                <div className="bg-white shadow sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Courses
                        </h2>
                        {department.courses?.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Course Code
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Title
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Capacity
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {department.courses.map((course) => (
                                            <tr key={course.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {course.course_code}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {course.title}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {course.capacity}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-600">No courses found in this department.</p>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
