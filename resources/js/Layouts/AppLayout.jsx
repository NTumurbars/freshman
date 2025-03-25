// resources/js/Layouts/AppLayout.jsx
import React from 'react';
import Navbar from '@/Components/Navbar';
import Sidebar from '@/Components/Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-600">
        &copy; {new Date().getFullYear()} Course Scheduling System. All rights reserved.
      </footer>
    </div>
  );
}
