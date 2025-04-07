import Block from '@/Components/ui/block';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Show({ school_info, flash }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title={school_info.name} />

            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-4xl font-extrabold text-gray-800">
                    {school_info.name}
                </h1>

                <Link
                    href={route('schools.edit', school_info.id)}
                    className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition duration-300 hover:bg-blue-700"
                >
                    Edit School
                </Link>
            </div>
            <p className="mb-6 text-sm text-gray-500">{school_info.email}</p>
            {flash?.success && (
                <div className="mb-4 rounded-lg bg-green-100 p-4 text-green-800">
                    {flash.success}
                </div>
            )}

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-3">
                <Block
                    title="Total Users"
                    children={school_info.users}
                    tagline="Number of users associated with the univeristy."
                />
                <Block
                    title="Total Terms"
                    children={school_info.terms}
                    tagline="Terms so far."
                />
                <Block
                    title="Total Buildings"
                    children={school_info.buildings}
                    tagline="Total number of rooms in the school."
                />
            </div>
        </AppLayout>
    );
}
