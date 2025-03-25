import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';

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
                <Link href={route('login')}>
                    <Button size="lg">
                        Login
                    </Button>
                </Link>
                {/* Uncomment below if you allow public registration:
                <Link
                    href={route('register')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                    Register
                </Link> */}
            </div>
        </div>
    );
}
