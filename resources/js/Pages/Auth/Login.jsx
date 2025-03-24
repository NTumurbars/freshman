// resources/js/Pages/Auth/Login.jsx

import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    function submit(e) {
        e.preventDefault();
        post(route('login'));
    }

    return (
        <>
            <Head title="Login" />

            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <div className="w-full max-w-md p-6 bg-white rounded shadow">
                    <h1 className="text-2xl font-bold text-center mb-4">
                        Course Scheduling System
                    </h1>
                    <p className="text-center text-gray-600 mb-6">
                        Please login to continue
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
                                autoComplete="username"
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

                        {/* Remember Me */}
                        <div className="mb-4 flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={data.remember}
                                onChange={e => setData('remember', e.target.checked)}
                            />
                            <label
                                htmlFor="remember"
                                className="ml-2 text-sm text-gray-700"
                            >
                                Remember Me
                            </label>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="mb-6 text-right">
                            <Link
                                href={route('password.request')}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Forgot your password?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
                        >
                            {processing ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
