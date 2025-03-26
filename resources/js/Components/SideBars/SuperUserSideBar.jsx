import { Link } from '@inertiajs/react';
import { useState } from 'react';

export default function SuperUserSideBar() {
    const [clicked, setClicked] = useState(0);
    return (
        <aside className="min-h-screen border-r border-gray-200 bg-gray-50 p-4">
            <nav className="space-y-2">
                <Link
                    href="/dashboard"
                    className="block rounded px-4 py-2 font-medium text-gray-800 hover:bg-gray-200"
                >
                    Dashboard
                </Link>
                <Link
                    href="/schools"
                    className="block rounded px-4 py-2 font-medium text-gray-800 hover:bg-gray-200"
                >
                    Manage Schools
                </Link>
                <Link
                    href="/reports"
                    className="block rounded px-4 py-2 font-medium text-gray-800 hover:bg-gray-200"
                >
                    Reports
                </Link>
            </nav>
        </aside>
    );
}
