import { Link } from '@inertiajs/react';
import {
    BookOpen,
    Calendar,
    Clock,
    Users,
    BarChart3,
    Briefcase,
    BookMarked,
    User,
    CalendarClock
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ProfessorSideBar({ school }) {
    const [routeIssue, setRouteIssue] = useState(null);

    // Log when component mounts to help diagnose issues
    useEffect(() => {
        console.log('ProfessorSideBar - School data:', school);

        if (!school?.id) {
            console.warn('Missing school ID in ProfessorSideBar');
        }

        // Try to generate the route to see what's happening
        try {
            const calendarUrl = route('sections.calendar', { school: school?.id || 1 });
            console.log('Calendar URL:', calendarUrl);
        } catch (error) {
            console.error('Error generating calendar route:', error);
            setRouteIssue(error.message);
        }
    }, [school]);

    // Helper function to generate school-specific routes
    const schoolRoute = (name, params = {}) => {
        // Ensure we have a school ID
        if (!school?.id) {
            // Try to get school ID from sessionStorage as a fallback
            try {
                const cachedData = sessionStorage.getItem('cachedSchool');
                if (cachedData) {
                    const cachedSchool = JSON.parse(cachedData);
                    if (cachedSchool?.id) {
                        const url = route(name, { school: cachedSchool.id, ...params });
                        console.log(`Generated route ${name} with cached school ID:`, url);
                        return url;
                    }
                }
            } catch (error) {
                console.error(`Error generating route ${name}:`, error);
            }
            console.warn(`Unable to generate route ${name} - No school ID available`);
            return '#';
        }

        // Normal route generation with school ID
        try {
            const url = route(name, { school: school.id, ...params });
            return url;
        } catch (error) {
            console.error(`Error generating route ${name}:`, error);
            return '#';
        }
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

    // Generate calendar URL outside the component
    const calendarUrl = school?.id ?
        `/schools/${school.id}/sections/calendar` :
        '#';

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
                            {school?.id ? ` (ID: ${school.id})` : ' (No School ID)'}
                        </p>
                    </div>
                </div>
            </div>

            {routeIssue && (
                <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
                    Route issue: {routeIssue}
                </div>
            )}

            <div className="space-y-6">
                <NavItem href={route('dashboard')} icon={BarChart3}>
                    Dashboard
                </NavItem>

                <NavGroup title="My Teaching">
                    <NavItem
                        href={schoolRoute('sections.index')}
                        icon={BookMarked}
                    >
                        My Sections
                    </NavItem>
                    <NavItem
                        href={schoolRoute('schedules.index')}
                        icon={Clock}
                    >
                        My Schedule
                    </NavItem>
                    <NavItem
                        href={calendarUrl}
                        icon={CalendarClock}
                    >
                        My Calendar
                    </NavItem>
                </NavGroup>

                <NavGroup title="Students">
                    <NavItem
                        href={schoolRoute('professor.students')}
                        icon={Users}
                    >
                        My Students
                    </NavItem>
                </NavGroup>

                <NavGroup title="Academic Resources">
                    <NavItem
                        href={schoolRoute('terms.index')}
                        icon={Calendar}
                    >
                        Academic Terms
                    </NavItem>
                </NavGroup>

                <NavGroup title="Profile">
                    <NavItem
                        href={route('profile.edit')}
                        icon={User}
                    >
                        Edit Profile
                    </NavItem>
                </NavGroup>
            </div>
        </aside>
    );
}

