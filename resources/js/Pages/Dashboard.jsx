// resources/js/Pages/Dashboard.jsx
import React from 'react';
import { usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Dashboard() {
  const { auth } = usePage().props;
  const userRole = auth.user.role.name; // e.g., "Super Admin", "School Admin", etc.
  const school = auth.user.school;

  return (
    <AppLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">
          {userRole === 'Super Admin'
            ? 'Global Dashboard'
            : `${school?.name || 'School'} Dashboard`}
        </h1>
        {/* Dashboard Metrics */}
        {userRole === 'Super Admin' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700">Total Users</h2>
              <p className="mt-4 text-3xl font-bold text-indigo-600">1234</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700">Total Schools</h2>
              <p className="mt-4 text-3xl font-bold text-indigo-600">10</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700">Total Departments</h2>
              <p className="mt-4 text-3xl font-bold text-indigo-600">35</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700">Total Students</h2>
              <p className="mt-4 text-3xl font-bold text-indigo-600">234</p>
            </div>
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700">Total Courses</h2>
              <p className="mt-4 text-3xl font-bold text-indigo-600">45</p>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
