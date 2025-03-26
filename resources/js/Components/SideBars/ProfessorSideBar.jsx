import { Link } from '@inertiajs/react';

export default function ProfessorSideBar({ school }) {
    return (
        <>
            <Link
                href={route('professors.classes.index', school.id)}
                className="block rounded px-4 py-2 font-medium text-gray-800 hover:bg-gray-200"
            >
                My Classes
            </Link>
            <Link
                href={route('professors.students.index', school.id)}
                className="block rounded px-4 py-2 font-medium text-gray-800 hover:bg-gray-200"
            >
                My Students
            </Link>
            <Link
                href={route('professors.schedule.index', school.id)}
                className="block rounded px-4 py-2 font-medium text-gray-800 hover:bg-gray-200"
            >
                My Schedule
            </Link>
        </>
    );
}
