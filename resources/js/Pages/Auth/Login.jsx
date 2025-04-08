// resources/js/Pages/Auth/Login.jsx

import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { EyeIcon, EyeSlashIcon, LockClosedIcon, AtSymbolIcon } from '@heroicons/react/24/outline';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = React.useState(false);

    function submit(e) {
        e.preventDefault();
        post(route('login'));
    }

    return (
        <>
            <Head title="Login | UniMan" />

            <div className="min-h-screen flex flex-col sm:flex-row bg-gradient-to-br from-blue-50 to-indigo-50">
                {/* Left Side - Branding Section */}
                <div className="w-full sm:w-1/2 p-8 sm:p-12 flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                    <div className="max-w-md mx-auto">
                        <h1 className="text-4xl font-extrabold mb-6">UniMan</h1>
                        <p className="text-xl font-light text-blue-100 mb-8">
                            Your comprehensive university management system for efficient course scheduling and resource allocation.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="mr-4 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 bg-opacity-20">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span>Smart class scheduling</span>
                            </div>
                            <div className="flex items-center">
                                <div className="mr-4 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 bg-opacity-20">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span>Resource optimization</span>
                            </div>
                            <div className="flex items-center">
                                <div className="mr-4 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 bg-opacity-20">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span>Conflict-free scheduling</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full sm:w-1/2 p-8 sm:p-12 flex items-center justify-center">
                    <div className="w-full max-w-md">
                        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                                <p className="text-gray-500 mt-2">Please sign in to your account</p>
                            </div>

                            <form onSubmit={submit}>
                                {/* Email */}
                                <div className="mb-6">
                                    <label className="block font-medium text-sm text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <AtSymbolIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            className="pl-10 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
                                            value={data.email}
                                            onChange={e => setData('email', e.target.value)}
                                            autoComplete="username"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                    {errors.email && (
                                        <div className="text-red-600 text-sm mt-1">
                                            {errors.email}
                                        </div>
                                    )}
                                </div>

                                {/* Password */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block font-medium text-sm text-gray-700">
                                            Password
                                        </label>
                                        <Link
                                            href={route('password.request')}
                                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <LockClosedIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="pl-10 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg shadow-sm"
                                            value={data.password}
                                            onChange={e => setData('password', e.target.value)}
                                            autoComplete="current-password"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <EyeIcon className="h-5 w-5 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <div className="text-red-600 text-sm mt-1">
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                {/* Remember Me */}
                                <div className="mb-6 flex items-center">
                                    <input
                                        id="remember"
                                        type="checkbox"
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        checked={data.remember}
                                        onChange={e => setData('remember', e.target.checked)}
                                    />
                                    <label
                                        htmlFor="remember"
                                        className="ml-2 text-sm text-gray-700"
                                    >
                                        Remember me on this device
                                    </label>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                                >
                                    {processing ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Logging in...
                                        </span>
                                    ) : (
                                        'Sign In'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
