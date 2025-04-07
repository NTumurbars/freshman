import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Search, Eye, Calendar, User, BookOpen } from 'lucide-react';

export default function Index({ sections, flash, school }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const userSchool = auth.user.school;
    const [searchTerm, setSearchTerm] = useState('');
    const [termFilter, setTermFilter] = useState('');

    // Get unique terms for filter
    const terms = useMemo(() => {
        const uniqueTerms = new Set();
        sections.forEach(section => {
            if (section.term) {
                uniqueTerms.add(section.term.id);
            }
        });
        return [...uniqueTerms].map(id => {
            const term = sections.find(s => s.term?.id === id)?.term;
            return term;
        });
    }, [sections]);

    // Filter sections based on search term and filters
    const filteredSections = useMemo(() => {
        return sections.filter(section => {
            // Term filter
            if (termFilter && section.term?.id !== parseInt(termFilter)) {
                return false;
            }

            // Search term filter
            const searchLower = searchTerm.toLowerCase();
            return (
                (section.section_code && section.section_code.toLowerCase().includes(searchLower)) ||
                (section.course?.title && section.course.title.toLowerCase().includes(searchLower)) ||
                (section.course?.course_code && section.course.course_code.toLowerCase().includes(searchLower)) ||
                (section.professor_profile?.user?.name && section.professor_profile.user.name.toLowerCase().includes(searchLower))
            );
        });
    }, [sections, searchTerm, termFilter]);

    // Status badge for section
    const SectionStatusBadge = ({ section }) => {
        if (!section.term) {
            return (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                    Draft
                </span>
            );
        } else if (section.number_of_students >= (section.course?.capacity || 0)) {
            return (
                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                    Full
                </span>
            );
        } else if (section.schedules && section.schedules.length > 0) {
            return (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Scheduled
                </span>
            );
        } else {
            return (
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                    Unscheduled
                </span>
            );
        }
    };

    return (
        <AppLayout userRole={userRole} school={userSchool}>
            <Head title={`${userSchool.name} - Class Sections`} />

            <div className="mb-6 space-y-4">
                <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Class Sections</h1>
                        <p className="text-gray-600">{userSchool.name}</p>
                    </div>
                    <Link
                        href={route('sections.create', userSchool.id)}
                        className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Create Section
                    </Link>
                </div>

                {/* Search and Filters */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Search */}
                    <div className="relative col-span-2">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Search by section code, course title or instructor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Term Filter */}
                    <div>
                        <select
                            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                            value={termFilter}
                            onChange={(e) => setTermFilter(e.target.value)}
                        >
                            <option value="">All Terms</option>
                            {terms.map(term => (
                                <option key={term.id} value={term.id}>
                                    {term.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="rounded-md bg-green-50 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">{flash.success}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="overflow-x-auto rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Section</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Course</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Term</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Instructor</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Enrollment</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {filteredSections.map((section) => (
                            <tr key={section.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                    <div className="flex items-center">
                                        <BookOpen className="mr-2 h-4 w-4 text-gray-400" />
                                        {section.section_code}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">
                                        {section.course?.title || 'N/A'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {section.course?.course_code || 'N/A'}
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                                        {section.term?.name || 'Not assigned'}
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <User className="mr-2 h-4 w-4 text-gray-400" />
                                        {section.professor_profile?.user?.name || 'Not assigned'}
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {section.number_of_students} / {section.course?.capacity || 'N/A'}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                    <SectionStatusBadge section={section} />
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <div className="flex justify-end space-x-2">
                                        <Link
                                            href={route('sections.show', [userSchool.id, section.id])}
                                            className="rounded p-1 text-gray-500 hover:bg-blue-100 hover:text-blue-600"
                                            title="View details"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </Link>
                                        <Link
                                            href={route('sections.edit', [userSchool.id, section.id])}
                                            className="rounded p-1 text-gray-500 hover:bg-yellow-100 hover:text-yellow-600"
                                            title="Edit section"
                                        >
                                            <Edit className="h-5 w-5" />
                                        </Link>
                                        <Link
                                            href={route('sections.destroy', [userSchool.id, section.id])}
                                            method="delete"
                                            as="button"
                                            className="rounded p-1 text-gray-500 hover:bg-red-100 hover:text-red-600"
                                            title="Delete section"
                                            onClick={(e) => {
                                                if (!confirm('Are you sure you want to delete this section?')) {
                                                    e.preventDefault();
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredSections.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500">
                                    {searchTerm || termFilter
                                        ? 'No sections found matching your search criteria'
                                        : 'No sections found. Create your first section to get started.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
