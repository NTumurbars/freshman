import React from 'react';
import { useForm, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Edit({ user, roles, schools }) {
    const { data, setData, put, errors, processing } = useForm({
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        school_id: user.school_id || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('users.update', user.id));
    };

    return (
        <AppLayout>
            <Head title="Edit User" />

            <div className="max-w-xl mx-auto">
                <h2 className="text-2xl font-semibold mb-4">Edit User</h2>

                <form onSubmit={submit}>
                    {/* same inputs as Create form, prefilled */}
                    <input
                        type="text"
                        className="w-full rounded mb-2"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                    />
                    {errors.name && <div className="text-red-500">{errors.name}</div>}

                    {/* Email, Role, School, Password fields identical to Create.jsx above */}

                    <button className="px-4 py-2 bg-blue-500 text-white rounded" disabled={processing}>
                        Update User
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
