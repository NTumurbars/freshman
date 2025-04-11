// resources/js/Pages/Dashboard.jsx
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    Building,
    Calendar,
    ChevronRight,
    Clock,
    GraduationCap,
    LayoutList,
    Loader,
    School,
    Users,
    Home,
    ArrowUpRight,
    ArrowDownRight,
    Percent
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Dashboard() {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;

    // Try all possible places where school data might be
    const school = auth.user.school || auth.school || null;
    console.log(
        'Dashboard - School data source:',
        auth.user.school
            ? 'auth.user.school'
            : auth.school
              ? 'auth.school'
              : 'none available',
    );
    console.log('Dashboard - School data:', school);

    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const endpoint =
                    userRole === 1
                        ? route('superuser.stats')
                        : route('school.admin.stats');

                const response = await axios.get(endpoint);
                setStats(response.data);
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [userRole]);

    // Helper function to generate school-specific routes
    const schoolRoute = (name, params = {}) => {
        if (!school?.id) return '#';
        return route(name, { school: school.id, ...params });
    };

    const DashboardCard = ({
        title,
        value,
        icon,
        linkTo,
        color = 'blue',
        subtitle = null,
    }) => {
        const Icon = icon;
        const colors = {
            blue: 'bg-blue-100 text-blue-800',
            green: 'bg-green-100 text-green-800',
            purple: 'bg-purple-100 text-purple-800',
            orange: 'bg-orange-100 text-orange-800',
            red: 'bg-red-100 text-red-800',
        };

        return (
            <div className="overflow-hidden rounded-lg bg-white shadow transition-all hover:shadow-md">
                <Link href={linkTo || '#'}>
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div
                                    className={`rounded-full p-3 ${colors[color]}`}
                                >
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div className="ml-5">
                                    <p className="text-sm font-medium text-gray-500">
                                        {title}
                                    </p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {loading ? (
                                            <Loader className="h-6 w-6 animate-spin text-gray-400" />
                                        ) : (
                                            (value ?? 0)
                                        )}
                                    </p>
                                    {subtitle && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </Link>
            </div>
        );
    };

    const QuickAction = ({
        title,
        description,
        icon,
        href,
        color = 'blue',
    }) => {
        const Icon = icon;
        const colors = {
            blue: {
                gradient: 'from-blue-600 to-indigo-600',
                light: 'from-blue-50 to-indigo-50',
                icon: 'text-blue-600',
            },
            green: {
                gradient: 'from-emerald-600 to-teal-600',
                light: 'from-emerald-50 to-teal-50',
                icon: 'text-emerald-600',
            },
            purple: {
                gradient: 'from-purple-600 to-pink-600',
                light: 'from-purple-50 to-pink-50',
                icon: 'text-purple-600',
            },
            orange: {
                gradient: 'from-orange-600 to-amber-600',
                light: 'from-orange-50 to-amber-50',
                icon: 'text-orange-600',
            },
            indigo: {
                gradient: 'from-indigo-600 to-violet-600',
                light: 'from-indigo-50 to-violet-50',
                icon: 'text-indigo-600',
            },
        };

        return (
            <Link
                href={href}
                className="group relative isolate overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${colors[color].light} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                <div className="relative p-6">
                    <div className="mb-4">
                        <div className={`inline-flex rounded-xl bg-gradient-to-br ${colors[color].light} p-3 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                            <Icon className={`h-7 w-7 ${colors[color].icon}`} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-950">
                            {title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600 group-hover:text-gray-700">
                            {description}
                        </p>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm font-medium">
                        <span className={`${colors[color].icon}`}>Get started</span>
                        <ChevronRight className={`h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 ${colors[color].icon}`} />
                    </div>

                    {/* アクセントライン */}
                    <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${colors[color].gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                </div>
            </Link>
        );
    };

    // Only show school-specific content if we have a school
    const canShowSchoolContent = userRole !== 1 && school?.id;

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="space-y-8 p-8">
                {/* Header */}
                <div className="border-b border-gray-200 pb-5">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {userRole === 1
                            ? 'Global Dashboard'
                            : `${school?.name || 'School'} Dashboard`}
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Welcome back! Here's what's happening in your system.
                    </p>
                </div>

                {/* Main Stats */}
                {userRole === 1 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <DashboardCard
                            title="Total Users"
                            value={stats.users}
                            icon={Users}
                            linkTo={route('users.index')}
                            subtitle="Active users across all schools"
                        />
                        <DashboardCard
                            title="Total Schools"
                            value={stats.schools}
                            icon={School}
                            linkTo={route('schools.index')}
                            color="green"
                            subtitle="Registered institutions"
                        />
                        <DashboardCard
                            title="Active Terms"
                            value={stats.activeTerms}
                            icon={Calendar}
                            color="purple"
                            subtitle="Current academic terms"
                        />
                    </div>
                ) : canShowSchoolContent ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <DashboardCard
                            title="Total Users"
                            value={stats.users}
                            icon={Users}
                            linkTo={route('users.index')}
                            subtitle="Active users in your school"
                        />
                        <DashboardCard
                            title="Departments"
                            value={stats.departments}
                            icon={LayoutList}
                            linkTo={schoolRoute('departments.index')}
                            color="purple"
                            subtitle="Academic departments"
                        />
                        <DashboardCard
                            title="Buildings"
                            value={stats.buildings}
                            icon={Building}
                            linkTo={schoolRoute('buildings.index')}
                            color="orange"
                            subtitle="Campus facilities"
                        />
                        <DashboardCard
                            title="Active Courses"
                            value={stats.activeCourses}
                            icon={BookOpen}
                            linkTo={schoolRoute('courses.index')}
                            color="orange"
                            subtitle="Currently running courses"
                        />
                        <DashboardCard
                            title="Current Term"
                            value={stats.currentTerm?.name || 'None'}
                            icon={Calendar}
                            linkTo={schoolRoute('terms.index')}
                            color="blue"
                            subtitle={
                                stats.currentTerm
                                    ? `${new Date(stats.currentTerm.start_date).toLocaleDateString()} - ${new Date(stats.currentTerm.end_date).toLocaleDateString()}`
                                    : 'No active term'
                            }
                        />
                        <DashboardCard
                            title="Schedule Conflicts"
                            value={stats.scheduleConflicts || 0}
                            icon={AlertCircle}
                            linkTo={schoolRoute('schedules.index')}
                            color="red"
                            subtitle="Requires attention"
                        />
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No School Assigned
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            You need to be assigned to a school to view
                            school-specific information.
                        </p>
                    </div>
                )}

                {/* Room Utilization Section */}
                {canShowSchoolContent && stats.roomStats && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Room Utilization
                            </h2>
                            <Link
                                href={schoolRoute('rooms.index')}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                View all rooms
                            </Link>
                        </div>

                        {/* Overall stats */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <DashboardCard
                                title="Room Utilization"
                                value={`${stats.roomStats.utilizationPercentage}%`}
                                icon={Percent}
                                linkTo={schoolRoute('rooms.index')}
                                color="blue"
                                subtitle="Of all available time slots"
                            />
                            <DashboardCard
                                title="Rooms In Use"
                                value={`${stats.roomStats.roomsUtilizedPercentage}%`}
                                icon={Home}
                                linkTo={schoolRoute('rooms.index')}
                                color="green"
                                subtitle={`${stats.roomStats.roomsWithSchedules} of ${stats.roomStats.totalRooms} rooms`}
                            />
                        </div>

                        {/* Most and Least Utilized Rooms */}
                        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Most Utilized Rooms */}
                            <div className="overflow-hidden rounded-lg bg-white shadow">
                                <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                                    <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
                                        <div className="ml-4 mt-4">
                                            <h3 className="text-base font-semibold leading-6 text-gray-900">
                                                Most Utilized Rooms
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Rooms with highest percentage of time slots in use
                                            </p>
                                        </div>
                                        <div className="ml-4 mt-4 flex-shrink-0">
                                            <ArrowUpRight className="h-5 w-5 text-green-600" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white px-4 py-5 sm:p-6">
                                    <div className="flow-root">
                                        <ul className="-mb-8">
                                            {loading ? (
                                                <div className="flex justify-center py-4">
                                                    <Loader className="h-8 w-8 animate-spin text-blue-500" />
                                                </div>
                                            ) : stats.roomStats.mostUtilizedRooms.length > 0 ? (
                                                stats.roomStats.mostUtilizedRooms.map((room, idx) => (
                                                    <li key={room.id}>
                                                        <div className="relative pb-8">
                                                            {idx !== stats.roomStats.mostUtilizedRooms.length - 1 && (
                                                                <span
                                                                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                                                                    aria-hidden="true"
                                                                />
                                                            )}
                                                            <div className="relative flex space-x-3">
                                                                <div>
                                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-500 ring-8 ring-white">
                                                                        {idx + 1}
                                                                    </span>
                                                                </div>
                                                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-900">
                                                                            <Link
                                                                                href={schoolRoute('rooms.show', { room: room.id })}
                                                                                className="hover:text-blue-600 hover:underline"
                                                                            >
                                                                                {room.name}
                                                                            </Link>
                                                                        </p>
                                                                        <p className="text-sm text-gray-500">
                                                                            Capacity: {room.capacity}
                                                                        </p>
                                                                    </div>
                                                                    <div className="whitespace-nowrap text-right text-sm font-medium">
                                                                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
                                                                            {room.utilization_percentage}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))
                                            ) : (
                                                <div className="py-4 text-center text-sm text-gray-500">
                                                    No room data available
                                                </div>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Most Available Rooms */}
                            <div className="overflow-hidden rounded-lg bg-white shadow">
                                <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                                    <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
                                        <div className="ml-4 mt-4">
                                            <h3 className="text-base font-semibold leading-6 text-gray-900">
                                                Most Available Rooms
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Rooms with highest number of available time slots
                                            </p>
                                        </div>
                                        <div className="ml-4 mt-4 flex-shrink-0">
                                            <ArrowDownRight className="h-5 w-5 text-indigo-600" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white px-4 py-5 sm:p-6">
                                    <div className="flow-root">
                                        <ul className="-mb-8">
                                            {loading ? (
                                                <div className="flex justify-center py-4">
                                                    <Loader className="h-8 w-8 animate-spin text-blue-500" />
                                                </div>
                                            ) : stats.roomStats.mostAvailableRooms.length > 0 ? (
                                                stats.roomStats.mostAvailableRooms.map((room, idx) => (
                                                    <li key={room.id}>
                                                        <div className="relative pb-8">
                                                            {idx !== stats.roomStats.mostAvailableRooms.length - 1 && (
                                                                <span
                                                                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                                                                    aria-hidden="true"
                                                                />
                                                            )}
                                                            <div className="relative flex space-x-3">
                                                                <div>
                                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 ring-8 ring-white">
                                                                        {idx + 1}
                                                                    </span>
                                                                </div>
                                                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-900">
                                                                            <Link
                                                                                href={schoolRoute('rooms.show', { room: room.id })}
                                                                                className="hover:text-blue-600 hover:underline"
                                                                            >
                                                                                {room.name}
                                                                            </Link>
                                                                        </p>
                                                                        <p className="text-sm text-gray-500">
                                                                            Capacity: {room.capacity}
                                                                        </p>
                                                                    </div>
                                                                    <div className="whitespace-nowrap text-right text-sm font-medium">
                                                                        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-sm font-medium text-indigo-800">
                                                                            {room.available_slots} slots
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))
                                            ) : (
                                                <div className="py-4 text-center text-sm text-gray-500">
                                                    No room data available
                                                </div>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                {canShowSchoolContent && (
                    <div className="mt-8">
                        <h2 className="mb-6 text-xl font-semibold text-gray-900">
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <QuickAction
                                title="Add Course"
                                description="Create and configure a new course in your academic catalog"
                                icon={BookOpen}
                                href={schoolRoute('courses.create')}
                                color="blue"
                            />
                            <QuickAction
                                title="Create Section"
                                description="Set up a new class section for course offerings"
                                icon={GraduationCap}
                                href={schoolRoute('sections.create')}
                                color="purple"
                            />
                            <QuickAction
                                title="Schedule Class"
                                description="Manage and organize class schedules and timings"
                                icon={Clock}
                                href={schoolRoute('schedules.create')}
                                color="green"
                            />
                            <QuickAction
                                title="Add Department"
                                description="Create a new academic department structure"
                                icon={School}
                                href={schoolRoute('departments.create')}
                                color="indigo"
                            />
                            <QuickAction
                                title="Add Building"
                                description="Register and configure new campus facilities"
                                icon={Building}
                                href={schoolRoute('buildings.create')}
                                color="orange"
                            />
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
