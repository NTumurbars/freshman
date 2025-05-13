import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { BookOpen, Calendar } from 'lucide-react';

export default function Index({ auth, terms }) {
    // Use usePage to directly access the shared auth data from Inertia
    const { auth: pageAuth } = usePage().props;

    // Debug to see what's coming through
    console.log('Page Auth:', pageAuth);
    console.log('Component Auth:', auth);

    // Ensure school data is available
    const school = pageAuth?.user?.school || auth?.school;

    return (
        <AppLayout>
            <Head title="Academic Terms" />

            <div className="mb-6 sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        Academic Terms
                    </h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Manage academic terms and their schedules
                    </p>
                </div>
                {auth.can && auth.can.create_term && school && (
                    <Link
                        href={route('terms.create', { school: school.id })}
                        className="mt-4 inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0"
                    >
                        Create New Term
                    </Link>
                )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {terms.map((term) => (
                    <div
                        key={term.id}
                        className="overflow-hidden rounded-lg bg-white shadow"
                    >
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Calendar
                                        className={`h-6 w-6 ${term.is_current ? 'text-green-600' : 'text-gray-400'}`}
                                    />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">
                                            {term.school_name}
                                        </dt>
                                        <dd className="flex items-baseline">
                                            <div className="text-lg font-semibold text-gray-900">
                                                {term.name}
                                            </div>
                                            {term.is_current && (
                                                <div className="ml-2">
                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
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
                        <div className="grid grid-cols-2 divide-x divide-gray-200 border-t border-gray-200 bg-gray-50">
                            <div className="px-5 py-3">
                                <div className="flex items-center">
                                    <BookOpen className="mr-2 h-5 w-5 text-gray-400" />
                                    <span className="text-sm text-gray-500">
                                        {term.sections_count} {term.sections_count === 1 ? 'Section' : 'Sections'}
                                    </span>
                                </div>
                            </div>
                            {auth.can && auth.can.update_term && school && term.school_id && (
                                <div className="px-5 py-3">
                                    <Link
                                        href={route('terms.edit', {
                                            school: school.id,
                                            term: term.id,
                                        })}
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Manage Term
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {terms.length === 0 && (
                    <div className="col-span-full py-12 text-center">
                        <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No Terms
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Get started by creating a new academic term.
                        </p>
                        {auth.can && auth.can.create_term && school && (
                            <div className="mt-6">
                                <Link
                                    href={route('terms.create', {
                                        school: school.id,
                                    })}
                                    className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
