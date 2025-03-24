// resources/js/Pages/Schools/Create.jsx

import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';

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
                console.log('Success!');
            },
            onError: (errors) => {
                console.log('Errors:', errors);
            },
        });
    };


    return (
        <AppLayout>
            <Head title="Create School" />

            <div className="max-w-2xl mx-auto bg-white p-6 shadow rounded">
                <h1 className="text-xl font-bold mb-4">Create a New School</h1>

                <form onSubmit={submit}>
                    <div className="mb-4">
                        <label className="block font-medium text-gray-700">
                            Name
                        </label>
                        <input
                            type="text"
                            className="mt-1 block w-full border-gray-300 rounded"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && (
                            <div className="text-red-600 text-sm mt-1">
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
                            className="mt-1 block w-full border-gray-300 rounded"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        {errors.email && (
                            <div className="text-red-600 text-sm mt-1">
                                {errors.email}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        Save
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
