import React from 'react';
import { useForm, Head, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Create({ roles, schools }) {
    const { flash } = usePage().props;

    const { data, setData, post, errors, processing } = useForm({
        name: '',
        email: '',
        role_id: '',
        school_id: '',
        password: '',
        password_confirmation: '',
    });

    const handleChange = (field) => (e) => setData(field, e.target.value);

    const submit = (e) => {
        e.preventDefault();
        post(route('users.store'));
    };

    return (
        <AppLayout>
            <Head title="Create User" />

            <div className="max-w-xl mx-auto bg-white shadow rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Create New User</h2>

                {flash?.success && (
                    <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
                        {flash.success}
                    </div>
                )}

                <form onSubmit={submit}>
                    {[
                        { type: 'text', field: 'name', placeholder: 'Name' },
                        { type: 'email', field: 'email', placeholder: 'Email' },
                        { type: 'password', field: 'password', placeholder: 'Password' },
                        { type: 'password', field: 'password_confirmation', placeholder: 'Confirm Password' },
                    ].map(({ type, field, placeholder }) => (
                        <div className="mb-4" key={field}>
                            <input
                                type={type}
                                placeholder={placeholder}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                value={data[field]}
                                onChange={handleChange(field)}
                            />
                            {errors[field] && <div className="text-red-500 text-sm">{errors[field]}</div>}
                        </div>
                    ))}

                    <div className="mb-4">
                        <select
                            className="w-full border border-gray-300 rounded px-3 py-2"
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
                        {errors.role_id && <div className="text-red-500 text-sm">{errors.role_id}</div>}
                    </div>

                    <div className="mb-4">
                        <select
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            value={data.school_id}
                            onChange={handleChange('school_id')}
                        >
                            <option value="">No School (Optional)</option>
                            {schools.map((school) => (
                                <option key={school.id} value={school.id}>
                                    {school.name}
                                </option>
                            ))}
                        </select>
                        {errors.school_id && <div className="text-red-500 text-sm">{errors.school_id}</div>}
                    </div>

                    <button
                        type="submit"
                        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
                        disabled={processing}
                    >
                        {processing ? 'Creating...' : 'Create User'}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
