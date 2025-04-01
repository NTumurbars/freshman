import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Edit({ school }) {
    const { flash } = usePage().props;
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const { data, setData, put, errors, processing } = useForm({
        name: school.name || '',
        email: school.email || '',
    });
    const submit = (e) => {
        e.preventDefault();
        put(route('schools.update', school.id));
    };

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
                            disabled
                        />
                        {errors.email && (
                            <div className="text-sm text-red-500">
                                {errors.email}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                        disabled={processing}
                    >
                        {processing ? 'Updating...' : 'Update School'}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
