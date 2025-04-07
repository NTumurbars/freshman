import { Link } from '@inertiajs/react';
import { BookOpen, Calendar, GraduationCap, ClipboardList, Users, FileBarChart, BarChart3 } from 'lucide-react';

export default function MajorCoordinatorSideBar({ school }) {
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
        <aside className="h-full min-h-screen w-64 border-r border-gray-200 bg-white p-4">
            <div className="mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-lg font-semibold text-gray-800">{school?.name || 'Academic Coordinator'}</h2>
                <p className="text-sm text-gray-500">Major Coordinator</p>
            </div>

            <div className="space-y-6">
                <NavItem href={route('dashboard')} icon={BarChart3}>
                    Dashboard
                </NavItem>

                <NavGroup title="Academic Management">
                    <NavItem href={route('courses.index', school.id)} icon={BookOpen}>
                        Courses
                    </NavItem>
                    <NavItem href={route('sections.index', school.id)} icon={ClipboardList}>
                        Sections
                    </NavItem>
                </NavGroup>

                <NavGroup title="Department">
                    <NavItem href={route('departments.index', school.id)} icon={GraduationCap}>
                        Departments
                    </NavItem>
                    <NavItem href={route('users.index', school.id)} icon={Users}>
                        Faculty
                    </NavItem>
                </NavGroup>

                <NavGroup title="Planning">
                    <NavItem href="#" icon={Calendar}>
                        Academic Calendar
                    </NavItem>
                    <NavItem href="#" icon={FileBarChart}>
                        Reports
                    </NavItem>
                </NavGroup>
            </div>
        </aside>
    );
}
