// resources/js/Layouts/AppLayout.jsx
import Navbar from '@/Components/Navbar';
import AdminSideBar from '@/Components/SideBars/AdminSideBar';
import MajorCoordinatorSideBar from '@/Components/SideBars/MajorCoordinatorSideBar';
import ProfessorSideBar from '@/Components/SideBars/ProfessorSideBar';
import StudentSideBar from '@/Components/SideBars/StudentSideBar';
import SuperUserSideBar from '@/Components/SideBars/SuperUserSideBar';
export default function AppLayout({ children, navChildren, school, userRole }) {
    return (
        <div className="flex min-h-screen flex-col bg-gray-100">
            <Navbar>{navChildren}</Navbar>
            <div className="flex flex-1">
                {userRole === 1 && <SuperUserSideBar />}
                {userRole === 2 && <AdminSideBar school={school} />}
                {userRole === 3 && <MajorCoordinatorSideBar school={school} />}
                {userRole === 4 && <ProfessorSideBar school={school} />}
                {userRole === 5 && <StudentSideBar school={school} />}
                <main className="flex-1 p-6">{children}</main>
            </div>
            <footer className="border-t border-gray-200 bg-white py-4 text-center text-sm text-gray-600">
                &copy; {new Date().getFullYear()} Course Scheduling System. All
                rights reserved.
            </footer>
        </div>
    );
}
