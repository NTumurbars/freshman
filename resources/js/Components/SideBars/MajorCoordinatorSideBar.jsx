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
                                    e.target.parentNode.innerHTML = `<span class="font-bold text-lg">${school?.name ? school.name.charAt(0).toUpperCase() : 'A'}</span>`;
                                }}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                            />
                        </div>
                    ) : (
                        <div className="h-10 w-10 flex items-center justify-center bg-blue-100 text-blue-700 rounded-md flex-shrink-0 border border-blue-200">
                            <span className="font-bold text-lg">{school?.name ? school.name.charAt(0).toUpperCase() : 'A'}</span>
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold text-gray-800 truncate leading-tight" title={school?.name || 'Academic Coordinator'}>
                            {school?.name || 'Academic Coordinator'}
                        </h2>
                        <p className="text-xs text-gray-500 truncate" title="Major Coordinator">Major Coordinator</p>
                    </div>
                </div>
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
