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
            blue: 'bg-white text-blue-700 border-blue-200 hover:bg-blue-50 hover:border-blue-300',
            green: 'bg-white text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300',
            purple: 'bg-white text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300',
            orange: 'bg-white text-orange-700 border-orange-200 hover:bg-orange-100 hover:border-orange-300',
            indigo: 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300',
        };

        return (
            <Link
                href={href}
                className={`block rounded-lg border p-5 shadow-sm transition-all hover:shadow-md ${colors[color]}`}
            >
                <div className="flex items-center">
                    <div
                        className={`mr-4 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 p-3`}
                    >
                        <Icon className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold">{title}</p>
                        <p className="mt-1 text-sm opacity-90">{description}</p>
                    </div>
                </div>
            </Link>
        );
    };

    // Only show school-specific content if we have a school
    const canShowSchoolContent = userRole === 2 && school?.id;

    const isMajorCoordinator = userRole === 3 && school?.id;

    const isProfessor = userRole === 4 && school?.id;

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="space-y-8">
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
                            value={stats.activeCourses || 0}
                            icon={BookOpen}
                            linkTo={schoolRoute('courses.index')}
                            color="green"
                            subtitle={
                                stats.currentTerm
                                    ? `Courses for ${stats.currentTerm.name}`
                                    : 'No current term'
                            }
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
                ) : isMajorCoordinator ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
                        <DashboardCard
                            title="Total Professors"
                            value={stats.users}
                            icon={Users}
                            linkTo={route('users.index')}
                            subtitle="Active users in your school"
                        />
                        <DashboardCard
                            title="Total Majors"
                            value={stats.users}
                            icon={Users}
                            linkTo={route('users.index')}
                            subtitle="Active users in your school"
                        />
                        <DashboardCard
                            title="Total Sessions"
                            value={stats.users}
                            icon={Users}
                            linkTo={route('users.index')}
                            subtitle="Active users in your school"
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
                    </div>
                ) : isProfessor ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
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
                    </div>
                ) : null}

                {/* Quick Actions */}
                {canShowSchoolContent && (
                    <div className="mt-8">
                        <h2 className="mb-4 text-lg font-medium text-gray-900">
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <QuickAction
                                title="Add Course"
                                description="Create a new course"
                                icon={BookOpen}
                                href={schoolRoute('courses.create')}
                                color="blue"
                            />

                            <QuickAction
                                title="Create Section"
                                description="Add new class section"
                                icon={GraduationCap}
                                href={schoolRoute('sections.create')}
                                color="purple"
                            />

                            <QuickAction
                                title="Schedule Class"
                                description="Add new class schedule"
                                icon={Clock}
                                href={schoolRoute('schedules.create')}
                                color="green"
                            />

                            <QuickAction
                                title="Add Department"
                                description="Create new department"
                                icon={School}
                                href={schoolRoute('departments.create')}
                                color="indigo"
                            />

                            <QuickAction
                                title="Add Building"
                                description="Register new building"
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
