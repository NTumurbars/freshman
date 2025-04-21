import { Link } from '@inertiajs/react';
import { Building, User, School, BarChart3 } from 'lucide-react';
import { useState } from 'react';

export default function SuperUserSideBar() {
    const NavItem = ({ href, icon, children }) => {
        const Icon = icon;
        return (
            <Link
                href={href}
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
            >
                <Icon className="mr-2 h-5 w-5" />
                <span>{children}</span>
            </Link>
        );
    };

    const NavGroup = ({ title, children }) => (
        <div className="mb-4">
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {title}
            </h3>
            <div className="space-y-1">
                {children}
            </div>
        </div>
    );

    return (
        <aside className="h-full min-h-screen w-64 border-r border-gray-200 bg-white p-4 overflow-y-auto scrollbar-hide">
            <div className="mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-700 rounded-md flex-shrink-0 border border-blue-200">
                        <span className="font-bold text-lg">S</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold text-gray-800 truncate leading-tight" title="System Administration">System Administration</h2>
                        <p className="text-xs text-gray-500 truncate" title="Super Admin">Super Admin</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <NavItem href={route('dashboard')} icon={BarChart3}>
                    Dashboard
                </NavItem>

                <NavGroup title="Schools">
                    <NavItem href={route('schools.index')} icon={School}>
                        Manage Schools
                    </NavItem>
                </NavGroup>

                <NavGroup title="Users">
                    <NavItem href={route('users.index')} icon={User}>
                        All Users
                    </NavItem>
                </NavGroup>
            </div>
        </aside>
    );
}
