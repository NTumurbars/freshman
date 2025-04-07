// resources/js/Pages/Schools/Create.jsx

import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';

export default function Create({ departments, majors }) {
    const { data, setData, post, errors, processing } = useForm({
        course_code: '',
        title: '',
        description: '',
        department_id: '',
        major_id: '',
        capacity: 0,
    });

    // Filter majors based on selected department
    const filteredMajors = majors.filter(
        major => major.department_id === data.department_id
    );

    const handleDepartmentChange = (e) => {
        const departmentId = parseInt(e.target.value);
        setData(data => ({
            ...data,
            department_id: departmentId,
            major_id: '' // Reset major when department changes
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        console.log('Submitting data:', data);

        post(route('courses.store', { school: school.id }), {
            onSuccess: () => {
                console.log('Success!');
            },
            onError: (errors) => {
                console.log('Errors:', errors);
            },
        });
    };

    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Create Course" />

            <div className="mx-auto max-w-3xl bg-white shadow-md rounded-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center">
                    <BookOpen className="h-8 w-8 text-white mr-3" />
                    <h1 className="text-xl font-bold text-white">Create a New Course</h1>
                </div>

                <form onSubmit={submit} className="px-6 py-6 space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                        <h2 className="text-blue-800 font-medium mb-2">Course Department Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    Department
                                </label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.department_id}
                                    onChange={handleDepartmentChange}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((department) => (
                                        <option key={department.id} value={department.id}>
                                            {department.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.department_id && (
                                    <div className="mt-1 text-sm text-red-600">
                                        {errors.department_id}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    Major
                                </label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.major_id}
                                    onChange={(e) => setData('major_id', parseInt(e.target.value))}
                                    disabled={!data.department_id}
                                >
                                    <option value="">Select Major</option>
                                    {filteredMajors.map((major) => (
                                        <option key={major.id} value={major.id}>
                                            {major.code}
                                        </option>
                                    ))}
                                </select>
                                {errors.major_id && (
                                    <div className="mt-1 text-sm text-red-600">
                                        {errors.major_id}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h2 className="text-gray-800 font-medium mb-2">Course Details</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">
                                        Course Code
                                    </label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.course_code}
                                        onChange={(e) => setData('course_code', e.target.value)}
                                        placeholder="e.g., CS101"
                                    />
                                    {errors.course_code && (
                                        <div className="mt-1 text-sm text-red-600">
                                            {errors.course_code}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block font-medium text-gray-700 mb-1">
                                        Capacity
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.capacity}
                                        onChange={(e) => setData('capacity', parseInt(e.target.value) || 0)}
                                        placeholder="Maximum students"
                                    />
                                    {errors.capacity && (
                                        <div className="mt-1 text-sm text-red-600">
                                            {errors.capacity}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Introduction to Computer Science"
                                />
                                {errors.title && (
                                    <div className="mt-1 text-sm text-red-600">
                                        {errors.title}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows="4"
                                    placeholder="Provide a description of the course content and objectives"
                                />
                                {errors.description && (
                                    <div className="mt-1 text-sm text-red-600">
                                        {errors.description}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Saving...' : 'Save Course'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
