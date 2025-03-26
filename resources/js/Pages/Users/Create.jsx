import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Create({ roles, schools }) {
    const { flash } = usePage().props;

    const { data, setData, post, errors, processing } = useForm({
        name: '',
        email: '',
        role_id: '',
        school_id: schools?.id || '', // Safely access schools.id or default to an empty string
    });

    const handleChange = (field) => (e) => setData(field, e.target.value);

    const submit = (e) => {
        e.preventDefault();
        post(route('users.store'));
    };
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Create User" />

            <div className="mx-auto max-w-xl rounded-lg bg-white p-6 shadow">
                <h2 className="mb-4 text-2xl font-semibold">Create New User</h2>

                {flash?.success && (
                    <div className="mb-4 rounded bg-green-100 p-2 text-green-800">
                        {flash.success}
                    </div>
                )}

                <form onSubmit={submit}>
                    {[
                        { type: 'text', field: 'name', placeholder: 'Name' },
                        { type: 'email', field: 'email', placeholder: 'Email' },
                    ].map(({ type, field, placeholder }) => (
                        <div className="mb-4" key={field}>
                            <input
                                type={type}
                                placeholder={placeholder}
                                className="w-full rounded border border-gray-300 px-3 py-2"
                                value={data[field]}
                                onChange={handleChange(field)}
                            />
                            {errors[field] && (
                                <div className="text-sm text-red-500">
                                    {errors[field]}
                                </div>
                            )}
                        </div>
                    ))}

                    <div className="mb-4">
                        <select
                            className="w-full rounded border border-gray-300 px-3 py-2"
                            value={data.role_id}
                            onChange={handleChange('role_id')}
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

                    <div className="mb-4">
                        <select
                            className="w-full rounded border border-gray-300 px-3 py-2"
                            value={data.school_id}
                            onChange={handleChange('school_id')}
                        >
                            <option value="">Select a School</option>
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

                    <button
                        type="submit"
                        className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
                        disabled={processing}
                    >
                        {processing ? 'Creating...' : 'Create User'}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
