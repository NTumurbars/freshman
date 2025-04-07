import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Calendar, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Index({ auth, terms }) {
    // Use usePage to directly access the shared auth data from Inertia
    const { auth: pageAuth } = usePage().props;

    // Debug to see what's coming through
    console.log('Page Auth:', pageAuth);
    console.log('Component Auth:', auth);

    // Get user role from the correct location - the global auth object
    const userRole = pageAuth?.user?.role?.id || auth?.user?.role_id;

    // Ensure school data is available
    const school = pageAuth?.user?.school || auth?.school;

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Academic Terms" />

            <div className="sm:flex sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Academic Terms</h1>
                    <p className="mt-2 text-sm text-gray-700">Manage academic terms and their schedules</p>
                </div>
                {auth.can && auth.can.create_term && school && (
                    <Link
                        href={route('terms.create', { school: school.id })}
                        className="mt-4 sm:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Create New Term
                    </Link>
                )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {terms.map(term => (
                    <div key={term.id} className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Calendar className={`h-6 w-6 ${term.is_current ? 'text-green-600' : 'text-gray-400'}`} />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">{term.school_name}</dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-lg font-semibold text-gray-900">{term.name}</div>
                                            {term.is_current && (
                                                <div className="ml-2">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        Current
                                                    </span>
                                                </div>
                                            )}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3">
                            <div className="text-sm">
                                <div className="font-medium text-gray-900">
                                    {new Date(term.start_date).toLocaleDateString()} - {new Date(term.end_date).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 bg-gray-50 grid grid-cols-2 divide-x divide-gray-200">
                            <div className="px-5 py-3">
                                <div className="flex items-center">
                                    <BookOpen className="h-5 w-5 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-500">
                                        {term.sections_count} {term.sections_count === 1 ? 'Section' : 'Sections'}
                                    </span>
                                </div>
                            </div>
                            <div className="px-5 py-3">
                                {auth.can && auth.can.update_term && school && term.school_id ? (
                                    <Link
                                        href={route('terms.edit', { school: school.id, term: term.id })}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Manage Term
                                    </Link>
                                ) : (
                                    <Link
                                        href={route('terms.show', { school: term.school_id || school?.id, term: term.id })}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        View Details
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {terms.length === 0 && (
                    <div className="col-span-full text-center py-12">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No Terms</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new academic term.</p>
                        {auth.can && auth.can.create_term && school && (
                            <div className="mt-6">
                                <Link
                                    href={route('terms.create', { school: school.id })}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Create New Term
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
