import { Link } from '@inertiajs/react';
import { BarChart3, BookOpen, Calendar, Clock, Users } from 'lucide-react';

export default function ProfessorSideBar({ school }) {
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
            <div className="space-y-1">{children}</div>
        </div>
    );

    return (
        <aside className="h-full min-h-screen w-64 overflow-y-auto border-r border-gray-200 bg-white p-4 scrollbar-hide">
            <div className="mb-6 border-b border-gray-100 pb-4">
                <div className="flex items-center space-x-3">
                    {school && school.logo_url ? (
                        <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-white shadow-sm">
                            <img
                                src={school.logo_url}
                                alt={school?.name || 'School Logo'}
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.parentNode.classList.add(
                                        'flex',
                                        'items-center',
                                        'justify-center',
                                        'bg-blue-100',
                                        'text-blue-700',
                                    );
                                    e.target.parentNode.innerHTML = `<span class="font-bold text-lg">${school?.name ? school.name.charAt(0).toUpperCase() : 'P'}</span>`;
                                }}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                            />
                        </div>
                    ) : (
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md border border-blue-200 bg-blue-100 text-blue-700">
                            <span className="text-lg font-bold">
                                {school?.name
                                    ? school.name.charAt(0).toUpperCase()
                                    : 'P'}
                            </span>
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <h2
                            className="truncate text-sm font-semibold leading-tight text-gray-800"
                            title="Professor"
                        >
                            Professor
                        </h2>
                        <p
                            className="truncate text-xs text-gray-500"
                            title={school?.name || 'No School Assigned'}
                        >
                            {school?.name || 'No School Assigned'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <NavItem href={route('dashboard')} icon={BarChart3}>
                    Dashboard
                </NavItem>
                <NavGroup title="Teaching">
                    <NavItem
                        href={schoolRoute('courses.index')}
                        icon={BookOpen}
                    >
                        My Courses
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

                <NavGroup title="Students">
                    <NavItem href="#" icon={Users}>
                        My Students
                    </NavItem>
                </NavGroup>
            </div>
        </aside>
    );
}
