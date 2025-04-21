import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Building,
    Users,
    Calendar,
    GraduationCap,
    BookOpen,
    Mail,
    Globe,
    PenSquare,
    School,
    ShieldCheck,
    ExternalLink
} from 'lucide-react';
import { useEffect } from 'react';

export default function Show({ school_info, flash }) {
    // Debug the admin users data
    useEffect(() => {
        console.log('School info:', school_info);
        console.log('Admin users data:', school_info.admin_users);
    }, [school_info]);

    // Make sure admin_users is always at least an empty array
    const adminUsers = Array.isArray(school_info.admin_users) ? school_info.admin_users : [];

    return (
        <AppLayout>
            <Head title={school_info.name} />

            {/* Header with school info and actions */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        {school_info.logo_url ? (
                            <img
                                src={school_info.logo_url}
                                alt={`${school_info.name} logo`}
                                className="h-16 w-16 object-contain rounded-lg border border-gray-200"
                            />
                        ) : (
                            <div className="h-16 w-16 bg-blue-100 text-blue-600 flex items-center justify-center rounded-lg border border-blue-200">
                                <School className="h-8 w-8" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                {school_info.name}
                            </h1>
                            <div className="flex items-center text-gray-500 text-sm mt-1">
                                <Mail className="h-4 w-4 mr-1" />
                                <span>{school_info.email}</span>
                            </div>
                            {school_info.code && (
                                <div className="mt-1">
                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                        Code: {school_info.code}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 self-start md:self-center">
                        <Link
                            href={route('schools.edit', school_info.id)}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                        >
                            <PenSquare className="h-4 w-4 mr-2" />
                            Edit School
                        </Link>
                        <Link
                            href={route('schools.index')}
                            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                        >
                            Back to Schools
                        </Link>
                    </div>
                </div>

                {flash?.success && (
                    <div className="mb-6 rounded-lg bg-green-100 p-4 text-green-800 animate-fadeOut">
                        {flash.success}
                    </div>
                )}

                {/* School details card */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">School Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {school_info.website_url && (
                            <div className="flex items-start">
                                <Globe className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Website</p>
                                    <a
                                        href={school_info.website_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline"
                                    >
                                        {school_info.website_url}
                                    </a>
                                </div>
                            </div>
                        )}
                        {school_info.description && (
                            <div className="flex items-start col-span-full">
                                <BookOpen className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Description</p>
                                    <p className="text-gray-700">{school_info.description}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-lg mr-4">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                            <p className="text-2xl font-bold text-gray-900">{school_info.users.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-lg mr-4">
                            <Building className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Buildings</h3>
                            <p className="text-2xl font-bold text-gray-900">{school_info.buildings.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-lg mr-4">
                            <Calendar className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Academic Terms</h3>
                            <p className="text-2xl font-bold text-gray-900">{school_info.terms.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center">
                        <div className="bg-orange-100 p-3 rounded-lg mr-4">
                            <GraduationCap className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Departments</h3>
                            <p className="text-2xl font-bold text-gray-900">{school_info.departments || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin accounts section */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm mb-8">
                <div className="flex items-center mb-4">
                    <ShieldCheck className="h-5 w-5 text-blue-600 mr-2" />
                    <h2 className="text-lg font-semibold text-gray-800">School Administrators</h2>
                </div>

                {adminUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {adminUsers.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{admin.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">
                                                {new Date(admin.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <a
                                                href={`/users/${admin.id}/edit`}
                                                className="text-blue-600 hover:text-blue-900 inline-flex items-center"
                                            >
                                                View<ExternalLink className="ml-1 h-3 w-3" />
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="bg-gray-50 rounded-md p-4 text-center">
                        <p className="text-gray-500">No administrators found for this school</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
