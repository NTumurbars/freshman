import NavLink from '@/Components/NavLink';
import { Button } from '@/Components/ui/button';
import { Head } from '@inertiajs/react';

export default function Welcome({ users, schools }) {
    return (
        <>
            <Head title="Welcome" />
            <nav className="flex justify-between space-x-4">
                <div>
                    <p className="m-5 text-2xl font-bold">Uniman</p>
                </div>
                <NavLink className="m-5" href={route('login')}>
                    <Button size="lg">Login</Button>
                </NavLink>
            </nav>
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
                <h1 className="mb-4 text-4xl font-bold text-gray-800">
                    Welcome to the Course Scheduling System
                </h1>
                <p className="mb-6 text-gray-600">
                    Manage courses, instructors, rooms, and more.
                </p>
                <div className="flex justify-between gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="text-xl font-semibold text-gray-700">
                            Total Users
                        </h2>
                        <p className="mt-4 text-3xl font-bold text-indigo-600">
                            {users}
                        </p>
                    </div>
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h2 className="text-xl font-semibold text-gray-700">
                            Total Schools
                        </h2>
                        <p className="mt-4 text-3xl font-bold text-indigo-600">
                            {schools}
                        </p>
                    </div>
                </div>
                <NavLink href={route('login')}>
                    <Button className="m-5" size="lg">
                        Login
                    </Button>
                </NavLink>
            </div>
        </>
    );
}
