import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    GraduationCap,
    User,
    Building,
    Users,
    ClipboardList,
    Clock
} from 'lucide-react';

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
                className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
            >
                <div className="flex items-center">
                    <Icon className="mr-2 h-5 w-5" />
                    <span>{children}</span>
                </div>
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
                    {school && school.logo_url ? (
                        <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden border border-gray-200 bg-white shadow-sm">
                            <img
                                src={school.logo_url}
                                alt={school?.name || 'School Logo'}
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.parentNode.classList.add('flex', 'items-center', 'justify-center', 'bg-blue-100', 'text-blue-700');
                                    e.target.parentNode.innerHTML = `<span class="font-bold text-lg">${school?.name ? school.name.charAt(0).toUpperCase() : 'S'}</span>`;
                                }}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                            />
                        </div>
                    ) : (
                        <div className="h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-700 rounded-md flex-shrink-0 border border-blue-200">
                            <span className="font-bold text-lg">{school?.name ? school.name.charAt(0).toUpperCase() : 'S'}</span>
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold text-gray-800 truncate leading-tight" title="Student">Student</h2>
                        <p className="text-xs text-gray-500 truncate" title={school?.name || 'No School Assigned'}>
                            {school?.name || 'No School Assigned'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <NavGroup title="Dashboard">
                    <NavItem href={route('dashboard')} icon={ClipboardList}>
                        Dashboard
                    </NavItem>
                </NavGroup>

                <NavGroup title="Courses">
                    <NavItem href={`${schoolRoute('courses.index')}?view=student`} icon={BookOpen}>
                        Browse Courses
                    </NavItem>
                    <NavItem href={`${schoolRoute('sections.index')}?view=student`} icon={Clock}>
                        Course Sections
                    </NavItem>
                    <NavItem href={`${schoolRoute('sections.calendar')}?view=student`} icon={Calendar}>
                        Course Calendar
                    </NavItem>
                </NavGroup>

                <NavGroup title="Academic Information">
                    <NavItem href={`${schoolRoute('departments.index')}?view=student`} icon={Building}>
                        Departments
                    </NavItem>
                    <NavItem href={`${schoolRoute('majors.index')}?view=student`} icon={GraduationCap}>
                        Majors
                    </NavItem>
                    <NavItem href={`${schoolRoute('professor-profiles.index')}?view=student`} icon={Users}>
                        Professors
                    </NavItem>
                </NavGroup>

                <NavGroup title="My Schedule">
                    <NavItem href={`${schoolRoute('schedules.index')}?view=student`} icon={Calendar}>
                        My Schedule
                    </NavItem>
                </NavGroup>

                <NavGroup title="Settings">
                    <NavItem href={route('profile.edit')} icon={User}>
                        Profile
                    </NavItem>
                </NavGroup>
            </div>
        </aside>
    );
}
