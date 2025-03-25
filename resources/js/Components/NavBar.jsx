// resources/js/Components/NavBar.jsx

import React, { useEffect, useRef, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function NavBar() {
    const { auth } = usePage().props;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef();

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Brand */}
                    <Link href={route('dashboard')} className="text-2xl font-bold text-indigo-600">
                        📅 Course Scheduler
                    </Link>

                    {/* Navigation */}
                    <div className="flex items-center space-x-8">
                        {auth.user && (
                            <>
                                <Link href={route('schools.index')} className="text-gray-700 hover:text-indigo-600 transition font-medium">
                                    Schools
                                </Link>

                                <Link href={route('departments.index')} className="text-gray-700 hover:text-indigo-600 transition font-medium">
                                    Departments
                                </Link>

                                <Link href={route('courses.index')} className="text-gray-700 hover:text-indigo-600 transition font-medium">
                                    Courses
                                </Link>

                                <Link href={route('rooms.index')} className="text-gray-700 hover:text-indigo-600 transition font-medium">
                                    Rooms
                                </Link>
                            </>
                        )}

                        {/* Authenticated Dropdown */}
                        {auth.user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center space-x-1 text-gray-700 hover:text-indigo-600 font-medium transition focus:outline-none"
                                >
                                    <span>{auth.user.name}</span>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"
                                         viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                                    </svg>
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                                        <Link
                                            href={route('profile.show')}
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            View Profile
                                        </Link>
                                        <Link
                                            href={route('profile.edit')}
                                            className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            Edit Profile
                                        </Link>
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                                            onClick={() => setDropdownOpen(false)}
                                        >
                                            Logout
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                href={route('login')}
                                className="text-gray-700 hover:text-indigo-600 transition font-medium"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
