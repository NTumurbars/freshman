import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronLeft, Users, Calendar, Clock, BookOpen, MapPin, User } from 'lucide-react';

export default function Show({ section, school }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const userSchool = auth.user.school;

    // Format day and time
    const formatSchedule = (schedule) => {
        if (!schedule) return 'Not scheduled';
        return `${schedule.day_of_week}, ${schedule.start_time} - ${schedule.end_time}`;
    };

    // Group features by category
    const groupFeaturesByCategory = (features) => {
        if (!features || features.length === 0) return {};

        return features.reduce((acc, feature) => {
            const category = feature.category || 'Other';
            if (!acc[category]) acc[category] = [];
            acc[category].push(feature);
            return acc;
        }, {});
    };

    const featuresGrouped = groupFeaturesByCategory(section.requiredFeatures);

    return (
        <AppLayout userRole={userRole} school={userSchool}>
            <Head title={`Section: ${section.section_code} - ${section.course?.title || ''}`} />

            <div className="mb-6 space-y-4">
                <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
                    <div>
                        <Link
                            href={route('sections.index', school.id)}
                            className="mb-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Sections
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {section.course?.title || 'Section Details'}
                        </h1>
                        <div className="flex items-center">
                            <span className="mr-2 rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                {section.section_code}
                            </span>
                            <span className="text-gray-600">{section.course?.course_code || ''}</span>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <Link
                            href={route('sections.edit', [school.id, section.id])}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Edit Section
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Section Info */}
                <div className="col-span-2 space-y-6">
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <h2 className="text-lg font-medium text-gray-900">Section Information</h2>
                        </div>
                        <div className="px-6 py-4">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="flex items-center text-sm font-medium text-gray-500">
                                        <BookOpen className="mr-1 h-4 w-4" /> Course
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {section.course?.title || 'N/A'}
                                        <span className="text-xs text-gray-500"> ({section.course?.course_code || 'N/A'})</span>
                                    </dd>
                                </div>

                                <div>
                                    <dt className="flex items-center text-sm font-medium text-gray-500">
                                        <Calendar className="mr-1 h-4 w-4" /> Term
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {section.term?.name || 'Not assigned'}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="flex items-center text-sm font-medium text-gray-500">
                                        <User className="mr-1 h-4 w-4" /> Professor
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {section.professor_profile?.user?.name || 'Not assigned'}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="flex items-center text-sm font-medium text-gray-500">
                                        <Users className="mr-1 h-4 w-4" /> Enrollment
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {section.number_of_students} / {section.course?.capacity || 'N/A'}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="flex items-center text-sm font-medium text-gray-500">
                                        <MapPin className="mr-1 h-4 w-4" /> Room
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {section.schedules && section.schedules[0]?.room
                                            ? `${section.schedules[0].room.room_number} (${section.schedules[0].room.floor?.building?.name || ''})`
                                            : 'Not assigned'}
                                    </dd>
                                </div>

                                <div>
                                    <dt className="flex items-center text-sm font-medium text-gray-500">
                                        <Clock className="mr-1 h-4 w-4" /> Schedule
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {section.schedules && section.schedules.length > 0
                                            ? formatSchedule(section.schedules[0])
                                            : 'Not scheduled'}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Department & Major */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <h2 className="text-lg font-medium text-gray-900">Academic Information</h2>
                        </div>
                        <div className="px-6 py-4">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Department</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {section.course?.department?.name || 'N/A'}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Major</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {section.course?.major?.code ? `${section.course.major.code}` : 'None'}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    {/* Course Description */}
                    {section.course?.description && (
                        <div className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                                <h2 className="text-lg font-medium text-gray-900">Course Description</h2>
                            </div>
                            <div className="px-6 py-4">
                                <p className="text-sm text-gray-700">{section.course.description}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Required Features */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <h2 className="text-lg font-medium text-gray-900">Required Room Features</h2>
                        </div>
                        <div className="px-6 py-4">
                            {Object.keys(featuresGrouped).length > 0 ? (
                                Object.entries(featuresGrouped).map(([category, features]) => (
                                    <div key={category} className="mb-4">
                                        <h3 className="mb-2 text-sm font-medium text-gray-700">{category}</h3>
                                        <ul className="space-y-2">
                                            {features.map(feature => (
                                                <li key={feature.id} className="flex items-center text-sm">
                                                    <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                                                    {feature.name}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-500">No special features required</p>
                            )}
                        </div>
                    </div>

                    {/* Enrolled Students */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4 flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">Enrolled Students</h2>
                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                                {section.courseRegistrations?.length || 0}
                            </span>
                        </div>
                        <div className="px-6 py-4">
                            {section.courseRegistrations && section.courseRegistrations.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {section.courseRegistrations.map(registration => (
                                        <li key={registration.id} className="py-2">
                                            <p className="text-sm font-medium text-gray-900">
                                                {registration.student?.name || 'Unknown Student'}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {registration.student?.email || ''}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500">No students enrolled</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
