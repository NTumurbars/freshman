import { Link } from '@inertiajs/react';
import { GraduationCap, BookOpen, Clock, Calendar } from 'lucide-react';

export default function StudentSideBar({ school }) {
    // Helper function to generate school-specific routes
    const schoolRoute = (name, params = {}) => {
        if (!school?.id) return '#';
        return route(name, { school: school.id, ...params });
    };

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
                <h2 className="text-lg font-semibold text-gray-800">Student</h2>
                <p className="text-sm text-gray-500">{school?.name || 'No School Assigned'}</p>
            </div>

            <div className="space-y-6">
                <NavGroup title="Courses">
                    <NavItem href={schoolRoute('courses.index')} icon={BookOpen}>
                        Course Catalog
                    </NavItem>
                    <NavItem href={schoolRoute('schedules.index')} icon={Clock}>
                        My Schedule
                    </NavItem>
                </NavGroup>

                <NavGroup title="Academic Calendar">
                    <NavItem href={schoolRoute('terms.index')} icon={Calendar}>
                        Academic Terms
                    </NavItem>
                </NavGroup>

                <NavGroup title="Program">
                    <NavItem href={schoolRoute('program.index')} icon={GraduationCap}>
                        My Program
                    </NavItem>
                </NavGroup>
            </div>
        </aside>
    );
}
