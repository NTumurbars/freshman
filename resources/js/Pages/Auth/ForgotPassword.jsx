// resources/js/Pages/Auth/ForgotPassword.jsx

import React from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword() {
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        email: '',
    });

    function submit(e) {
        e.preventDefault();
        post(route('password.email'));
    }

    return (
        <>
            <Head title="Forgot Password" />

            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <div className="w-full max-w-md p-6 bg-white rounded shadow">
                    <h1 className="text-2xl font-bold text-center mb-4">
                        Course Scheduling System
                    </h1>
                    <p className="text-center text-gray-600 mb-6">
                        Reset your password
                    </p>

                    {recentlySuccessful && (
                        <div className="mb-4 text-green-600">
                            A password reset link has been sent to your email!
                        </div>
                    )}

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

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
                        >
                            {processing ? 'Sending...' : 'Send Password Reset Link'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
