// resources/js/Pages/Dashboard.jsx
import Block from '@/Components/ui/block';
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
                        <Block
                            title="Total Users"
                            children={stats.users}
                            tagline="Number of users"
                        />
                        <Block
                            title="Total Schools"
                            children={stats.schools}
                            tagline="Number of schools"
                        />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
                        <Link href={route('users.index')}>
                            <Block
                                title="Total Users"
                                children={stats.users}
                                tagline="Number of users"
                            />
                        </Link>
                        <Link href={route('departments.index', school.id)}>
                            <Block
                                title="Total Departments"
                                children={stats.departments}
                                tagline="Number of departments"
                            />
                        </Link>
                        <Link href={route('buildings.index', school.id)}>
                            <Block
                                title="Total Buildings"
                                children={stats.buildings}
                                tagline="Number of Buildings"
                            />
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
