// resources/js/Pages/Dashboard.jsx
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    Building,
    Calendar,
    ChevronRight,
    Clock,
    GraduationCap,
    LayoutList,
    Loader,
    School,
    Users,
    Home,
    ArrowUpRight,
    ArrowDownRight,
    Percent,
    User,
    Clipboard,
    BookMarked,
    GraduationCap as GraduationCapIcon,
    CalendarCheck,
    BookCopy,
    CalendarIcon,
    TrendingUp,
    UserCheck,
    Award,
    Layers
} from 'lucide-react';
import { useEffect, useState } from 'react';
import React from 'react';
import { Card, Title, Text } from '@tremor/react';
import ScheduleCalendar from '@/Components/ui/ScheduleCalendar';

export default function Dashboard() {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const isProfessor = auth.user.role.name === 'professor' || auth.user.role.name === 'major_coordinator';
    const isStudent = auth.user.role.name === 'student';

    // Try all possible places where school data might be
    const initialSchool = auth.user.school || auth.school || null;
    console.log(
        'Dashboard - School data source:',
        auth.user.school
            ? 'auth.user.school'
            : auth.school
              ? 'auth.school'
              : 'none available',
    );
    console.log('Dashboard - School data:', initialSchool);

    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [school, setSchool] = useState(initialSchool);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                let endpoint;
                if (userRole === 1) {
                    endpoint = route('superuser.stats');
                } else if (isProfessor) {
                    endpoint = schoolRoute('professor.stats');
                } else if (isStudent) {
                    endpoint = schoolRoute('student.stats');
                } else {
                    endpoint = route('dashboard.admin.stats');
                }

                const response = await axios.get(endpoint);
                console.log('Stats response:', response.data);

                // More detailed logging for debugging
                if (isProfessor) {
                    console.log('Professor stats details:', {
                        endpoint,
                        classes: response.data?.stats?.today_classes?.length || 0,
                        upcomingClasses: response.data?.stats?.upcoming_classes?.length || 0,
                        department: response.data?.stats?.department?.name,
                        currentTerm: response.data?.stats?.current_term?.name
                    });
                }

                setStats(response.data);

                // Update school data if it's returned from the API
                if (response.data.school) {
                    setSchool(response.data.school);

                    // Store in sessionStorage for persistence
                    try {
                        sessionStorage.setItem('cachedSchool', JSON.stringify(response.data.school));
                    } catch (error) {}
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
                // Display more detailed error information
                if (error.response) {
                    console.error('Error response:', error.response.data);
                    console.error('Error status:', error.response.status);
                } else if (error.request) {
                    console.error('No response received:', error.request);
                } else {
                    console.error('Error details:', error.message);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [userRole, isProfessor, isStudent]);

    // Helper function to generate school-specific routes
    const schoolRoute = (name, params = {}) => {
        // Try all possible places where school ID might be
        let schoolId = null;

        // Check in stats first (most reliable source after API call)
        if (stats && stats.school && stats.school.id) {
            schoolId = stats.school.id;
        }
        // Then check auth.user.school
        else if (auth.user.school && auth.user.school.id) {
            schoolId = auth.user.school.id;
        }
        // Then check auth.school
        else if (auth.school && auth.school.id) {
            schoolId = auth.school.id;
        }
        // Finally check the initial school
        else if (school && school.id) {
            schoolId = school.id;
        }

        if (!schoolId) {
            console.error('No school ID found for route:', name);
            return '#';
        }

        return route(name, { school: schoolId, ...params });
    };

    // Transform registrations into schedule format for calendar
    const schedules = isStudent && stats?.stats?.current_courses
        ? stats.stats.current_courses.flatMap(course => {
            // Map all schedules for the course
            return (course.schedules || []).map(schedule => {
                // Create a properly formatted schedule object for the ScheduleCalendar component
                return {
                    ...schedule,
                    section: {
                        id: course.id,
                        section_code: '',
                        delivery_method: 'in-person',
                        course: {
                            id: course.id,
                            code: course.code,
                            title: course.title,
                            credits: course.credits
                        },
                        professor_profile: {
                            user: {
                                name: course.professor?.name || 'Not Assigned'
                            }
                        }
                    },
                    location_type: 'in-person',
                    room: schedule.room ? {
                        ...schedule.room,
                        room_number: schedule.room.name?.split(' ').pop() || 'N/A',
                        floor: {
                            building: schedule.room.building || 'Unknown'
                        }
                    } : null
                };
            });
        })
        : auth.registrations?.flatMap(registration => {
            // Ensure section and schedules exist before transforming
            if (!registration.section || !registration.section.schedules) {
                return [];
            }

            // Map all schedules for the section, not just the first one
            return registration.section.schedules.map(schedule => {
                // Create a properly formatted schedule object for the ScheduleCalendar component
                return {
                    ...schedule,
                    section: registration.section,
                    location_type: registration.section.delivery_method === 'online' ? 'virtual' :
                                registration.section.delivery_method === 'hybrid' ? 'hybrid' : 'in-person',
                    // The room object needs to be properly formatted
                    room: schedule.room ? {
                        ...schedule.room,
                        // Ensure room_number is available for display
                        room_number: schedule.room.room_number || 'N/A',
                        // Ensure floor and building data is correctly structured if available
                        floor: schedule.room.floor ? {
                            ...schedule.room.floor,
                            building: typeof schedule.room.floor.building === 'string'
                                ? schedule.room.floor.building
                                : schedule.room.floor.building?.name || null
                        } : null
                    } : null
                };
            });
        }) || [];

    // Calculate total credits with priority on the stats API
    const totalCredits = stats?.stats?.total_credits || auth.registrations?.reduce((total, reg) => {
        // Ensure section and course exist and have credits before adding
        if (reg.section && reg.section.course && typeof reg.section.course.credits === 'number') {
            return total + reg.section.course.credits;
        }
        return total;
    }, 0) || 0;

    const DashboardCard = ({
        title,
        value,
        icon,
        linkTo,
        color = 'blue',
        subtitle = null,
        trend = null,
    }) => {
        const Icon = icon;
        const colors = {
            blue: 'bg-blue-100 text-blue-800',
            green: 'bg-green-100 text-green-800',
            purple: 'bg-purple-100 text-purple-800',
            orange: 'bg-orange-100 text-orange-800',
            red: 'bg-red-100 text-red-800',
            indigo: 'bg-indigo-100 text-indigo-800',
            teal: 'bg-teal-100 text-teal-800',
        };

        const trendColors = {
            up: 'text-green-600',
            down: 'text-red-600',
            neutral: 'text-gray-600',
        };

        // Helper function to get accent line color
        const getAccentLineColor = (color) => {
            const colorMap = {
                blue: 'from-blue-500 to-white',
                green: 'from-green-500 to-white',
                purple: 'from-purple-500 to-white',
                orange: 'from-orange-500 to-white',
                red: 'from-red-500 to-white',
                indigo: 'from-indigo-500 to-white',
                teal: 'from-teal-500 to-white',
            };
            return colorMap[color] || 'from-blue-500 to-white';
        };

        return (
            <div className="overflow-hidden rounded-lg bg-white shadow hover:shadow-md transition-all">
                <Link href={linkTo || '#'}>
                    <div className="p-5 relative">
                        {/* Accent line at top of card */}
                        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${getAccentLineColor(color)}`}></div>

                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center">
                                <div
                                    className={`rounded-full p-3 ${colors[color]}`}
                                >
                                    <Icon className="h-6 w-6" />
                                </div>
                                <div className="ml-5">
                                    <p className="text-sm font-medium text-gray-500">
                                        {title}
                                    </p>
                                    <div className="flex items-center">
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {loading ? (
                                            <Loader className="h-6 w-6 animate-spin text-gray-400" />
                                        ) : (
                                            (value ?? 0)
                                        )}
                                    </p>
                                        {trend && (
                                            <span className={`ml-2 flex items-center text-sm ${trendColors[trend.direction]}`}>
                                                {trend.direction === 'up' ?
                                                    <TrendingUp className="h-4 w-4 mr-1" /> :
                                                    trend.direction === 'down' ?
                                                        <ArrowDownRight className="h-4 w-4 mr-1" /> :
                                                        null}
                                                {trend.value}
                                            </span>
                                        )}
                                    </div>
                                    {subtitle && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            {subtitle}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </Link>
            </div>
        );
    };

    const QuickAction = ({
        title,
        description,
        icon,
        href,
        color = 'blue',
    }) => {
        const Icon = icon;
        const colors = {
            blue: {
                gradient: 'from-blue-600 to-indigo-600',
                light: 'from-blue-50 to-indigo-50',
                icon: 'text-blue-600',
            },
            green: {
                gradient: 'from-emerald-600 to-teal-600',
                light: 'from-emerald-50 to-teal-50',
                icon: 'text-emerald-600',
            },
            purple: {
                gradient: 'from-purple-600 to-pink-600',
                light: 'from-purple-50 to-pink-50',
                icon: 'text-purple-600',
            },
            orange: {
                gradient: 'from-orange-600 to-amber-600',
                light: 'from-orange-50 to-amber-50',
                icon: 'text-orange-600',
            },
            indigo: {
                gradient: 'from-indigo-600 to-violet-600',
                light: 'from-indigo-50 to-violet-50',
                icon: 'text-indigo-600',
            },
        };

        return (
            <Link
                href={href}
                className="group relative isolate overflow-hidden rounded-2xl bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
                <div className={`absolute inset-0 bg-gradient-to-br ${colors[color].light} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

                <div className="relative p-6">
                    <div className="mb-4">
                        <div className={`inline-flex rounded-xl bg-gradient-to-br ${colors[color].light} p-3 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
                            <Icon className={`h-7 w-7 ${colors[color].icon}`} />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-950">
                            {title}
                        </h3>
                        <p className="mt-2 text-sm text-gray-600 group-hover:text-gray-700">
                            {description}
                        </p>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm font-medium">
                        <span className={`${colors[color].icon}`}>Get started</span>
                        <ChevronRight className={`h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 ${colors[color].icon}`} />
                    </div>

                    {/* アクセントライン */}
                    <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r ${colors[color].gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
                </div>
            </Link>
        );
    };

    // Only show school-specific content if we have a school
    const canShowSchoolContent = userRole !== 1 && school?.id;

    // Professor dashboard - formatted schedule data for calendar
    const professorSchedules = isProfessor ? (
        // Check if stats exist and have the required schedule data
        (stats?.stats?.today_classes || []).concat(stats?.stats?.upcoming_classes || [])
            // Filter out any schedules without day of week information
            .filter(schedule => schedule && schedule.day_of_week)
            // Map them to the format expected by ScheduleCalendar
            .map(schedule => {
                // Determine location type based on data or default to in-person
                let locationType = 'in-person';
                if (schedule.virtual_meeting_url) {
                    locationType = 'virtual';
                }

                // Create the properly formatted schedule object
                return {
                    id: schedule.id,
                    day_of_week: schedule.day_of_week,
                    start_time: schedule.start_time,
                    end_time: schedule.end_time,
                    location_type: locationType,
                    room: schedule.room ? {
                        id: schedule.room_id || 0,
                        name: schedule.room,
                        room_number: schedule.room.split(' ')[0] || '',
                        floor: {
                            building: {
                                name: schedule.room.split(' ').slice(1).join(' ') || 'Campus Building'
                            }
                        }
                    } : null,
                    section: {
                        id: schedule.section_id,
                        section_code: schedule.section_code || '',
                        delivery_method: locationType,
                        professor_profile: {
                            user: {
                                name: auth.user.name
                            }
                        },
                        course: {
                            id: schedule.course_id || 0,
                            code: schedule.course_code || '',
                            title: schedule.course_title || '',
                            credits: schedule.credits || 3
                        }
                    }
                };
            })
    ) : [];

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="space-y-8 p-8">
                {/* Header */}
                <div className="border-b border-gray-200 pb-5">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {userRole === 1
                            ? 'Global Dashboard'
                            : isProfessor
                              ? 'Professor Dashboard'
                              : `${school?.name || 'School'} Dashboard`}
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Welcome back! Here's what's happening in your system.
                    </p>
                </div>

                {/* Main Stats */}
                {userRole === 1 ? (
                    // Super admin stats
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <DashboardCard
                            title="Total Users"
                            value={stats.users}
                            icon={Users}
                            linkTo={route('users.index')}
                            subtitle="Active users across all schools"
                        />
                        <DashboardCard
                            title="Total Schools"
                            value={stats.schools}
                            icon={School}
                            linkTo={route('schools.index')}
                            color="green"
                            subtitle="Registered institutions"
                        />
                        <DashboardCard
                            title="Active Terms"
                            value={stats.activeTerms}
                            icon={Calendar}
                            color="purple"
                            subtitle="Current academic terms"
                        />
                    </div>
                ) : isProfessor ? (
                    // Professor dashboard - completely redesigned
                    <div className="space-y-8">
                        {/* Professor Summary Stats */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm">
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">Teaching Summary</h2>
                                <p className="text-sm text-gray-600">Your current academic statistics</p>
                            </div>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {/* Course Count Card */}
                                <div className="bg-white rounded-lg p-4 shadow-sm flex items-center space-x-4">
                                    <div className="bg-blue-100 rounded-full p-3">
                                        <BookCopy className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Current Courses</p>
                                        <div className="flex items-baseline">
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {loading ? (
                                                    <Loader className="h-6 w-6 animate-spin text-gray-400" />
                                                ) : (
                                                    stats?.stats?.current_term_sections || 0
                                                )}
                                            </p>
                                            <Link href={schoolRoute('sections.index')} className="ml-2 text-xs text-blue-600 hover:text-blue-800">
                                                View →
                                            </Link>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {stats?.stats?.current_term ? `For ${stats?.stats?.current_term.name}` : 'No active term'}
                                        </p>
                                    </div>
                                </div>

                                {/* Total Students Card */}
                                <div className="bg-white rounded-lg p-4 shadow-sm flex items-center space-x-4">
                                    <div className="bg-green-100 rounded-full p-3">
                                        <Users className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Total Students</p>
                                        <div className="flex items-baseline">
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {loading ? (
                                                    <Loader className="h-6 w-6 animate-spin text-gray-400" />
                                                ) : (
                                                    stats?.stats?.current_term_students || 0
                                                )}
                                            </p>
                                            <Link href={schoolRoute('professor.students')} className="ml-2 text-xs text-blue-600 hover:text-blue-800">
                                                View →
                                            </Link>
                                        </div>
                                        <p className="text-xs text-gray-500">Students in your courses</p>
                                    </div>
                                </div>

                                {/* Department Card */}
                                <div className="bg-white rounded-lg p-4 shadow-sm flex items-center space-x-4">
                                    <div className="bg-purple-100 rounded-full p-3">
                                        <Building className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Department</p>
                                        <p className="text-xl font-semibold text-gray-900 truncate max-w-[150px]">
                                            {loading ? (
                                                <Loader className="h-6 w-6 animate-spin text-gray-400" />
                                            ) : (
                                                stats?.stats?.department?.name || 'Not Assigned'
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500">Your academic department</p>
                                    </div>
                                </div>

                                {/* Term Card */}
                                <div className="bg-white rounded-lg p-4 shadow-sm flex items-center space-x-4">
                                    <div className="bg-indigo-100 rounded-full p-3">
                                        <Calendar className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Current Term</p>
                                        <p className="text-xl font-semibold text-gray-900">
                                            {loading ? (
                                                <Loader className="h-6 w-6 animate-spin text-gray-400" />
                                            ) : (
                                                stats?.stats?.current_term?.name || 'N/A'
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500">Active academic term</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Two column layout for schedule and today's classes */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Weekly Schedule Calendar - Spans 2 columns */}
                            <div className="lg:col-span-2">
                                <Card className="overflow-hidden h-full">
                                    <div className="border-b pb-4 mb-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                                                <div>
                                                    <Title>My Teaching Schedule</Title>
                                                    <Text>Your weekly class schedule for {stats?.stats?.current_term?.name || 'this term'}</Text>
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Link
                                                    href={schoolRoute('sections.calendar')}
                                                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md font-medium text-xs text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                >
                                                    View Full Calendar
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border rounded-lg overflow-hidden bg-white">
                                        <div className="h-[500px] w-full overflow-x-auto">
                                            <div className="min-w-[800px] h-full">
                                                <ScheduleCalendar
                                                    schedules={professorSchedules}
                                                    showWeekView={true}
                                                    viewType="default"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Calendar legend with better styling */}
                                    <div className="mt-4 px-4 pb-2 flex flex-wrap gap-4 justify-end">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-400"></div>
                                            <span className="text-xs text-gray-600">In-Person</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-sm bg-green-100 border border-green-400"></div>
                                            <span className="text-xs text-gray-600">Virtual</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-sm bg-purple-100 border border-purple-400"></div>
                                            <span className="text-xs text-gray-600">Hybrid</span>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Today's Classes - Takes 1 column */}
                            <div>
                                <Card className="h-full overflow-hidden">
                                    <div className="border-b pb-4 mb-4">
                                        <div className="flex items-center">
                                            <Clock className="h-5 w-5 text-green-600 mr-2" />
                                            <div>
                                                <Title>Today's Classes</Title>
                                                <Text>Your scheduled classes for today</Text>
                                            </div>
                                        </div>
                                    </div>

                                    {stats?.stats?.today_classes && stats?.stats?.today_classes.length > 0 ? (
                                        <div className="overflow-auto" style={{ maxHeight: '440px' }}>
                                            <ul className="divide-y divide-gray-200">
                                                {stats?.stats?.today_classes.map((schedule) => (
                                                    <li key={schedule.id} className="flex items-center px-4 py-3 hover:bg-gray-50">
                                                        <div className="flex-shrink-0 mr-3">
                                                            <div className="rounded-full bg-blue-100 p-2">
                                                                <Clock className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="text-sm font-medium text-gray-900 truncate">
                                                                {schedule.course_code}: {schedule.course_title}
                                                            </div>
                                                            <div className="flex items-center mt-1">
                                                                <span className="text-xs text-gray-500 inline-flex items-center">
                                                                    <Clock className="mr-1 h-3 w-3 text-gray-400" />
                                                                    {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                                                                </span>
                                                                <span className="mx-2 text-gray-300">|</span>
                                                                <span className="text-xs text-gray-500 inline-flex items-center">
                                                                    <Home className="mr-1 h-3 w-3 text-gray-400" />
                                                                    {schedule.room || 'No Room'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="ml-2">
                                                            <Link
                                                                href={schoolRoute('sections.show', { section: schedule.section_id })}
                                                                className="rounded-md text-xs bg-blue-50 px-2 py-1 text-blue-700 hover:bg-blue-100"
                                                            >
                                                                View
                                                            </Link>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-[400px] text-center p-4">
                                            <CalendarCheck className="h-12 w-12 text-gray-300 mb-2" />
                                            <h3 className="text-sm font-medium text-gray-900">No Classes Today</h3>
                                            <p className="text-xs text-gray-500 max-w-xs mt-1">
                                                You don't have any scheduled classes for today. Enjoy your day!
                                            </p>
                                        </div>
                                    )}
                                </Card>
                            </div>
                        </div>

                        {/* Teaching History and Students by Course - two columns */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Teaching History */}
                            {stats?.stats?.sections_by_term && stats?.stats?.sections_by_term.length > 0 && (
                                <Card className="overflow-hidden">
                                    <div className="border-b pb-4 mb-4">
                                        <div className="flex items-center">
                                            <Layers className="h-5 w-5 text-purple-600 mr-2" />
                                            <div>
                                                <Title>Teaching History</Title>
                                                <Text>Your teaching history by academic term</Text>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        Term
                                                    </th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        Sections
                                                    </th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        Students
                                                    </th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                        Status
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {stats?.stats?.sections_by_term.map((term) => (
                                                    <tr key={term.term_id} className={term.is_current ? "bg-blue-50" : ""}>
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                                                            {term.term_name}
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                                                            {term.section_count}
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                                                            {term.student_count}
                                                        </td>
                                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                                                            {term.is_current ? (
                                                                <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                                                    Current
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                                                                    Past
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            )}

                            {/* Students by Course */}
                            {stats?.stats?.students_by_course && stats?.stats?.students_by_course.length > 0 && (
                                <Card className="overflow-hidden">
                                    <div className="border-b pb-4 mb-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <UserCheck className="h-5 w-5 text-green-600 mr-2" />
                                                <div>
                                                    <Title>Students by Course</Title>
                                                    <Text>Distribution of students across your courses</Text>
                                                </div>
                                            </div>
                                            <Link
                                                href={schoolRoute('professor.students')}
                                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                            >
                                                View all
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
                                        <ul className="divide-y divide-gray-200">
                                            {stats?.stats?.students_by_course.map((course, index) => (
                                                <li key={index} className="flex items-center p-3 hover:bg-gray-50">
                                                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">
                                                        {index + 1}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-sm font-medium text-gray-900 truncate">{course.title}</div>
                                                        <div className="text-xs text-gray-500">{course.code}</div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="inline-flex items-center bg-blue-50 px-2.5 py-0.5 rounded-full text-xs font-medium text-blue-800">
                                                            <Users className="h-3 w-3 mr-1" />
                                                            {course.count}
                                                        </span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </Card>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-900">
                                Quick Actions
                            </h2>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <QuickAction
                                    title="View My Schedule"
                                    description="See your complete teaching schedule for the current term."
                                    icon={Calendar}
                                    href={schoolRoute('sections.calendar')}
                            color="blue"
                                />
                                <QuickAction
                                    title="Manage Students"
                                    description="View and manage student enrollments in your courses."
                            icon={Users}
                                    href={schoolRoute('professor.students')}
                            color="green"
                                />
                                <QuickAction
                                    title="Course Materials"
                                    description="Access and update your course materials and resources."
                                    icon={BookOpen}
                                    href={schoolRoute('sections.index')}
                            color="purple"
                        />
                            </div>
                        </div>
                    </div>
                ) : isStudent ? (
                    // Student stats
                    <div className="space-y-6">
                        {/* Header Stats Section with Background */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm">
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold text-gray-800">Academic Overview</h2>
                                <p className="text-sm text-gray-600">Your current academic statistics</p>
                            </div>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                                {/* Course Count Card */}
                                <div className="bg-white rounded-lg p-4 shadow-sm flex items-center space-x-4">
                                    <div className="bg-blue-100 rounded-full p-3">
                                        <BookOpen className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">My Courses</p>
                                        <div className="flex items-baseline">
                                            <p className="text-2xl font-semibold text-gray-900">
                                                {loading ? (
                                                    <Loader className="h-6 w-6 animate-spin text-gray-400" />
                                                ) : (
                                                    stats?.stats?.registered_courses || 0
                                                )}
                                            </p>
                                            <Link href={schoolRoute('student.course-registration')} className="ml-2 text-xs text-blue-600 hover:text-blue-800">
                                                Manage →
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Current Term Card */}
                                <div className="bg-white rounded-lg p-4 shadow-sm flex items-center space-x-4">
                                    <div className="bg-green-100 rounded-full p-3">
                                        <Calendar className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Current Term</p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {loading ? (
                                                <Loader className="h-6 w-6 animate-spin text-gray-400" />
                                            ) : (
                                                stats?.stats?.current_term?.name || 'N/A'
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Total Credits Card */}
                                <div className="bg-white rounded-lg p-4 shadow-sm flex items-center space-x-4">
                                    <div className="bg-purple-100 rounded-full p-3">
                                        <GraduationCap className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Total Credits</p>
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {loading ? (
                                                <Loader className="h-6 w-6 animate-spin text-gray-400" />
                                            ) : (
                                                totalCredits
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Calendar with improved design */}
                        <Card className="overflow-hidden">
                            <div className="border-b pb-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                                        <div>
                                            <Title>My Weekly Schedule</Title>
                                            <Text>Your current class schedule for {stats?.stats?.current_term?.name || 'this term'}</Text>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Link
                                            href={schoolRoute('student.course-registration')}
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md font-medium text-xs text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Course Registration
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <div className="border rounded-lg overflow-hidden bg-white">
                                <div className="h-[700px] w-full overflow-x-auto">
                                    <div className="min-w-[800px] h-full">
                                        <ScheduleCalendar
                                            schedules={schedules}
                                            showWeekView={true}
                                            viewType="default"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Calendar legend with better styling */}
                            <div className="mt-4 px-4 pb-2 flex flex-wrap gap-4 justify-end">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm bg-blue-100 border border-blue-400"></div>
                                    <span className="text-xs text-gray-600">In-Person</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm bg-green-100 border border-green-400"></div>
                                    <span className="text-xs text-gray-600">Virtual</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-sm bg-purple-100 border border-purple-400"></div>
                                    <span className="text-xs text-gray-600">Hybrid</span>
                                </div>
                            </div>
                        </Card>

                        {/* Course Overview with improved design */}
                        <Card className="overflow-hidden">
                            <div className="border-b pb-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Title>Current Courses</Title>
                                        <Text>Your registered courses for {stats?.stats?.current_term?.name || 'this term'}</Text>
                                    </div>
                                    <div className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-800">
                                        {totalCredits} total credits
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 space-y-4">
                                {stats?.stats?.current_courses?.map((course) => (
                                    <div
                                        key={course.id}
                                        className="p-5 border rounded-lg hover:bg-gray-50 transition-colors duration-150"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {course.code}
                                                    </h3>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                        in-person
                                                    </span>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                        {course.credits} {course.credits === 1 ? 'Credit' : 'Credits'}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-base text-gray-700">
                                                    {course.title}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 mb-2">Instructor</h4>
                                                <div className="flex items-center">
                                                    <User className="h-4 w-4 mr-2 text-gray-400" />
                                                    <p className="text-sm text-gray-700">
                                                        {course.professor?.name || 'Not Assigned'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium text-gray-500 mb-2">Schedule</h4>
                                                <div className="space-y-1">
                                                    {course.schedules?.map((schedule) => (
                                                        <div key={schedule.id} className="flex items-start">
                                                            <Clock className="h-4 w-4 mr-2 text-gray-400 mt-0.5" />
                                                            <p className="text-sm text-gray-700">
                                                                {schedule.day_of_week} {schedule.start_time?.substring(0, 5) || ''} - {schedule.end_time?.substring(0, 5) || ''}
                                                                {schedule.room && <span className="ml-1 text-gray-600">| {schedule.room.name}</span>}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {(!stats?.stats?.current_courses || stats.stats.current_courses.length === 0) && (
                                    <div className="text-center py-12 px-4">
                                        <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                                            <BookCopy className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No courses registered</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                You haven't registered for any courses this term.
                                            </p>
                                            <div className="mt-6">
                                                <Link
                                                    href={schoolRoute('student.course-registration')}
                                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                >
                                                    Register for Courses
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                ) : canShowSchoolContent ? (
                    // School admin stats
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        <DashboardCard
                            title="Total Users"
                            value={stats?.stats?.users}
                            icon={Users}
                            linkTo={route('users.index')}
                            subtitle="Active users in your school"
                        />
                        <DashboardCard
                            title="Departments"
                            value={stats?.stats?.departments}
                            icon={LayoutList}
                            linkTo={schoolRoute('departments.index')}
                            color="purple"
                            subtitle="Academic departments"
                        />
                        <DashboardCard
                            title="Buildings"
                            value={stats?.stats?.buildings}
                            icon={Building}
                            linkTo={schoolRoute('buildings.index')}
                            color="orange"
                            subtitle="Campus facilities"
                        />
                        <DashboardCard
                            title="Active Courses"
                            value={stats?.stats?.activeCourses}
                            icon={BookOpen}
                            linkTo={schoolRoute('courses.index')}
                            color="orange"
                            subtitle="Currently running courses"
                        />
                        <DashboardCard
                            title="Current Term"
                            value={stats?.stats?.currentTerm?.name || 'None'}
                            icon={Calendar}
                            linkTo={schoolRoute('terms.index')}
                            color="blue"
                            subtitle={
                                stats?.stats?.currentTerm
                                    ? `${new Date(stats.stats.currentTerm.start_date).toLocaleDateString()} - ${new Date(stats.stats.currentTerm.end_date).toLocaleDateString()}`
                                    : 'No active term'
                            }
                        />
                        <DashboardCard
                            title="Schedule Conflicts"
                            value={stats?.stats?.scheduleConflicts || 0}
                            icon={AlertCircle}
                            linkTo={schoolRoute('schedules.index')}
                            color="red"
                            subtitle="Requires attention"
                        />
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No School Assigned
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            You need to be assigned to a school to view
                            school-specific information.
                        </p>
                    </div>
                )}

                {/* Room Utilization Section - Only show for admin */}
                {!isStudent && !isProfessor && canShowSchoolContent && stats?.stats?.roomStats && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Room Utilization
                            </h2>
                            <Link
                                href={schoolRoute('rooms.index')}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                View all rooms
                            </Link>
                        </div>

                        {/* Overall stats */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <DashboardCard
                                title="Room Utilization"
                                value={`${stats?.stats?.roomStats?.utilizationPercentage}%`}
                                icon={Percent}
                                linkTo={schoolRoute('rooms.index')}
                                color="blue"
                                subtitle="Of all available time slots"
                            />
                            <DashboardCard
                                title="Rooms In Use"
                                value={`${stats?.stats?.roomStats?.roomsUtilizedPercentage}%`}
                                icon={Home}
                                linkTo={schoolRoute('rooms.index')}
                                color="green"
                                subtitle={`${stats?.stats?.roomStats?.roomsWithSchedules} of ${stats?.stats?.roomStats?.totalRooms} rooms`}
                            />
                        </div>

                        {/* Most and Least Utilized Rooms */}
                        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                            {/* Most Utilized Rooms */}
                            <div className="overflow-hidden rounded-lg bg-white shadow">
                                <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                                    <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
                                        <div className="ml-4 mt-4">
                                            <h3 className="text-base font-semibold leading-6 text-gray-900">
                                                Most Utilized Rooms
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Rooms with highest percentage of time slots in use
                                            </p>
                                        </div>
                                        <div className="ml-4 mt-4 flex-shrink-0">
                                            <ArrowUpRight className="h-5 w-5 text-green-600" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white px-4 py-5 sm:p-6">
                                    <div className="flow-root">
                                        <ul className="-mb-8">
                                            {loading ? (
                                                <div className="flex justify-center py-4">
                                                    <Loader className="h-8 w-8 animate-spin text-blue-500" />
                                                </div>
                                            ) : stats?.stats?.roomStats?.mostUtilizedRooms?.length > 0 ? (
                                                stats.stats.roomStats.mostUtilizedRooms.map((room, idx) => (
                                                    <li key={room.id}>
                                                        <div className="relative pb-8">
                                                            {idx !== stats.stats.roomStats.mostUtilizedRooms.length - 1 && (
                                                                <span
                                                                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                                                                    aria-hidden="true"
                                                                />
                                                            )}
                                                            <div className="relative flex space-x-3">
                                                                <div>
                                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-500 ring-8 ring-white">
                                                                        {idx + 1}
                                                                    </span>
                                                                </div>
                                                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-900">
                                                                            <Link
                                                                                href={schoolRoute('rooms.show', { room: room.id })}
                                                                                className="hover:text-blue-600 hover:underline"
                                                                            >
                                                                                {room.name}
                                                                            </Link>
                                                                        </p>
                                                                        <p className="text-sm text-gray-500">
                                                                            Capacity: {room.capacity}
                                                                        </p>
                                                                    </div>
                                                                    <div className="whitespace-nowrap text-right text-sm font-medium">
                                                                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-medium text-green-800">
                                                                            {room.utilization_percentage}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))
                                            ) : (
                                                <div className="py-4 text-center text-sm text-gray-500">
                                                    No room data available
                                                </div>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Most Available Rooms */}
                            <div className="overflow-hidden rounded-lg bg-white shadow">
                                <div className="border-b border-gray-200 bg-white px-4 py-5 sm:px-6">
                                    <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
                                        <div className="ml-4 mt-4">
                                            <h3 className="text-base font-semibold leading-6 text-gray-900">
                                                Most Available Rooms
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Rooms with highest number of available time slots
                                            </p>
                                        </div>
                                        <div className="ml-4 mt-4 flex-shrink-0">
                                            <ArrowDownRight className="h-5 w-5 text-indigo-600" />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white px-4 py-5 sm:p-6">
                                    <div className="flow-root">
                                        <ul className="-mb-8">
                                            {loading ? (
                                                <div className="flex justify-center py-4">
                                                    <Loader className="h-8 w-8 animate-spin text-blue-500" />
                                                </div>
                                            ) : stats?.stats?.roomStats?.mostAvailableRooms?.length > 0 ? (
                                                stats.stats.roomStats.mostAvailableRooms.map((room, idx) => (
                                                    <li key={room.id}>
                                                        <div className="relative pb-8">
                                                            {idx !== stats.stats.roomStats.mostAvailableRooms.length - 1 && (
                                                                <span
                                                                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                                                                    aria-hidden="true"
                                                                />
                                                            )}
                                                            <div className="relative flex space-x-3">
                                                                <div>
                                                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-500 ring-8 ring-white">
                                                                        {idx + 1}
                                                                    </span>
                                                                </div>
                                                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                                                    <div>
                                                                        <p className="text-sm font-medium text-gray-900">
                                                                            <Link
                                                                                href={schoolRoute('rooms.show', { room: room.id })}
                                                                                className="hover:text-blue-600 hover:underline"
                                                                            >
                                                                                {room.name}
                                                                            </Link>
                                                                        </p>
                                                                        <p className="text-sm text-gray-500">
                                                                            Capacity: {room.capacity}
                                                                        </p>
                                                                    </div>
                                                                    <div className="whitespace-nowrap text-right text-sm font-medium">
                                                                        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-sm font-medium text-indigo-800">
                                                                            {room.available_slots} slots
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))
                                            ) : (
                                                <div className="py-4 text-center text-sm text-gray-500">
                                                    No room data available
                                                </div>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                {!isStudent && !isProfessor && canShowSchoolContent && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Quick Actions
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <QuickAction
                                title="Manage Users"
                                description="Add, edit, or remove users from your school."
                                icon={Users}
                                href={route('users.index')}
                                color="blue"
                            />
                            <QuickAction
                                title="Course Planning"
                                description="Plan and organize courses for upcoming terms."
                                icon={BookOpen}
                                href={schoolRoute('courses.index')}
                                color="green"
                            />
                            <QuickAction
                                title="Manage Schedule"
                                description="View and modify class schedules and room assignments."
                                icon={Calendar}
                                href={schoolRoute('schedules.index')}
                                color="purple"
                            />
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
