// resources/js/Pages/Users/Index.jsx
import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import AppLayout from '@/Layouts/AppLayout';

export default function Index() {
  // Provide a default empty object for filters to avoid undefined errors.
  const { users, schools, roles, filters = {} } = usePage().props;

  const [selectedSchool, setSelectedSchool] = useState(filters.school || '');
  const [selectedRole, setSelectedRole] = useState(filters.role || '');

  const handleFilter = (e) => {
    e.preventDefault();
    Inertia.get(
      route('users.index'),
      { school: selectedSchool, role: selectedRole },
      { preserveState: true, preserveScroll: true }
    );
  };

  return (
    <AppLayout>
      <div>
        <h1 className="text-3xl font-bold mb-4">User Management</h1>

        {/* Filter Form */}
        <form onSubmit={handleFilter} className="mb-6 flex flex-wrap gap-4">
          <div>
            <label htmlFor="school" className="block text-sm font-medium text-gray-700">
              School
            </label>
            <select
              id="school"
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              className="mt-1 block w-64 border-gray-300 rounded-md shadow-sm"
            >
              <option value="">All Schools</option>
              {schools && schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="mt-1 block w-64 border-gray-300 rounded-md shadow-sm"
            >
              <option value="">All Roles</option>
              {roles && roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md">
              Filter
            </button>
   
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md">
              Add User
            </button>
          </div>
        </form>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="px-4 py-2 border">ID</th>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">School</th>
                <th className="px-4 py-2 border">Role</th>
              </tr>
            </thead>
            <tbody>
              {users && users.data && users.data.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{user.id}</td>
                  <td className="px-4 py-2 border">{user.name}</td>
                  <td className="px-4 py-2 border">{user.email}</td>
                  <td className="px-4 py-2 border">
                    {user.school ? (
                      <Link
                        href={route('schools.departments.index', user.school?.id)}
                        className="text-indigo-600 hover:underline"
                      >
                        {user.school?.name}
                      </Link>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td className="px-4 py-2 border">
                    {user.role ? user.role.name : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4">
          {users && users.links && users.links.map((link, index) => (
            <Link
              key={index}
              href={link.url}
              className="px-3 py-1 border rounded mx-1"
              dangerouslySetInnerHTML={{ __html: link.label }}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
