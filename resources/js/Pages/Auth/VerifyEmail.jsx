// resources/js/Pages/Auth/VerifyEmail.jsx

import React, { useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

export default function VerifyEmail() {
    const { status } = usePage().props;
    const { post, processing } = useForm();

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <>
            <Head title="Email Verification" />

            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
                <div className="w-full max-w-md p-6 bg-white rounded shadow">
                    <h1 className="text-2xl font-bold text-center mb-4">
                        Email Verification
                    </h1>
                    <p className="text-center text-gray-600 mb-6">
                        We have emailed you a verification link. Before proceeding, please check your email.
                    </p>

                    {status === 'verification-link-sent' && (
                        <div className="text-green-600 mb-4 text-center">
                            A new verification link has been sent to your email.
                        </div>
                    )}

                    <form onSubmit={submit} className="flex flex-col items-center">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Resend Verification Email
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="text-blue-600 hover:underline"
                        >
                            Logout
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
