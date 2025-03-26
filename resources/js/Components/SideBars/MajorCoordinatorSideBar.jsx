import { Link } from '@inertiajs/react';

export default function MajorCoordinatorSideBar({ school }) {
    return (
        <>
            <Link
                href={route('schools.departments.index', school.id)}
                className="block rounded px-4 py-2 font-medium text-gray-800 hover:bg-gray-200"
            >
                Department Users
            </Link>
            <Link
                href={route('schools.courses.index', school.id)}
                className="block rounded px-4 py-2 font-medium text-gray-800 hover:bg-gray-200"
            >
                Course Management
            </Link>
            <Link
                href={route('schools.schedules.index', school.id)}
                className="block rounded px-4 py-2 font-medium text-gray-800 hover:bg-gray-200"
            >
                Scheduling
            </Link>
        </>
    );
}
