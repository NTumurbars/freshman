import { Link, usePage } from '@inertiajs/react';
import { Building, Users, GraduationCap, BookOpen, FileBarChart, School, BarChart3, Calendar, Clock, ChevronDown, ChevronRight, LayoutGrid, DoorOpen, Warehouse, Hotel, Layers, CalendarDays, LayoutList, PlusCircle, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AdminSideBar({ school }) {
    const [expandedSections, setExpandedSections] = useState({
        campus: false,
        buildings: false,
        academics: false,
        roomFeatures: false
    });

    const [buildings, setBuildings] = useState([]);
    const [loading, setLoading] = useState(false);

    // Helper function to generate school-specific routes
    const schoolRoute = (name, params = {}) => {
        if (!school?.id) return '#';
        return route(name, { school: school.id, ...params });
    };

    // Load buildings data when campus section is expanded
    useEffect(() => {
        if (expandedSections.campus && school?.id && !buildings.length && !loading) {
            setLoading(true);

            // Fetch buildings data from API
            fetch(route('api.buildings.list', { school: school.id }))
                .then(response => response.json())
                .then(data => {
                    setBuildings(data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching buildings:', error);
                    setLoading(false);
                });
        }
    }, [expandedSections.campus, school]);

    const NavItem = ({ href, icon, children, onClick, isActive = false, indent = 0 }) => {
        const Icon = icon;
        return (
            <Link
                href={href}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium
                    ${isActive
                        ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200'
                    }`}
                onClick={onClick}
                style={{ paddingLeft: `${indent * 0.75 + 0.75}rem` }}
            >
                <Icon className="mr-2 h-5 w-5" />
                <span>{children}</span>
            </Link>
        );
    };

    const CollapsibleNavItem = ({
        title,
        icon,
        isExpanded,
        onToggle,
        children,
        href = null,
        indent = 0
    }) => {
        const Icon = icon;

        return (
            <div>
                <div
                    className="flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200"
                    onClick={onToggle}
                    style={{ paddingLeft: `${indent * 0.75 + 0.75}rem` }}
                >
                    <div className="flex items-center">
                        <Icon className="mr-2 h-5 w-5" />
                        <span>{title}</span>
                    </div>
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )}
                </div>
                {isExpanded && href && (
                    <Link
                        href={href}
                        className="block rounded-md px-3 py-2 text-sm font-medium text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200"
                        style={{ paddingLeft: `${(indent + 1) * 0.75 + 0.75}rem` }}
                    >
                        View All {title}
                    </Link>
                )}
                {isExpanded && children}
            </div>
        );
    };

    const NavGroup = ({ title, children }) => (
        <div className="mb-4">
            <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-blue-600">
                {title}
            </h3>
            <div className="space-y-1">
                {children}
            </div>
        </div>
    );

    // If no school is assigned, show limited navigation
    if (!school?.id) {
        return (
            <aside className="h-full min-h-screen w-64 border-r border-blue-100 bg-white p-4 overflow-y-auto scrollbar-hide">
                <div className="mb-6 border-b border-blue-100 pb-4">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 flex items-center justify-center bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 rounded-md flex-shrink-0 border border-blue-200">
                            <span className="font-bold text-lg">S</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-sm font-semibold text-gray-800 truncate leading-tight" title="School Admin">School Admin</h2>
                            <p className="text-xs text-gray-500 truncate" title="No School Assigned">No School Assigned</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <NavItem href={route('dashboard')} icon={BarChart3}>
                        Dashboard
                    </NavItem>
                </div>
            </aside>
        );
    }

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const toggleBuilding = (buildingId) => {
        setExpandedSections(prev => ({
            ...prev,
            [`building_${buildingId}`]: !prev[`building_${buildingId}`]
        }));
    };

    return (
        <aside className="h-full min-h-screen w-64 border-r border-blue-100 bg-white p-4 overflow-y-auto scrollbar-hide">
            <div className="mb-6 border-b border-blue-100 pb-4">
                <div className="flex items-center space-x-3">
                    {school?.logo_url ? (
                        <div className="h-10 w-10 flex-shrink-0 rounded-md overflow-hidden border border-blue-100 bg-white shadow-sm">
                            <img 
                                src={school.logo_url} 
                                alt={school?.name || 'School Logo'}
                                className="h-full w-full object-contain"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.style.display = 'none';
                                    e.target.parentNode.classList.add('flex', 'items-center', 'justify-center', 'bg-gradient-to-br', 'from-blue-100', 'to-indigo-100', 'text-blue-600');
                                    e.target.parentNode.innerHTML = `<span class="font-bold text-lg">${school?.name ? school.name.charAt(0).toUpperCase() : 'S'}</span>`;
                                }}
                                loading="lazy"
                                referrerPolicy="no-referrer"
                                crossOrigin="anonymous"
                            />
                        </div>
                    ) : (
                        <div className="h-10 w-10 flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-md flex-shrink-0 border border-blue-200">
                            <span className="font-bold text-lg">{school?.name ? school.name.charAt(0).toUpperCase() : 'S'}</span>
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold text-gray-800 truncate leading-tight" title={school?.name || 'School Administration'}>
                            {school?.name || 'School Administration'}
                        </h2>
                        <p className="text-xs text-gray-500 truncate" title="School Administrator">School Administrator</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <NavItem href={route('dashboard')} icon={BarChart3}>
                    Dashboard
                </NavItem>

                <NavGroup title="People">
                    <NavItem href={schoolRoute('users.index')} icon={Users}>
                        User Management
                    </NavItem>
                </NavGroup>

                <NavGroup title="School">
                    <NavItem href={schoolRoute('schools.edit')} icon={School}>
                        Your School
                    </NavItem>
                    
                    <NavItem
                        href={schoolRoute('departments.index')}
                        icon={Warehouse}
                    >
                        Departments
                    </NavItem>
                    
                    <NavItem
                        href={schoolRoute('majors.index')}
                        icon={GraduationCap}
                    >
                        Majors
                    </NavItem>
                </NavGroup>

                <NavGroup title="Academics">
                    <CollapsibleNavItem
                        title="Academic Management"
                        icon={BookOpen}
                        isExpanded={expandedSections.academics}
                        onToggle={() => toggleSection('academics')}
                    >
                        <NavItem
                            href={schoolRoute('courses.index')}
                            icon={BookOpen}
                            indent={1}
                        >
                            Courses
                        </NavItem>
                        
                        <NavItem
                            href={schoolRoute('sections.index')}
                            icon={LayoutList}
                            indent={1}
                        >
                            Sections
                        </NavItem>
                        
                        <NavItem
                            href={schoolRoute('schedules.index')}
                            icon={Clock}
                            indent={1}
                        >
                            Class Schedules
                        </NavItem>
                        
                        <NavItem
                            href={schoolRoute('terms.index')}
                            icon={Calendar}
                            indent={1}
                        >
                            Academic Terms
                        </NavItem>
                    </CollapsibleNavItem>
                </NavGroup>

                <NavGroup title="Campus">
                    <CollapsibleNavItem
                        title="Campus Management"
                        icon={Warehouse}
                        isExpanded={expandedSections.campus}
                        onToggle={() => toggleSection('campus')}
                    >
                        <NavItem
                            href={schoolRoute('buildings.index')}
                            icon={Building}
                            indent={1}
                        >
                            Buildings
                        </NavItem>

                        <NavItem
                            href={schoolRoute('rooms.index')}
                            icon={DoorOpen}
                            indent={1}
                        >
                            All Rooms
                        </NavItem>

                        {loading && (
                            <div className="py-2 px-10 text-sm text-gray-500">
                                Loading...
                            </div>
                        )}

                        {!loading && buildings.length > 0 && (
                            <div className="mt-2">
                                {buildings.map(building => (
                                    <CollapsibleNavItem
                                        key={building.id}
                                        title={building.name}
                                        icon={Hotel}
                                        isExpanded={expandedSections[`building_${building.id}`]}
                                        onToggle={() => toggleBuilding(building.id)}
                                        href={schoolRoute('buildings.show', { building: building.id })}
                                        indent={1}
                                    >
                                        <NavItem
                                            href={schoolRoute('buildings.floors.index', { building: building.id })}
                                            icon={Layers}
                                            indent={2}
                                        >
                                            Manage Floors
                                        </NavItem>
                                    </CollapsibleNavItem>
                                ))}
                            </div>
                        )}
                        
                        {!loading && buildings.length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">
                                No buildings found
                            </div>
                        )}
                    </CollapsibleNavItem>
                    
                    <CollapsibleNavItem
                        title="Room Features"
                        icon={Settings}
                        isExpanded={expandedSections.roomFeatures}
                        onToggle={() => toggleSection('roomFeatures')}
                        href={schoolRoute('roomfeatures.index')}
                    >
                        <NavItem
                            href={schoolRoute('roomfeatures.create')}
                            icon={PlusCircle}
                            indent={1}
                        >
                            Add Feature
                        </NavItem>
                    </CollapsibleNavItem>
                </NavGroup>

                <NavGroup title="Reporting">
                    <NavItem href={route('reports.view')} icon={FileBarChart}>
                        School Reports
                    </NavItem>
                </NavGroup>
            </div>
        </aside>
    );
}
