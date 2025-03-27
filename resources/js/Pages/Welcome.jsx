import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
            <Head title="Welcome" />

            <h1 className="text-4xl font-bold mb-4 text-gray-800">
                Welcome to the Course Scheduling System
            </h1>
            <p className="mb-6 text-gray-600">
                Manage courses, instructors, rooms, and more.
            </p>

            <div className="space-x-4">
                <Link
                    href={route('login')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                    Login
                </Link>

            </div>
        </div>
    );
}
