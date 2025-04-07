// resources/js/Components/Navbar.jsx
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { User } from 'lucide-react';

export default function Navbar({ children, auth: propAuth }) {
    // Use prop auth if available, otherwise fall back to usePage
    const { auth: pageAuth } = usePage().props;
    const auth = propAuth || pageAuth || {};

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleOutsideClick(event) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleOutsideClick);
        return () =>
            document.removeEventListener('mousedown', handleOutsideClick);
    }, []);

    // Ensure we have valid user data before rendering
    const userName = auth?.user?.name || 'User';
    const userEmail = auth?.user?.email || '';

    return (
        <header className="bg-white shadow-md fixed top-0 w-full z-50">
            <div className="mx-auto px-4 text-black sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        {/* Logo */}
                        <Link href="/dashboard" className="text-2xl font-bold">
                            UNIMAN
                        </Link>
                    </div>

                    {/* Center content like search, etc. */}
                    <div className="flex items-center space-x-4">
                        {children}
                    </div>

                    {/* User Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center rounded-full bg-gray-100 p-2 focus:outline-none hover:bg-gray-200"
                        >
                            <User className="h-5 w-5 text-gray-700" />
                            <span className="ml-2 hidden md:block">
                                {userName}
                            </span>
                        </button>

                        {dropdownOpen && (
                            <div className="absolute right-0 z-20 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                                <div className="border-b border-gray-100 px-4 py-2 md:hidden">
                                    <p className="text-sm font-medium text-gray-800">{userName}</p>
                                    <p className="text-xs text-gray-500">{userEmail}</p>
                                </div>

                                <Link
                                    href="/profile"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    Profile
                                </Link>
                                <Link
                                    href="/profile/edit"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    Settings
                                </Link>
                                <Link
                                    href="/logout"
                                    method="post"
                                    as="button"
                                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    Logout
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
