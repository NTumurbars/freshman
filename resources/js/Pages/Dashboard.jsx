// resources/js/Pages/Dashboard.jsx
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Dashboard() {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    const [stats, setStats] = useState([]);
    useEffect(() => {
        const fetchStats = async () => {
            if (userRole === 1) {
                try {
                    const response = await axios.get(route('superuser.stats'));
                    setStats(response.data);
                } catch (error) {
                    console.error('Error fetching superuser stats:', error);
                }
            } else {
                try {
                    const response = await axios.get(
                        route('school.admin.stats'),
                    );
                    setStats(response.data);
                    console.log(response);
                } catch (error) {
                    console.error('Error fetching school admin stats:', error);
                }
            }
        };

        fetchStats();
    }, []);

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Dashboard" />
            <div className="p-6">
                <h1 className="mb-4 text-3xl font-bold">
                    {userRole === 1
                        ? 'Global Dashboard'
                        : `${school?.name || 'School'} Dashboard`}
                </h1>
                {/* Dashboard Metrics */}
                {userRole === 1 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="text-xl font-semibold text-gray-700">
                                Total Users
                            </h2>
                            <p className="mt-4 text-3xl font-bold text-indigo-600">
                                {stats.users}
                            </p>
                        </div>
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="text-xl font-semibold text-gray-700">
                                Total Schools
                            </h2>
                            <p className="mt-4 text-3xl font-bold text-indigo-600">
                                {stats.schools}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
                        <Link href={route('users.index')}>
                            <div className="rounded-lg bg-white p-6 shadow">
                                <h2 className="text-xl font-semibold text-gray-700">
                                    Total Users
                                </h2>
                                <p className="mt-4 text-3xl font-bold text-indigo-600">
                                    {stats.users}
                                </p>
                            </div>
                        </Link>
                        <Link href={route('departments.index', school.id)}>
                            <div className="rounded-lg bg-white p-6 shadow">
                                <h2 className="text-xl font-semibold text-gray-700">
                                    Total Departments
                                </h2>
                                <p className="mt-4 text-3xl font-bold text-indigo-600">
                                    {stats.departments}
                                </p>
                            </div>
                        </Link>
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="text-xl font-semibold text-gray-700">
                                Total Rooms
                            </h2>
                            <p className="mt-4 text-3xl font-bold text-indigo-600">
                                {stats.rooms}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
