// resources/js/Components/NavBar.jsx

import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function NavBar() {
    const { auth } = usePage().props; // for user data, if needed

    return (
        <nav className="bg-white border-b shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                {/* Left: Brand or Title */}
                <div className="flex items-center">
                    <Link href={route('dashboard')} className="text-xl font-bold text-gray-800">
                        Course Scheduling
                    </Link>
                </div>

                {/* Right: Navigation Links */}
                <div className="flex items-center space-x-4">
                    <Link
                        href={route('schools.index')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        Schools
                    </Link>

                    <Link
                        href={route('departments.index')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        Departments
                    </Link>

                    {/* Example Profile/Logout if user is authenticated */}
                    {auth.user ? (
                        <>
                            <Link
                                href={route('profile.edit')}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Profile
                            </Link>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Logout
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Login
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
