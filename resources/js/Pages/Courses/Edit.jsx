import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Edit({ departments, majors, course }) {
    const { data, setData, patch, errors, processing } = useForm({
        department_id: course.department_id,
        major_id: course.major_id,
        code: course.code,
        credits: course.credits,
        title: course.title,
        description: course.description || '',
        credits: course.credits,
    });

    const { auth } = usePage().props;
    const school = auth.user.school;

    const submit = (e) => {
        e.preventDefault();
        patch(
            route('courses.update', { school: school.id, course: course.id }),
            {
                onSuccess: () => {
                    console.log('Success!');
                },
                onError: (errors) => {
                    console.log('Errors:', errors);
                },
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Edit Course" />

            <div className="mx-auto max-w-2xl rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-xl font-bold">Edit Course</h1>

                <form onSubmit={submit}>
                    <div className="mb-4">
                        <label className="block font-medium text-gray-700">
                            Department
                        </label>
                        <select
                            className="mt-1 block w-full rounded border-gray-300"
                            value={data.department_id}
                            onChange={(e) =>
                                setData(
                                    'department_id',
                                    parseInt(e.target.value),
                                )
                            }
                        >
                            <option value="">Select Department</option>
                            {departments.map((department) => (
                                <option
                                    key={department.id}
                                    value={department.id}
                                >
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
                            Major (Optional)
                        </label>
                        <select
                            className="mt-1 block w-full rounded border-gray-300"
                            value={data.major_id}
                            onChange={(e) =>
                                setData('major_id', parseInt(e.target.value))
                            }
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
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                        />
                        {errors.code && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.code}
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium text-gray-700">
                            Credits
                        </label>
                        <input
                            type="number"
                            className="mt-1 block w-full rounded border-gray-300"
                            value={data.credits}
                            onChange={(e) => setData('credits', e.target.value)}
                        />
                        {errors.credits && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.credits}
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
                            onChange={(e) =>
                                setData('description', e.target.value)
                            }
                            rows="4"
                        />
                        {errors.description && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.description}
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium text-gray-700">
                            Credits
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="6"
                            className="mt-1 block w-full rounded border-gray-300"
                            value={data.credits}
                            onChange={(e) => setData('credits', e.target.value)}
                        />
                        {errors.credits && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.credits}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between">
                        <button
                            type="submit"
                            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                        >
                            Update Course
                        </button>

                        <a
                            href={route('courses.index', { school: school.id })}
                            className="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400"
                        >
                            Cancel
                        </a>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
