// resources/js/Pages/Schools/Create.jsx

import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Create({ departments, majors }) {
    const { data, setData, post, errors } = useForm({
        course_code: '',
        title: '',
        description: '',
        department_id: '',
        major_id: '',
        capacity: 0,
    });

    const submit = (e) => {
        e.preventDefault();
        console.log('Submitting data:', data);

        post(route('courses.store'), {
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
            <Head title="Create School" />

            <div className="mx-auto max-w-2xl rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-xl font-bold">Create a New School</h1>

                <form onSubmit={submit}>
                    <div className="mb-4">
                        <label className="block font-medium text-gray-700">
                            Department
                        </label>
                        <select
                            className="mt-1 block w-full rounded border-gray-300"
                            value={data.department_id}
                            onChange={(e) => setData('department_id', parseInt(e.target.value))}
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

                    <div className="mb-4">
                        <label className="block font-medium text-gray-700">
                            Major
                        </label>
                        <select
                            className="mt-1 block w-full rounded border-gray-300"
                            value={data.major_id}
                            onChange={(e) => setData('major_id', parseInt(e.target.value))}
                        >
                            <option value="">Select Major</option>
                            {majors.map((major) => (
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

                    <div className="mb-4">
                        <label className="block font-medium text-gray-700">
                            Course Code
                        </label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded border-gray-300"
                            value={data.course_code}
                            onChange={(e) => setData('course_code', e.target.value)}
                        />
                        {errors.course_code && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.course_code}
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium text-gray-700">
                            Title
                        </label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded border-gray-300"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                        />
                        {errors.title && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.title}
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            className="mt-1 block w-full rounded border-gray-300"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        {errors.description && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.description}
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium text-gray-700">
                            Capacity
                        </label>
                        <input
                            type="number"
                            min="0"
                            className="mt-1 block w-full rounded border-gray-300"
                            value={data.capacity}
                            onChange={(e) => setData('capacity', parseInt(e.target.value) || 0)}
                        />
                        {errors.capacity && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.capacity}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                        Save
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
