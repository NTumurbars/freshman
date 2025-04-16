// resources/js/Pages/Schools/Create.jsx

import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';

export default function Create({ departments, majors }) {
    const { data, setData, post, errors, processing } = useForm({
        department_id: '',
        major_id: '',
        code: '',
        title: '',
        description: '',
        credits: '',
    });

    // Filter majors based on selected department
    const filteredMajors = majors.filter(
        (major) => major.department_id === data.department_id,
    );

    const handleDepartmentChange = (e) => {
        const departmentId = parseInt(e.target.value);
        setData((data) => ({
            ...data,
            department_id: departmentId,
            major_id: '', // Reset major when department changes
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
    const school = auth.user.school;

    return (
        <AppLayout>
            <Head title="Create Course" />

            <div className="mx-auto max-w-3xl overflow-hidden rounded-lg bg-white shadow-md">
                <div className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                    <BookOpen className="mr-3 h-8 w-8 text-white" />
                    <h1 className="text-xl font-bold text-white">
                        Create a New Course
                    </h1>
                </div>

                <form onSubmit={submit} className="space-y-6 px-6 py-6">
                    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <h2 className="mb-2 font-medium text-blue-800">
                            Course Department Information
                        </h2>
                        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block font-medium text-gray-700">
                                    Department
                                </label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.department_id}
                                    onChange={handleDepartmentChange}
                                >
                                    <option value="">
                                        Select a department
                                    </option>
                                    {departments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name}
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
                                <label className="mb-1 block font-medium text-gray-700">
                                    Major (Optional)
                                </label>
                                <select
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.major_id}
                                    onChange={(e) =>
                                        setData('major_id', e.target.value)
                                    }
                                    disabled={!data.department_id}
                                >
                                    <option value="">Select a major</option>
                                    {filteredMajors.map((major) => (
                                        <option key={major.id} value={major.id}>
                                            {major.name}
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

                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h2 className="mb-2 font-medium text-gray-800">
                            Course Details
                        </h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block font-medium text-gray-700">
                                        Course Code
                                    </label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.code}
                                        onChange={(e) =>
                                            setData('code', e.target.value)
                                        }
                                        placeholder="e.g., CS101"
                                    />
                                    {errors.code && (
                                        <div className="mt-1 text-sm text-red-600">
                                            {errors.code}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block font-medium text-gray-700">
                                        Credits
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="6"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.credits}
                                        onChange={(e) =>
                                            setData('credits', e.target.value)
                                        }
                                        placeholder="e.g., 3"
                                    />
                                    {errors.credits && (
                                        <div className="mt-1 text-sm text-red-600">
                                            {errors.credits}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block font-medium text-gray-700">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        value={data.title}
                                        onChange={(e) =>
                                            setData('title', e.target.value)
                                        }
                                        placeholder="Introduction to Computer Science"
                                    />
                                    {errors.title && (
                                        <div className="mt-1 text-sm text-red-600">
                                            {errors.title}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
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
                            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75"
                        >
                            {processing ? 'Saving...' : 'Save Course'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
