// resources/js/Components/Sidebar.jsx
import React from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function Sidebar() {
  const { auth } = usePage().props;
  const userRole = auth.user.role.name; 
  const school = auth.user.school;
  console.log("User Role:", userRole);

  return (
    <aside className="bg-gray-50 border-r border-gray-200 min-h-screen p-4">
      <nav className="space-y-2">
        <Link 
          href="/dashboard" 
          className="block px-4 py-2 text-gray-800 font-medium hover:bg-gray-200 rounded"
        >
          Dashboard
        </Link>

        {userRole === 'super_admin' && (
          <>
            <Link 
              href="/users" 
              className="block px-4 py-2 text-gray-800 font-medium hover:bg-gray-200 rounded"
            >
              Manage All Users
            </Link>
            <Link 
              href="/schools" 
              className="block px-4 py-2 text-gray-800 font-medium hover:bg-gray-200 rounded"
            >
              Manage Schools
            </Link>
            <Link 
              href="/reports" 
              className="block px-4 py-2 text-gray-800 font-medium hover:bg-gray-200 rounded"
            >
              Reports
            </Link>
          </>
        )}

        {userRole !== 'super_admin' && school && (
          <>
            {userRole === 'school_admin' && (
              <>
                <Link 
                  href={route('schools.users.index', school.id)} 
                  className="block px-4 py-2 text-gray-800 font-medium hover:bg-gray-200 rounded"
                >
                  School Users
                </Link>
                <Link 
                  href={route('schools.departments.index', school.id)} 
                  className="block px-4 py-2 text-gray-800 font-medium hover:bg-gray-200 rounded"
                >
                  Departments
                </Link>
                <Link 
                  href={route('schools.terms.index', school.id)} 
                  className="block px-4 py-2 text-gray-800 font-medium hover:bg-gray-200 rounded"
                >
                  Terms
                </Link>
                <Link 
                  href={route('schools.courses.index', school.id)} 
                  className="block px-4 py-2 text-gray-800 font-medium hover:bg-gray-200 rounded"
                >
                  Courses &amp; Sections
                </Link>
                <Link 
                  href={route('schools.reports.index', school.id)} 
                  className="block px-4 py-2 text-gray-800 font-medium hover:bg-gray-200 rounded"
                >
                  School Reports
                </Link>
              </>
            )}

            {userRole === 'major_coordinator' && (
              <>
                <Link 
                  href={route('schools.departments.index', school.id)} 
                  className="block px-4 py-2 text-gray-800 font-medium hover:bg-gray-200 rounded"
                >
                  Department Users
                </Link>
                <Link 
                  href={route('schools.courses.index', school.id)} 
                  className="block px-4 py-2 text-gray-800 font-medium hover:bg-gray-200 rounded"
                >
                  Course Management
                </Link>
                <Link 
                  href={route('schools.schedules.index', school.id)} 
                  className="block px-4 py-2 text-gray-800 font-medium hover:bg-gray-200 rounded"
                >
                  Scheduling
                </Link>
              </>
            )}

            {userRole === 'Professor' && (
              <>
                <Link 
                  href={route('professors.classes.index', school.id)} 
                  className="block px-4 py-2 text-gray-800 font-medium hover:bg-gray-200 rounded"
                >
                  My Classes
                </Link>
                <Link 
                  href={route('professors.students.index', school.id)} 
                  className="block px-4 py-2 text-gray-800 font-medium hover:bg-gray-200 rounded"
                >
                  My Students
                </Link>
                <Link 
                  href={route('professors.schedule.index', school.id)} 
                  className="block px-4 py-2 text-gray-800 font-medium hover:bg-gray-200 rounded"
                >
                  My Schedule
                </Link>
              </>
            )}

            {userRole === 'Student' && (
              <>
                <Link 
                  href={route('students.schedule.index', school.id)} 
                  className="block px-4 py-2 text-gray-800 font-medium hover:bg-gray-200 rounded"
                >
                  My Schedule
                </Link>
                <Link 
                  href={route('students.classmates.index', school.id)} 
                  className="block px-4 py-2 text-gray-800 font-medium hover:bg-gray-200 rounded"
                >
                  Classmates &amp; Professors
                </Link>
              </>
            )}
          </>
        )}
      </nav>
    </aside>
  );
}
