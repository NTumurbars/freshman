import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Edit({ user, roles, schools }) {
    const { flash } = usePage().props;

    const { data, setData, put, errors, processing } = useForm({
        name: user.name || '',
        email: user.email || '',
        role_id: user.role_id || '',
        school_id: user.school_id || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('users.update', user.id));
    };
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Edit User" />

            <div className="mx-auto max-w-xl rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-2xl font-semibold">Edit User</h2>

                {flash?.success && (
                    <div className="mb-4 rounded bg-green-100 p-2 text-green-800">
                        {flash.success}
                    </div>
                )}

                <form onSubmit={submit}>
                    {/* Name */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Name"
                            className="w-full rounded border border-gray-300 px-3 py-2"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && (
                            <div className="text-sm text-red-500">
                                {errors.name}
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div className="mb-4">
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full rounded border border-gray-300 px-3 py-2"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && (
                            <div className="text-sm text-red-500">
                                {errors.email}
                            </div>
                        )}
                    </div>

                    {/* Role */}
                    <div className="mb-4">
                        <select
                            className="w-full rounded border border-gray-300 px-3 py-2"
                            value={data.role_id}
                            onChange={(e) => setData('role_id', e.target.value)}
                        >
                            <option value="">Select Role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.name.replace('_', ' ').toUpperCase()}
                                </option>
                            ))}
                        </select>
                        {errors.role_id && (
                            <div className="text-sm text-red-500">
                                {errors.role_id}
                            </div>
                        )}
                    </div>

                    {/* School */}
                    <div className="mb-4">
                        <select
                            className="w-full rounded border border-gray-300 px-3 py-2"
                            value={data.school_id}
                            onChange={(e) =>
                                setData('school_id', e.target.value)
                            }
                        >
                            <option value="">No School (Optional)</option>
                            {schools.map((school) => (
                                <option key={school.id} value={school.id}>
                                    {school.name}
                                </option>
                            ))}
                        </select>
                        {errors.school_id && (
                            <div className="text-sm text-red-500">
                                {errors.school_id}
                            </div>
                        )}
                    </div>

                    {/* Password (Optional) */}
                    <div className="mb-4">
                        <input
                            type="password"
                            placeholder="New Password (leave blank to keep current)"
                            className="w-full rounded border border-gray-300 px-3 py-2"
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
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            className="w-full rounded border border-gray-300 px-3 py-2"
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

                    <button
                        type="submit"
                        className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                        disabled={processing}
                    >
                        {processing ? 'Updating...' : 'Update User'}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
