import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

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
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Edit User" />

            <div className="mx-auto max-w-xl">
                <h2 className="mb-4 text-2xl font-semibold">Edit User</h2>

                <form onSubmit={submit}>
                    {/* same inputs as Create form, prefilled */}
                    <input
                        type="text"
                        className="mb-2 w-full rounded"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    {errors.name && (
                        <div className="text-red-500">{errors.name}</div>
                    )}

                    {/* Email, Role, School, Password fields identical to Create.jsx above */}

                    <button
                        className="rounded bg-blue-500 px-4 py-2 text-white"
                        disabled={processing}
                    >
                        Update User
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
