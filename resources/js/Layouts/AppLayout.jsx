// resources/js/Layouts/AppLayout.jsx
import Navbar from '@/Components/Navbar';
import AdminSideBar from '@/Components/SideBars/AdminSideBar';
import MajorCoordinatorSideBar from '@/Components/SideBars/MajorCoordinatorSideBar';
import ProfessorSideBar from '@/Components/SideBars/ProfessorSideBar';
import StudentSideBar from '@/Components/SideBars/StudentSideBar';
import SuperUserSideBar from '@/Components/SideBars/SuperUserSideBar';
import { useState, useEffect } from 'react';
import { PanelLeftClose, PanelLeftOpen, Menu } from 'lucide-react';
import { usePage } from '@inertiajs/react';

export default function AppLayout({ children, navChildren, school, userRole }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const { auth: globalAuth } = usePage().props;

    // Store school in sessionStorage when available for persistence across pages
    useEffect(() => {
        // If school is provided directly, store it in sessionStorage
        if (school?.id) {
            try {
                sessionStorage.setItem('cachedSchool', JSON.stringify(school));
            } catch (error) {
                console.error('Failed to cache school in session storage:', error);
            }
        }
    }, [school]);

    // Get school from various sources with fallbacks
    const getCachedSchool = () => {
        try {
            const cachedData = sessionStorage.getItem('cachedSchool');
            if (cachedData) {
                return JSON.parse(cachedData);
            }
        } catch (error) {
            console.error('Error retrieving cached school:', error);
        }
        return null;
    };

    // Convert user role to number if needed
    const roleId = parseInt(userRole || globalAuth?.user?.role?.id || 0, 10);

    // Get school info from props, global auth, or session cache
    const schoolData = school || globalAuth?.school || getCachedSchool() || null;
    
    // Handle responsive sidebar
    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            // Only auto-close on mobile
            if (mobile) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(prevState => !prevState);
    };

    // Ensure we have the proper auth data for Navbar
    // If we're in a context where auth data is passed differently (like in Terms/Index),
    // we need to merge it with the global auth data to ensure all required properties are available
    const mergedAuth = {
        ...globalAuth,
        school: schoolData,
        user: {
            ...globalAuth?.user,
            // If userRole is provided, use it to ensure role_id is available
            role_id: roleId
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
            {/* Navbar */}
            <Navbar auth={mergedAuth}>
                <button
                    onClick={toggleSidebar}
                    className="md:hidden p-2 rounded-md text-blue-600 hover:bg-blue-100 transition-colors duration-200"
                    aria-label="Toggle sidebar"
                >
                    <Menu className="h-5 w-5" />
                </button>
                {navChildren}
            </Navbar>

            <div className="flex flex-1 pt-16">
                {/* Sidebar */}
                <aside
                    className={`
                        fixed top-16 left-0 h-[calc(100vh-4rem)]
                        w-64 z-40 bg-white shadow-lg
                        transition-transform duration-300 ease-in-out
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-64'}
                        border-r border-blue-100 overflow-y-auto scrollbar-hide
                    `}
                >
                    {roleId === 1 && <SuperUserSideBar />}
                    {roleId === 2 && <AdminSideBar school={schoolData} />}
                    {roleId === 3 && <MajorCoordinatorSideBar school={schoolData} />}
                    {roleId === 4 && <ProfessorSideBar school={schoolData} />}
                    {roleId === 5 && <StudentSideBar school={schoolData} />}
                </aside>

                {/* Sidebar toggle button (positioned in a fixed container) */}
                <div className="fixed z-50 top-1/2 left-0 transition-transform duration-300 ease-in-out"
                     style={{
                        transform: `translateY(-50%) ${sidebarOpen ? 'translateX(16rem)' : 'translateX(0)'}`
                     }}>
                    <button
                        onClick={toggleSidebar}
                        className="bg-white rounded-full shadow-lg p-2.5 border border-blue-100 hidden md:flex items-center justify-center hover:border-blue-300 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                        style={{ width: '2.5rem', height: '2.5rem' }}
                        aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                        title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                    >
                        {sidebarOpen ? (
                            <PanelLeftClose className="h-5 w-5 text-blue-600" />
                        ) : (
                            <PanelLeftOpen className="h-5 w-5 text-blue-600" />
                        )}
                    </button>
                </div>

                {/* Overlay for mobile */}
                {sidebarOpen && isMobile && (
                    <div
                        className="fixed inset-0 z-30 bg-blue-900 bg-opacity-50 backdrop-blur-sm transition-opacity md:hidden"
                        onClick={toggleSidebar}
                    />
                )}

                {/* Main Content */}
                <main
                    className={`
                        w-full transition-all duration-300 ease-in-out
                        ${sidebarOpen ? 'md:ml-64' : 'md:ml-0'}
                    `}
                >
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>

            <footer className="border-t border-blue-100 bg-white py-4 text-center text-sm text-gray-600 shadow-inner">
                &copy; {new Date().getFullYear()} UniMan. All
                rights reserved.
            </footer>
        </div>
    );
}
