// resources/js/Pages/Auth/ResetPassword.jsx

import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('password.update'));
    }

    return (
        <>
            <Head title="Reset Password" />

            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <div className="w-full max-w-md p-6 bg-white rounded shadow">
                    <h1 className="text-2xl font-bold text-center mb-4">
                        Course Scheduling System
                    </h1>
                    <p className="text-center text-gray-600 mb-6">
                        Choose a new password
                    </p>

                    <form onSubmit={submit}>
                        {/* Email */}
                        <div className="mb-4">
                            <label className="block font-medium text-sm text-gray-700">
                                Email
                            </label>
                            <input
                                type="email"
                                className="mt-1 block w-full border-gray-300 rounded"
                                value={data.email}
                                onChange={e => setData('email', e.target.value)}
                            />
                            {errors.email && (
                                <div className="text-red-600 text-sm mt-1">
                                    {errors.email}
                                </div>
                            )}
                        </div>

                        {/* Password */}
                        <div className="mb-4">
                            <label className="block font-medium text-sm text-gray-700">
                                New Password
                            </label>
                            <input
                                type="password"
                                className="mt-1 block w-full border-gray-300 rounded"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                            />
                            {errors.password && (
                                <div className="text-red-600 text-sm mt-1">
                                    {errors.password}
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="mb-6">
                            <label className="block font-medium text-sm text-gray-700">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                className="mt-1 block w-full border-gray-300 rounded"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                            />
                            {errors.password_confirmation && (
                                <div className="text-red-600 text-sm mt-1">
                                    {errors.password_confirmation}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
                        >
                            {processing ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
