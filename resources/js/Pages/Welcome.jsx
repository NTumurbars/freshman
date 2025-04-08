import { Link } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import { Calendar, Users, Building, BookOpen, GraduationCap, Clock, CheckCircle } from 'lucide-react';

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

    const benefits = [
        'Reduce administrative workload by up to 40%',
        'Eliminate scheduling conflicts automatically',
        'Optimize classroom usage and resources',
        'Streamline course registration for students',
        'Generate comprehensive reports with one click',
    ];

    return (
        <>
            <Head title="UniMan - University Management System" />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center">
                                <span className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">UniMan</span>
                                <span className="ml-2 text-sm text-gray-500 hidden sm:inline">University Manager</span>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                                >
                                    Sign In
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative isolate pt-14 overflow-hidden">
                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl" aria-hidden="true">
                    <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-600 to-indigo-500 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
                </div>
                
                <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
                    <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-indigo-500 to-blue-500 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
                </div>

                <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
                    <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            Streamline Your University Management
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            UniMan is your comprehensive solution for managing academic schedules, courses, and resources.
                            Built for universities that want to focus on education, not administration.
                        </p>
                        <div className="mt-10 flex items-center gap-x-6">
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-base font-medium text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-base font-medium text-white shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                                >
                                    Get Started
                                </Link>
                            )}
                            <a
                                href="#features"
                                className="text-base font-semibold leading-6 text-gray-900 hover:text-blue-600 transition-colors duration-200 flex items-center"
                            >
                                Learn more <span className="ml-1 text-blue-600">→</span>
                            </a>
                        </div>
                        
                        <div className="mt-12">
                            <ul className="space-y-3">
                                {benefits.map((benefit, index) => (
                                    <li key={index} className="flex items-center gap-x-3">
                                        <CheckCircle className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                                        <span className="text-gray-600">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0">
                        <div className="relative h-80 w-80 sm:h-96 sm:w-96 lg:h-[30rem] lg:w-[30rem] rounded-2xl overflow-hidden shadow-xl">
                            <div className="h-full w-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center p-12">
                                <div className="bg-white/90 backdrop-blur rounded-xl shadow-inner p-8 w-full h-full flex flex-col justify-center">
                                    <div className="w-full h-6 bg-blue-200 rounded-full mb-4"></div>
                                    <div className="w-2/3 h-6 bg-blue-200 rounded-full mb-8"></div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[1, 2, 3, 4, 5, 6].map((item) => (
                                            <div key={item} className="aspect-square bg-blue-100 rounded-lg shadow-sm"></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white py-12">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                        <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 px-8 py-12 shadow-sm border border-blue-100">
                            <dt className="text-lg font-medium leading-7 text-gray-600">Active Users</dt>
                            <dd className="mt-4 text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{users}</dd>
                            <p className="mt-2 text-sm text-gray-500">Professionals using UniMan daily</p>
                        </div>
                        <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 px-8 py-12 shadow-sm border border-blue-100">
                            <dt className="text-lg font-medium leading-7 text-gray-600">Universities</dt>
                            <dd className="mt-4 text-6xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{schools}</dd>
                            <p className="mt-2 text-sm text-gray-500">Institutions transformed</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div id="features" className="bg-gradient-to-b from-white to-blue-50 py-24 sm:py-32">
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
                                    <div key={feature.name} className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 hover:shadow-lg transition-all duration-200 hover:translate-y-[-4px]">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm">
                                            <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                                        </div>
                                        <h3 className="mt-5 text-xl font-semibold leading-8 text-gray-900">
                                            {feature.name}
                                        </h3>
                                        <p className="mt-3 text-base leading-7 text-gray-600">
                                            {feature.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Ready to transform your institution?
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-blue-100">
                            Join universities worldwide that are already benefiting from UniMan's powerful scheduling platform.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            {auth?.user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-full bg-white px-6 py-3 text-base font-medium text-blue-600 shadow-sm hover:bg-blue-50 transition-colors duration-200"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <Link
                                    href={route('login')}
                                    className="rounded-full bg-white px-6 py-3 text-base font-medium text-blue-600 shadow-sm hover:bg-blue-50 transition-colors duration-200"
                                >
                                    Get Started Today
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-white">
                <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
                    <div className="flex justify-center space-x-6">
                        <Link href="/" className="text-gray-400 hover:text-gray-500">Home</Link>
                        <Link href="#features" className="text-gray-400 hover:text-gray-500">Features</Link>
                        {auth?.user ? (
                            <Link href={route('dashboard')} className="text-gray-400 hover:text-gray-500">Dashboard</Link>
                        ) : (
                            <Link href={route('login')} className="text-gray-400 hover:text-gray-500">Login</Link>
                        )}
                    </div>
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
