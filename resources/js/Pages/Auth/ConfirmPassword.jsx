// resources/js/Pages/Auth/ConfirmPassword.jsx

import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors } = useForm({
        password: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('password.confirm'));
    }

    return (
        <>
            <Head title="Confirm Password" />

            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <div className="w-full max-w-md p-6 bg-white rounded shadow">
                    <h1 className="text-2xl font-bold text-center mb-4">
                        Confirm Password
                    </h1>
                    <p className="mb-6 text-center text-gray-600">
                        Please confirm your password before continuing.
                    </p>

                    <form onSubmit={submit}>
                        <div className="mb-4">
                            <label className="block font-medium text-sm text-gray-700">
                                Password
                            </label>
                            <input
                                type="password"
                                className="mt-1 block w-full border-gray-300 rounded"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                autoComplete="current-password"
                            />
                            {errors.password && (
                                <div className="text-red-600 text-sm mt-1">
                                    {errors.password}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
                        >
                            {processing ? 'Confirming...' : 'Confirm'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
