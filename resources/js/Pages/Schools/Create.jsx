// resources/js/Pages/Schools/Create.jsx

import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';

export default function Create() {
    const { data, setData, post, errors } = useForm({
        name: '',
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        console.log('Submitting data:', data);

        post(route('schools.store'), {
            onSuccess: () => {
                toast.success('School created successfully');
            },
            onError: (errors) => {
                console.log('Errors:', errors); // Error logging
                toast.error('Something went wrong');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Create School" />

            <div className="mx-auto max-w-2xl rounded bg-white p-6 shadow">
                <h1 className="mb-4 text-xl font-bold">Create a New School</h1>

                <form onSubmit={submit}>
                    <div className="mb-4">
                        <label className="block font-medium text-gray-700">
                            Name
                        </label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded border-gray-300"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.name}
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block font-medium text-gray-700">
                            Admin Email
                        </label>
                        <input
                            type="email"
                            className="mt-1 block w-full rounded border-gray-300"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && (
                            <div className="mt-1 text-sm text-red-600">
                                {errors.email}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    >
                        Create
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
