// resources/js/Pages/Dashboard.jsx
import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;

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
                                1234
                            </p>
                        </div>
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="text-xl font-semibold text-gray-700">
                                Total Schools
                            </h2>
                            <p className="mt-4 text-3xl font-bold text-indigo-600">
                                10
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="text-xl font-semibold text-gray-700">
                                Total Students
                            </h2>
                            <p className="mt-4 text-3xl font-bold text-indigo-600">
                                234
                            </p>
                        </div>
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="text-xl font-semibold text-gray-700">
                                Total Courses
                            </h2>
                            <p className="mt-4 text-3xl font-bold text-indigo-600">
                                45
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
