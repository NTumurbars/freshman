// resources/js/Layouts/AppLayout.jsx

import React from 'react';
import NavBar from '@/Components/NavBar';

export default function AppLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Top Navigation */}
            <NavBar />

            {/* Main Content */}
            <main className="flex-1 p-4">
                {children}
            </main>

            {/* Footer (optional) */}
            <footer className="bg-white border-t p-4 text-center text-gray-600">
                <p className="text-sm">Course Scheduling System &copy; {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
}
