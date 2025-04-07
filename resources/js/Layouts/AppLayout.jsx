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

    // Debug to see what role we're getting
    console.log('AppLayout userRole:', userRole);
    console.log('Global auth user role:', globalAuth?.user?.role?.id);

    // Convert user role to number if needed
    const roleId = parseInt(userRole || 0, 10);

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
        school: school || globalAuth?.school,
        user: {
            ...globalAuth?.user,
            // If userRole is provided, use it to ensure role_id is available
            role_id: userRole || globalAuth?.user?.role_id
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-gray-100">
            {/* Navbar */}
            <Navbar auth={mergedAuth}>
                <button
                    onClick={toggleSidebar}
                    className="md:hidden p-2 rounded-md text-gray-600"
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
                    `}
                >
                    {roleId === 1 && <SuperUserSideBar />}
                    {roleId === 2 && <AdminSideBar school={school} />}
                    {roleId === 3 && <MajorCoordinatorSideBar school={school} />}
                    {roleId === 4 && <ProfessorSideBar school={school} />}
                    {roleId === 5 && <StudentSideBar school={school} />}

                    {/* Debug info */}
                    <div className="p-4 text-xs text-gray-500">
                        <p>Role ID: {roleId}</p>
                        <p>Has School: {school ? 'Yes' : 'No'}</p>
                    </div>
                </aside>

                {/* Sidebar toggle button (positioned in a fixed container) */}
                <div className="fixed z-50 top-1/2 left-0 transition-transform duration-300 ease-in-out"
                     style={{
                        transform: `translateY(-50%) ${sidebarOpen ? 'translateX(16rem)' : 'translateX(0)'}`
                     }}>
                    <button
                        onClick={toggleSidebar}
                        className="bg-white rounded-full shadow-lg p-2.5 border border-gray-200 hidden md:flex items-center justify-center"
                        style={{ width: '2.5rem', height: '2.5rem' }}
                        aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                        title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
                    >
                        {sidebarOpen ? (
                            <PanelLeftClose className="h-5 w-5 text-gray-600" />
                        ) : (
                            <PanelLeftOpen className="h-5 w-5 text-gray-600" />
                        )}
                    </button>
                </div>

                {/* Overlay for mobile */}
                {sidebarOpen && isMobile && (
                    <div
                        className="fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity md:hidden"
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

            <footer className="border-t border-gray-200 bg-white py-4 text-center text-sm text-gray-600">
                &copy; {new Date().getFullYear()} Course Scheduling System. All
                rights reserved.
            </footer>
        </div>
    );
}
