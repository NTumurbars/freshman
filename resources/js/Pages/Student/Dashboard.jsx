import { Card } from "@/Components/ui/card";
import { usePage, Link } from "@inertiajs/react";
import { BookOpen, Calendar, Clock, GraduationCap, Bell, PlusCircle, Search, Grid, Home, CheckCircle, Bookmark, BarChart3, User, Settings, ChevronDown, Info, School, Books } from "lucide-react";
import { useEffect, useState } from "react";
import AppLayout from '@/Layouts/AppLayout';
import { Head } from "@inertiajs/react";
import axios from 'axios';

export default function StudentDashboard() {
    const { auth } = usePage().props;
    const [upcomingClasses, setUpcomingClasses] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [enrolledSections, setEnrolledSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenuItem, setActiveMenuItem] = useState('dashboard');

    useEffect(() => {
        const fetchStudentData = async () => {
            setLoading(true);
            try {
                // Fetch enrolled sections
                const response = await axios.get(route('api.student.enrollments'));
                setEnrolledSections(response.data.enrollments || []);

                // Set upcoming classes from enrolled sections
                if (response.data.enrollments?.length) {
                    const classes = response.data.enrollments
                        .filter(enrollment => enrollment.section.schedules?.length)
                        .map(enrollment => {
                            const schedule = enrollment.section.schedules[0];
                            return {
                                name: enrollment.section.course.title,
                                code: enrollment.section.course.code,
                                time: `${schedule.start_time} - ${schedule.end_time}`,
                                room: schedule.room?.room_number || 'Online',
                                day: schedule.day_of_week,
                            };
                        });

                    setUpcomingClasses(classes);
                }

                // TODO: Fetch notifications in the future
            } catch (error) {
                console.error('Error fetching student data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, []);

    // Custom student sidebar for better navigation experience
    const StudentSidebar = () => (
        <div className="h-full bg-white w-64 border-r flex flex-col">
            <div className="p-5 border-b">
                <h2 className="text-lg font-semibold flex items-center">
                    <School className="h-5 w-5 mr-2" />
                    Student Portal
                </h2>
                <p className="text-sm text-gray-500 mt-1">{auth.user.school.name}</p>
            </div>

            <div className="flex-grow overflow-y-auto p-4">
                <nav className="space-y-1">
                    <Link
                        href={route('student.dashboard')}
                        className={`flex items-center px-3 py-2 rounded-md text-sm ${activeMenuItem === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => setActiveMenuItem('dashboard')}
                    >
                        <Home className="h-4 w-4 mr-3" />
                        Dashboard
                    </Link>
                    <Link
                        href={route('sections.index', { school: auth.user.school.id })}
                        className={`flex items-center px-3 py-2 rounded-md text-sm ${activeMenuItem === 'register' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => setActiveMenuItem('register')}
                    >
                        <PlusCircle className="h-4 w-4 mr-3" />
                        Course Registration
                    </Link>
                    <div
                        className={`flex items-center px-3 py-2 rounded-md text-sm ${activeMenuItem === 'schedule' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => setActiveMenuItem('schedule')}
                    >
                        <Calendar className="h-4 w-4 mr-3" />
                        My Schedule
                    </div>
                    <div
                        className={`flex items-center px-3 py-2 rounded-md text-sm ${activeMenuItem === 'grades' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => setActiveMenuItem('grades')}
                    >
                        <BarChart3 className="h-4 w-4 mr-3" />
                        Grades & Transcripts
                    </div>
                    <div
                        className={`flex items-center px-3 py-2 rounded-md text-sm ${activeMenuItem === 'resources' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => setActiveMenuItem('resources')}
                    >
                        <Books className="h-4 w-4 mr-3" />
                        Resources
                    </div>
                </nav>
            </div>

            <div className="p-4 border-t">
                <Link
                    href={route('profile.show')}
                    className="flex items-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100"
                >
                    <User className="h-4 w-4 mr-3" />
                    Profile
                </Link>
                <div className="flex items-center px-3 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-100">
                    <Settings className="h-4 w-4 mr-3" />
                    Settings
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50">
            <StudentSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top navbar */}
                <header className="bg-white border-b">
                    <div className="px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center">
                            <h1 className="text-lg font-semibold text-gray-900">Student Dashboard</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Bell className="h-5 w-5 text-gray-500 hover:text-gray-700 cursor-pointer" />
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">3</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <span className="font-medium mr-2">{auth.user.name}</span>
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold">
                                    {auth.user.name.charAt(0)}
                                </div>
                                <ChevronDown className="h-4 w-4 ml-1 text-gray-500" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main content */}
                <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <div className="space-y-6">
                        {/* Overview cards */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <Card className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="flex items-center space-x-4">
                                    <div className="rounded-full bg-blue-100 p-3">
                                        <BookOpen className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Enrolled Courses</p>
                                        <h3 className="text-2xl font-bold text-gray-900">{loading ? '...' : enrolledSections.length}</h3>
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="flex items-center space-x-4">
                                    <div className="rounded-full bg-green-100 p-3">
                                        <Clock className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Today's Classes</p>
                                        <h3 className="text-2xl font-bold text-gray-900">
                                            {loading ? '...' : upcomingClasses.filter(c =>
                                                c.day === new Date().toLocaleDateString('en-US', {weekday: 'long'})
                                            ).length}
                                        </h3>
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="flex items-center space-x-4">
                                    <div className="rounded-full bg-purple-100 p-3">
                                        <GraduationCap className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">GPA</p>
                                        <h3 className="text-2xl font-bold text-gray-900">{loading ? '...' : '3.8'}</h3>
                                    </div>
                                </div>
                            </Card>

                            <Card className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="flex items-center space-x-4">
                                    <div className="rounded-full bg-orange-100 p-3">
                                        <Calendar className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Semester Progress</p>
                                        <h3 className="text-2xl font-bold text-gray-900">{loading ? '...' : '65%'}</h3>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Main sections */}
                        <div className="grid gap-6 md:grid-cols-2">
                            <Card className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold">My Courses</h2>
                                    <Link
                                        href={route('sections.index', { school: auth.user.school.id })}
                                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        <PlusCircle className="h-4 w-4 mr-1" />
                                        Register for Courses
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {loading ? (
                                        <p className="text-sm text-gray-500">Loading courses...</p>
                                    ) : enrolledSections.length > 0 ? (
                                        enrolledSections.map((enrollment, index) => (
                                            <div key={index} className="flex items-center justify-between border-b pb-3">
                                                <div className="flex items-start space-x-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-100 text-blue-800 font-medium">
                                                        {enrollment.section.course.code.substring(0, 2)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{enrollment.section.course.title}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {enrollment.section.course.code} - {enrollment.section.section_code}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <div className="text-sm text-gray-500">
                                                        {enrollment.section.professor_profile?.user?.name || 'TBA'}
                                                    </div>
                                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full flex items-center mt-1">
                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                        Enrolled
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 text-center">
                                            <Books className="h-10 w-10 text-gray-300 mb-2" />
                                            <p className="text-gray-500 mb-1">No enrolled courses yet</p>
                                            <p className="text-sm text-gray-400">Register for courses to get started!</p>
                                            <Link
                                                href={route('sections.index', { school: auth.user.school.id })}
                                                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                                            >
                                                Browse Available Courses
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </Card>

                            <Card className="bg-white p-6 rounded-lg shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold">Today's Schedule</h2>
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        View Full Schedule
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {loading ? (
                                        <p className="text-sm text-gray-500">Loading schedule...</p>
                                    ) : upcomingClasses.filter(c => c.day === new Date().toLocaleDateString('en-US', {weekday: 'long'})).length > 0 ? (
                                        upcomingClasses
                                            .filter(c => c.day === new Date().toLocaleDateString('en-US', {weekday: 'long'}))
                                            .map((class_, index) => (
                                                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-medium">
                                                            {class_.code.substring(0, 2)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{class_.name}</p>
                                                            <div className="flex items-center text-xs text-gray-500">
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                {class_.time}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center text-sm bg-white px-3 py-1 rounded border">
                                                        <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                                                        {class_.room}
                                                    </div>
                                                </div>
                                            ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 text-center">
                                            <Calendar className="h-10 w-10 text-gray-300 mb-2" />
                                            <p className="text-gray-500">No classes scheduled for today</p>
                                            <p className="text-sm text-gray-400 mt-1">Enjoy your day off!</p>
                                        </div>
                                    )}
                                </div>

                                {upcomingClasses.length > 0 && upcomingClasses.filter(c => c.day === new Date().toLocaleDateString('en-US', {weekday: 'long'})).length === 0 && (
                                    <div className="mt-4 border-t pt-4">
                                        <h3 className="text-sm font-medium mb-2">Next Class:</h3>
                                        {(() => {
                                            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                                            const today = new Date().getDay();
                                            // Find the next class by day of week
                                            for (let i = 1; i <= 7; i++) {
                                                const nextDay = days[(today + i) % 7];
                                                const nextClass = upcomingClasses.find(c => c.day === nextDay);
                                                if (nextClass) {
                                                    return (
                                                        <div className="flex items-center justify-between bg-gray-50 rounded-md p-3">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-800 font-medium">
                                                                    {nextClass.code.substring(0, 2)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium">{nextClass.name}</p>
                                                                    <div className="flex items-center text-xs text-gray-500">
                                                                        <Calendar className="h-3 w-3 mr-1" />
                                                                        {nextClass.day}, {nextClass.time}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            }
                                            return null;
                                        })()}
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
