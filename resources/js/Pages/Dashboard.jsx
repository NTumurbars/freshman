// resources/js/Pages/Dashboard.jsx
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Building,
    Users,
    BookOpen,
    School,
    Loader,
    Calendar,
    Clock,
    GraduationCap,
    ChevronRight,
    AlertCircle
} from 'lucide-react';

export default function Dashboard() {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const endpoint = userRole === 1
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

    const DashboardCard = ({ title, value, icon, linkTo, color = "blue", subtitle = null }) => {
        const Icon = icon;
        const colors = {
            blue: "bg-blue-100 text-blue-800",
            green: "bg-green-100 text-green-800",
            purple: "bg-purple-100 text-purple-800",
            orange: "bg-orange-100 text-orange-800",
            red: "bg-red-100 text-red-800",
        };

        return (
            <div className="overflow-hidden rounded-lg bg-white shadow transition-all hover:shadow-md">
                <Link href={linkTo || "#"}>
                    <div className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className={`rounded-full p-3 ${colors[color]}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div className="ml-5">
                                    <p className="text-sm font-medium text-gray-500">{title}</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {loading ? (
                                            <Loader className="h-6 w-6 animate-spin text-gray-400" />
                                        ) : (
                                            value ?? 0
                                        )}
                                    </p>
                                    {subtitle && (
                                        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
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

    const QuickAction = ({ title, description, icon, href, color = "blue" }) => {
        const Icon = icon;
        const colors = {
            blue: "bg-blue-50 text-blue-700 hover:bg-blue-100",
            green: "bg-green-50 text-green-700 hover:bg-green-100",
            purple: "bg-purple-50 text-purple-700 hover:bg-purple-100",
            orange: "bg-orange-50 text-orange-700 hover:bg-orange-100",
        };

        return (
            <Link
                href={href}
                className={`block rounded-lg p-4 transition-colors ${colors[color]}`}
            >
                <div className="flex items-center">
                    <Icon className="h-6 w-6 mr-3" />
                    <div>
                        <p className="font-medium">{title}</p>
                        <p className="mt-1 text-sm opacity-90">{description}</p>
                    </div>
                </div>
            </Link>
        );
    };

    // Only show school-specific content if we have a school
    const canShowSchoolContent = userRole !== 1 && school?.id;

    return (
        <AppLayout userRole={userRole} school={school}>
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
                            icon={School}
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
                            color="green"
                            subtitle="Courses this term"
                        />
                        <DashboardCard
                            title="Current Term"
                            value={stats.currentTerm?.name || 'None'}
                            icon={Calendar}
                            linkTo={schoolRoute('terms.index')}
                            color="blue"
                            subtitle={stats.currentTerm ? `Ends ${new Date(stats.currentTerm.end_date).toLocaleDateString()}` : 'No active term'}
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
                    <div className="text-center py-12">
                        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No School Assigned</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            You need to be assigned to a school to view school-specific information.
                        </p>
                    </div>
                )}

                {/* Quick Actions */}
                {canShowSchoolContent && (
                    <div className="mt-8">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <QuickAction
                                title="Add Course"
                                description="Create a new course"
                                icon={BookOpen}
                                href={schoolRoute('courses.create')}
                                color="blue"
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
                                icon={GraduationCap}
                                href={schoolRoute('departments.create')}
                                color="purple"
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
