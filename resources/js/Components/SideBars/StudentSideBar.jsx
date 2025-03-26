import { Link } from '@inertiajs/react';

export default function StudentSideBar({ school }) {
    return (
        <>
            <Link
                href={route('students.schedule.index', school.id)}
                className="block rounded px-4 py-2 font-medium text-gray-800 hover:bg-gray-200"
            >
                My Schedule
            </Link>
            <Link
                href={route('students.classmates.index', school.id)}
                className="block rounded px-4 py-2 font-medium text-gray-800 hover:bg-gray-200"
            >
                Classmates &amp; Professors
            </Link>
        </>
    );
}
