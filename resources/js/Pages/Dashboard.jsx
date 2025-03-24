import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props;

    const role = auth.user.role.name;

    const isAdmin = role === 'super_admin' || role === 'school_admin';
    const isCoordinator = role === 'major_coordinator';
    const isProfessor = role === 'professor';
    const isStudent = role === 'student';

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="container mx-auto px-4 py-8">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
                    <h1 className="text-3xl font-bold mb-2">Welcome back, {auth.user.name}!</h1>
                    <p className="text-lg">You are logged in as <strong>{role.replace('_', ' ')}</strong>.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {/* Courses */}
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-2">📚 Courses</h2>
                        <p className="text-gray-600">Browse and manage course offerings.</p>
                        <Link href={route('courses.index')} className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                            View Courses
                        </Link>
                    </div>

                    {/* Departments */}
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-2">🏢 Departments</h2>
                        <p className="text-gray-600">View departments and their details.</p>
                        <Link href={route('departments.index')} className="inline-block mt-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                            View Departments
                        </Link>
                    </div>

                    {/* Rooms */}
                    <div className="bg-white shadow-lg rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-2">🏫 Rooms</h2>
                        <p className="text-gray-600">See available rooms and facilities.</p>
                        <Link href={route('rooms.index')} className="inline-block mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
                            View Rooms
                        </Link>
                    </div>

                    {/* User Management (admins only) */}
                    {isAdmin && (
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-2">👥 User Management</h2>
                            <p className="text-gray-600">Create, edit, and manage user accounts.</p>
                            <Link href={route('users.index')} className="inline-block mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
                                Manage Users
                            </Link>
                        </div>
                    )}

                    {/* Professor-specific Section */}
                    {isProfessor && (
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-2">📝 My Courses</h2>
                            <p className="text-gray-600">Manage your assigned courses.</p>
                            <Link href={route('courses.professor.index')} className="inline-block mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded">
                                My Courses
                            </Link>
                        </div>
                    )}

                    {/* Student-specific Section */}
                    {isStudent && (
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-2">📆 My Schedule</h2>
                            <p className="text-gray-600">View your current class schedule.</p>
                            <Link href={route('student.schedule')} className="inline-block mt-4 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded">
                                My Schedule
                            </Link>
                        </div>
                    )}

                    {/* Major Coordinator Section */}
                    {isCoordinator && (
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-2">📌 Major Coordination</h2>
                            <p className="text-gray-600">Coordinate courses and assignments.</p>
                            <Link href={route('major.coord.index')} className="inline-block mt-4 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded">
                                Coordination Panel
                            </Link>
                        </div>
                    )}

                    {/* Admin-only: Schools management */}
                    {role === 'super_admin' && (
                        <div className="bg-white shadow-lg rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-2">🏛️ Manage Schools</h2>
                            <p className="text-gray-600">Create and manage school profiles.</p>
                            <Link href={route('schools.index')} className="inline-block mt-4 bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded">
                                Manage Schools
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
