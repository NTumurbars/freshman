import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function Edit({ user }) {
    const { data, setData, patch, errors, processing } = useForm({
        name: user.name || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Edit Profile" />

            <div className="mx-auto max-w-xl rounded bg-white p-6 shadow-md">
                <h2 className="mb-4 text-2xl font-bold">Edit Profile</h2>

                <form onSubmit={submit}>
                    <div className="mb-4">
                        <label className="block font-medium text-gray-700">
                            Name
                        </label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && (
                            <div className="text-sm text-red-500">
                                {errors.name}
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium text-gray-700">
                            Email
                        </label>
                        <input
                            type="email"
                            className="mt-1 block w-full rounded border-gray-300 bg-gray-100 shadow-sm"
                            value={user.email}
                            disabled
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium text-gray-700">
                            New Password (optional)
                        </label>
                        <input
                            type="password"
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                        />
                        {errors.password && (
                            <div className="text-sm text-red-500">
                                {errors.password}
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium text-gray-700">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            className="mt-1 block w-full rounded border-gray-300 shadow-sm"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                        />
                        {errors.password_confirmation && (
                            <div className="text-sm text-red-500">
                                {errors.password_confirmation}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        <button
                            type="submit"
                            className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                            disabled={processing}
                        >
                            Save Changes
                        </button>

                        <Link
                            href={route('profile.show')}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
