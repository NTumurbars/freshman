import { Link } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { Calendar, Users, Building, BookOpen, GraduationCap, Clock } from 'lucide-react';

export default function Welcome({ auth, users, schools }) {
    const features = [
        {
            name: 'Course Management',
            description: 'Easily manage courses, sections, and academic programs with our intuitive interface.',
            icon: BookOpen,
        },
        {
            name: 'Schedule Planning',
            description: 'Efficiently plan and organize class schedules, avoiding conflicts automatically.',
            icon: Clock,
        },
        {
            name: 'Academic Terms',
            description: 'Manage academic terms and their associated courses with ease.',
            icon: Calendar,
        },
        {
            name: 'Resource Management',
            description: 'Track and manage classrooms, buildings, and other campus resources.',
            icon: Building,
        },
        {
            name: 'User Management',
            description: 'Handle student, professor, and staff accounts with role-based access control.',
            icon: Users,
        },
        {
            name: 'Program Administration',
            description: 'Oversee academic programs, departments, and curriculum requirements.',
            icon: GraduationCap,
        },
    ];

    return (
        <>
            <Head title="Welcome to UniMan" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center">
                                <span className="text-2xl font-bold text-blue-600">UniMan</span>
                                <span className="ml-2 text-sm text-gray-500">University Manager</span>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative isolate pt-14">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-600 to-blue-400 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
                </div>

                <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                            Streamline Your University Management
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            UniMan is your comprehensive solution for managing academic schedules, courses, and resources.
                            Built for universities that want to focus on education, not administration.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                >
                                    Get Started
                                </Link>
                            )}
                            <a
                                href="#features"
                                className="text-base font-semibold leading-6 text-gray-900 hover:text-blue-600"
                            >
                                Learn more <span aria-hidden="true">→</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white py-12">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                        <div className="flex flex-col items-center justify-center rounded-2xl bg-blue-50 px-8 py-10">
                            <dt className="text-base leading-7 text-gray-600">Active Users</dt>
                            <dd className="mt-4 text-5xl font-semibold tracking-tight text-blue-600">{users}</dd>
                        </div>
                        <div className="flex flex-col items-center justify-center rounded-2xl bg-blue-50 px-8 py-10">
                            <dt className="text-base leading-7 text-gray-600">Universities</dt>
                            <dd className="mt-4 text-5xl font-semibold tracking-tight text-blue-600">{schools}</dd>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="bg-gray-50 py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Everything you need to manage your university
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            UniMan provides a comprehensive suite of tools designed specifically for higher education institutions.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-7xl">
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature) => {
                                const Icon = feature.icon;
                                return (
                                    <div key={feature.name} className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition-shadow">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                                            <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </div>
                                        <h3 className="mt-4 text-lg font-semibold leading-8 text-gray-900">
                                            {feature.name}
                                        </h3>
                                        <p className="mt-2 text-base leading-7 text-gray-600">
                                            {feature.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white">
                <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
                    <div className="mt-8 md:order-1 md:mt-0">
                        <p className="text-center text-xs leading-5 text-gray-500">
                            &copy; {new Date().getFullYear()} UniMan. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
}
