import { Link } from '@inertiajs/react';

export default function AdminSideBar({ school }) {
    return (
        <aside className="min-h-screen border-r border-gray-200 bg-gray-50 p-4">
            <Link
                href={route('dashboard')}
                className="block rounded px-4 py-2 font-medium text-gray-800 hover:bg-gray-200"
            >
                Dashboard
            </Link>
            <Link
                href={route('users.index')}
                className="block rounded px-4 py-2 font-medium text-gray-800 hover:bg-gray-200"
            >
                User Management
            </Link>
            <Link
                href={route('schools.edit', school.id)}
                className="block rounded px-4 py-2 font-medium text-gray-800 hover:bg-gray-200"
            >
                School Management
            </Link>
            <Link
                href="/" //{route('buildings.index', school)}
                className="block rounded px-4 py-2 font-medium text-gray-800 hover:bg-gray-200"
            >
                Buildings
            </Link>
            <Link
                href={route('departments.index', school.id)}
                className="block rounded px-4 py-2 font-medium text-gray-800 hover:bg-gray-200"
            >
                Departments
            </Link>
            <Link
                href={route('courses.index', school.id)}
                className="block rounded px-4 py-2 font-medium text-gray-800 hover:bg-gray-200"
            >
                Courses &amp; Sections
            </Link>
            <Link
                href={'/'}
                className="block rounded px-4 py-2 font-medium text-gray-800 hover:bg-gray-200"
            >
                School Reports
            </Link>
        </aside>
    );
}
