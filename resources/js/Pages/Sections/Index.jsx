import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { Badge } from '@tremor/react';
import {
    BookOpen,
    Calendar,
    CalendarPlus,
    Clock,
    Edit,
    Eye,
    Plus,
    Search,
    Trash2,
    User,
    PlusCircle,
    XCircle,
    CheckCircle,
    Info,
    Grid,
    List
} from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import axios from 'axios';

export default function Index({ sections, professorSections, isProfessor, flash, school }) {
    const { auth } = usePage().props;
    const userSchool = auth.user.school;
    const canCreateSection = auth.can?.create_section || false;
    const canUpdateSection = auth.can?.update_section || false;
    const canDeleteSection = auth.can?.delete_section || false;
    const isStudent = auth.user.role.name === 'student';

    const [searchTerm, setSearchTerm] = useState('');
    const [termFilter, setTermFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showOnlyMySections, setShowOnlyMySections] = useState(false);
    const [enrolledSections, setEnrolledSections] = useState([]);
    const [loading, setLoading] = useState(false);

    // Extract unique terms from sections for the term filter.
    const terms = useMemo(() => {
        const uniqueTerms = new Set();
        sections.forEach((section) => {
            if (section.term) uniqueTerms.add(section.term.id);
        });
        return Array.from(uniqueTerms).map(
            (id) => sections.find((s) => s.term?.id === id)?.term,
        );
    }, [sections]);

    // Fetch student enrollments when in student mode
    useEffect(() => {
        if (isStudent) {
            const fetchEnrollments = async () => {
                setLoading(true);
                try {
                    const response = await axios.get(route('api.student.enrollments'));
                    if (response.data.enrollments) {
                        setEnrolledSections(response.data.enrollments.map(e => e.section.id));
                    }
                } catch (error) {
                    console.error('Error fetching enrollments:', error);
                    // Show a more user-friendly error
                    alert('Unable to fetch your course enrollments. Please try again later.');
                } finally {
                    setLoading(false);
                }
            };

            fetchEnrollments();
        }
    }, [isStudent]);

    // Form for section registration
    const { data, setData, post, processing, errors, reset } = useForm({
        section_id: null,
    });

    const handleRegister = (sectionId) => {
        setData('section_id', sectionId);
        post(route('course-registrations.store', { school: school.id }), {
            onSuccess: () => {
                setEnrolledSections([...enrolledSections, sectionId]);
            },
        });
    };

    const handleUnregister = (sectionId) => {
        // Find the registration for this section
        axios.delete(route('course-registrations.drop', {
            school: school.id,
            section: sectionId
        }))
        .then(() => {
            setEnrolledSections(enrolledSections.filter(id => id !== sectionId));
        })
        .catch(error => {
            console.error('Error dropping section:', error);
        });
    };

    // Determine the status of a section.
    const getSectionStatus = (section) => {
        if (!section.term) return 'draft';
        // Handle unlimited seats properly
        if (section.capacity && section.students_count >= section.capacity) {
            return 'full';
        }
        if (section.schedules?.length > 0) return 'scheduled';
        return 'unscheduled';
    };

    // Check if student is enrolled in a section
    const isEnrolled = (sectionId) => {
        return enrolledSections.includes(sectionId);
    };

    // Filter sections based on search term, term, status filters, and professor's sections.
    const filteredSections = useMemo(() => {
        let filtered = sections;

        // If professor is viewing only their sections
        if (isProfessor && showOnlyMySections) {
            filtered = sections.filter(section => section.is_teaching);
        }

        return filtered.filter((section) => {
            // Term filter
            if (termFilter && section.term?.id !== parseInt(termFilter)) {
                return false;
            }

            // Status filter - improved to handle the new open status and unlimited seats
            if (statusFilter) {
                const status = getSectionStatus(section);

                // Handle the 'open' status filter
                if (statusFilter === 'open') {
                    // Consider a section open if it's not full
                    if (section.capacity && section.students_count >= section.capacity) {
                        return false; // it's full, exclude it
                    }
                }
                // Otherwise, match the exact status
                else if (status !== statusFilter) {
                    return false;
                }
            }

            // Search filter
            if (!searchTerm) return true;
            const searchLower = searchTerm.toLowerCase();
            return (
                (section.section_code &&
                    section.section_code.toLowerCase().includes(searchLower)) ||
                (section.course?.title &&
                    section.course.title.toLowerCase().includes(searchLower)) ||
                (section.course?.code &&
                    section.course.code.toLowerCase().includes(searchLower)) ||
                (section.professor_profile?.user?.name &&
                    section.professor_profile.user.name
                        .toLowerCase()
                        .includes(searchLower))
            );
        });
    }, [sections, searchTerm, termFilter, statusFilter, isProfessor, showOnlyMySections]);

    // Helper: Check if two arrays are equal.
    const arraysEqual = (a, b) => {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
        }
        return true;
    };

    // Group schedules by their start and end times and deduce a meeting pattern.
    const groupSchedulesByPattern = (schedules) => {
        if (!Array.isArray(schedules) || !schedules.length) return [];

        const timeGroups = {};
        schedules.forEach((schedule) => {
            const timeKey = `${schedule.start_time}-${schedule.end_time}`;
            if (!timeGroups[timeKey]) timeGroups[timeKey] = [];
            timeGroups[timeKey].push(schedule);
        });

        const result = [];
        Object.values(timeGroups).forEach((group) => {
            // Sort by day order.
            const sortedGroup = [...group].sort((a, b) => {
                const days = [
                    'Sunday',
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                ];
                return (
                    days.indexOf(a.day_of_week) - days.indexOf(b.day_of_week)
                );
            });
            const days = sortedGroup.map((s) => s.day_of_week);
            let patternName = '';

            // Check if a meeting pattern is predefined.
            const firstWithPattern = sortedGroup.find(
                (s) => s.meeting_pattern && s.meeting_pattern !== 'single',
            );
            if (firstWithPattern) {
                switch (firstWithPattern.meeting_pattern) {
                    case 'monday-wednesday-friday':
                        patternName = 'MWF';
                        break;
                    case 'tuesday-thursday':
                        patternName = 'TTh';
                        break;
                    case 'monday-wednesday':
                        patternName = 'MW';
                        break;
                    case 'tuesday-friday':
                        patternName = 'TF';
                        break;
                    case 'weekly':
                        patternName = 'Weekly';
                        break;
                    default:
                        patternName = '';
                }
            } else {
                // Fallback: deduce based on sorted days.
                if (arraysEqual(days, ['Monday', 'Wednesday', 'Friday']))
                    patternName = 'MWF';
                else if (arraysEqual(days, ['Tuesday', 'Thursday']))
                    patternName = 'TTh';
                else if (arraysEqual(days, ['Monday', 'Wednesday']))
                    patternName = 'MW';
                else if (arraysEqual(days, ['Tuesday', 'Friday']))
                    patternName = 'TF';
                else if (
                    arraysEqual(days, [
                        'Monday',
                        'Tuesday',
                        'Wednesday',
                        'Thursday',
                        'Friday',
                    ])
                )
                    patternName = 'Weekly';
            }

            result.push({
                group: sortedGroup,
                pattern:
                    patternName || (days.length > 1 ? days.join('/') : days[0]),
                start_time: sortedGroup[0].start_time,
                end_time: sortedGroup[0].end_time,
                room: sortedGroup[0].room, // Assumes room is consistent across the group.
                location_type: sortedGroup[0].location_type,
                virtual_meeting_url: sortedGroup[0].virtual_meeting_url,
            });
        });
        return result;
    };

    // Display schedule details.
    const ScheduleInfo = ({ schedule }) => {
        const formatTime = (time) => (time ? time.substring(0, 5) : '');
        return (
            <div className="flex items-center text-xs text-gray-500">
                <Clock className="mr-1 h-3 w-3" />
                <span>
                    <strong>{schedule.pattern}</strong>,{' '}
                    {formatTime(schedule.start_time)} -{' '}
                    {formatTime(schedule.end_time)}
                </span>
            </div>
        );
    };

    // Display section status as a badge.
    const SectionStatusBadge = ({ section }) => {
        const badgeProps = { size: 'xs' };

        // Special handling for sections with status explicitly set
        if (section.status === 'canceled' || section.status === 'cancelled') {
            return (
                <Badge color="red" {...badgeProps}>
                    Canceled
                </Badge>
            );
        }

        if (section.status === 'waitlist') {
            return (
                <Badge color="blue" {...badgeProps}>
                    Waitlist
                </Badge>
            );
        }

        // Section capacity check - handle unlimited seats properly
        if (section.capacity && section.students_count >= section.capacity) {
            return (
                <Badge color="red" {...badgeProps}>
                    Full
                </Badge>
            );
        }

        if (section.capacity && section.students_count >= section.capacity * 0.9) {
            return (
                <Badge color="orange" {...badgeProps}>
                    Nearly Full
                </Badge>
            );
        }

        if (section.status === 'active' || section.status === 'open') {
            return (
                <Badge color="green" {...badgeProps}>
                    Open
                </Badge>
            );
        }

        if (!section.schedules || section.schedules.length === 0) {
            return (
                <Badge color="amber" {...badgeProps}>
                    Unscheduled
                </Badge>
            );
        }

        return (
            <Badge color="green" {...badgeProps}>
                Open
            </Badge>
        );
    };

    const CoursesList = ({ sections, enrolledSections, isStudent, handleRegister, handleUnregister, isEnrolled, processing, loading, getSectionStatus, groupSchedulesByPattern }) => {
        const [selectedCategory, setSelectedCategory] = useState('all');
        const [viewMode, setViewMode] = useState('grid');

        // Group courses by department for easier browsing
        const coursesByDepartment = useMemo(() => {
            const grouped = {};
            sections.forEach(section => {
                const deptName = section.course?.department?.name || 'Other';
                if (!grouped[deptName]) {
                    grouped[deptName] = [];
                }
                grouped[deptName].push(section);
            });
            return grouped;
        }, [sections]);

        const departments = useMemo(() => {
            return ['all', ...Object.keys(coursesByDepartment)];
        }, [coursesByDepartment]);

        const filteredSections = useMemo(() => {
            if (selectedCategory === 'all') return sections;
            return sections.filter(section => section.course?.department?.name === selectedCategory);
        }, [sections, selectedCategory]);

        return (
            <div className="bg-white rounded-lg shadow-sm">
                {/* Department tabs navigation */}
                <div className="border-b overflow-x-auto">
                    <div className="flex p-1 min-w-max">
                        {departments.map(dept => (
                            <button
                                key={dept}
                                onClick={() => setSelectedCategory(dept)}
                                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                                    selectedCategory === dept
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {dept === 'all' ? 'All Departments' : dept}
                            </button>
                        ))}
                    </div>
                </div>

                {/* View mode toggle and section count */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="text-sm text-gray-500">
                        <span className="font-medium text-gray-900">{filteredSections.length}</span> courses available
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-1 rounded ${viewMode === 'grid' ? 'bg-gray-100' : ''}`}
                        >
                            <Grid className="h-5 w-5 text-gray-500" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-1 rounded ${viewMode === 'list' ? 'bg-gray-100' : ''}`}
                        >
                            <List className="h-5 w-5 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Sections display */}
                <div className={viewMode === 'grid'
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4"
                    : "divide-y"
                }>
                    {filteredSections.length === 0 ? (
                        <div className="col-span-full p-8 text-center">
                            <BookOpen className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No courses found</h3>
                            <p className="text-gray-500">Try selecting a different department</p>
                        </div>
                    ) : (
                        filteredSections.map((section) => {
                            const schedulePatterns = groupSchedulesByPattern(section.schedules);
                            const isFull = getSectionStatus(section) === 'full';
                            const hasSchedule = schedulePatterns.length > 0;
                            const enrolled = isEnrolled(section.id);

                            return viewMode === 'grid' ? (
                                <div
                                    key={section.id}
                                    className={`border rounded-lg overflow-hidden ${
                                        enrolled ? 'border-green-300 bg-green-50' : 'border-gray-200'
                                    }`}
                                >
                                    <div className="p-4">
                                        <div className="flex justify-between mb-3">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                {section.course?.code}
                                            </span>
                                            <SectionStatusBadge section={section} />
                                        </div>

                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {section.course?.title}
                                        </h3>

                                        <p className="text-xs text-gray-500 mb-3">
                                            Section {section.section_code} • {section.course?.department?.name || 'Unknown Department'}
                                        </p>

                                        <div className="space-y-2 mb-3">
                                            <div className="flex items-center text-sm text-gray-700">
                                                <User className="mr-2 h-4 w-4 text-gray-400" />
                                                {section.professor_profile?.user?.name || 'Instructor TBA'}
                                            </div>

                                            {hasSchedule ? (
                                                <div className="space-y-1">
                                                    {schedulePatterns.map((schedule, idx) => (
                                                        <div key={idx} className="flex items-center text-sm text-gray-700">
                                                            <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                                                            <span>
                                                                <span className="font-medium">{schedule.pattern}</span>, {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-sm text-gray-500 italic">
                                                    Schedule not yet available
                                                </div>
                                            )}

                                            <div className="flex items-center text-sm text-gray-700">
                                                <User className="mr-2 h-4 w-4 text-gray-400" />
                                                {section.students_count || 0} / {section.capacity ? section.capacity : 'Unlimited'} enrolled
                                            </div>
                                        </div>

                                        {isStudent && (
                                            enrolled ? (
                                                <button
                                                    onClick={() => handleUnregister(section.id)}
                                                    disabled={processing || loading}
                                                    className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    <XCircle className="mr-1.5 h-4 w-4" />
                                                    Drop Course
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleRegister(section.id)}
                                                    disabled={processing || loading || isFull}
                                                    className={`w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                                                        isFull
                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            : 'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                                    }`}
                                                >
                                                    {isFull ? (
                                                        <>
                                                            <XCircle className="mr-1.5 h-4 w-4" />
                                                            Course Full
                                                        </>
                                                    ) : (
                                                        <>
                                                            <PlusCircle className="mr-1.5 h-4 w-4" />
                                                            Register
                                                        </>
                                                    )}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            ) : (
                                // List view
                                <div
                                    key={section.id}
                                    className={`p-4 hover:bg-gray-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
                                        enrolled ? 'bg-green-50' : ''
                                    }`}
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                {section.course?.code}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Section {section.section_code}
                                            </span>
                                            <SectionStatusBadge section={section} />
                                        </div>

                                        <h3 className="font-semibold text-gray-900">
                                            {section.course?.title}
                                        </h3>

                                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm">
                                            <div className="flex items-center text-gray-700">
                                                <User className="mr-1 h-4 w-4 text-gray-400" />
                                                {section.professor_profile?.user?.name || 'Instructor TBA'}
                                            </div>

                                            {hasSchedule && (
                                                <div className="flex items-center text-gray-700">
                                                    <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                                                    {schedulePatterns.map((s, i) => (
                                                        <span key={i}>
                                                            {s.pattern}
                                                            {i < schedulePatterns.length - 1 ? ', ' : ''}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center text-gray-700">
                                                <User className="mr-1 h-4 w-4 text-gray-400" />
                                                {section.students_count || 0} / {section.capacity ? section.capacity : 'Unlimited'} enrolled
                                            </div>
                                        </div>
                                    </div>

                                    {isStudent && (
                                        <div className="md:w-48 flex-shrink-0">
                                            {enrolled ? (
                                                <button
                                                    onClick={() => handleUnregister(section.id)}
                                                    disabled={processing || loading}
                                                    className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                >
                                                    <XCircle className="mr-1.5 h-4 w-4" />
                                                    Drop Course
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleRegister(section.id)}
                                                    disabled={processing || loading || isFull}
                                                    className={`w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                                                        isFull
                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            : 'text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                                    }`}
                                                >
                                                    {isFull ? 'Course Full' : 'Register'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    };

    return (
        <AppLayout>
            <Head title="Sections" />

            <div className="p-8">
                <div className="mb-6 flex flex-col justify-between sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isStudent ? "Course Registration" : "Course Sections"}
                        </h1>
                        <p className="mt-1 text-sm text-gray-600">
                            {isStudent
                                ? "Browse and register for available course sections"
                                : "Manage and organize course sections for your school"}
                        </p>
                    </div>

                    {!isStudent && canCreateSection && (
                        <Link
                            href={route('sections.create', { school: school.id })}
                            className="mt-4 flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:mt-0 sm:w-auto"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            New Section
                        </Link>
                    )}
                </div>

                {isStudent ? (
                    // Student course registration view
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500 mb-6">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <Info className="h-5 w-5 text-blue-500" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">Registration Information</h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <p>You can register for courses for the current term. Please consult with your academic advisor before registering.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search and Filtering */}
                        <div className="bg-white rounded-lg shadow-sm p-4 border">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1">
                                    <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                                        Search Courses
                                    </label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <Search className="h-5 w-5 text-gray-400"/>
                                        </div>
                                        <input
                                            id="search"
                                            type="text"
                                            className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            placeholder="Search by course name, code, or instructor"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="w-full md:w-48">
                                    <label htmlFor="term-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                        Term
                                    </label>
                                    <select
                                        id="term-filter"
                                        className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        value={termFilter}
                                        onChange={(e) => setTermFilter(e.target.value)}
                                    >
                                        <option value="">All Terms</option>
                                        {terms.map((term) => (
                                            <option key={term.id} value={term.id}>
                                                {term.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="w-full md:w-48">
                                    <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                                        Availability
                                    </label>
                                    <select
                                        id="status-filter"
                                        className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="">All Courses</option>
                                        <option value="scheduled">With Schedule</option>
                                        <option value="unscheduled">Without Schedule</option>
                                        <option value="full">Full Courses</option>
                                        <option value="open">Open For Registration</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Display courses in an enhanced UI */}
                        <CoursesList
                            sections={filteredSections}
                            enrolledSections={enrolledSections}
                            isStudent={isStudent}
                            handleRegister={handleRegister}
                            handleUnregister={handleUnregister}
                            isEnrolled={isEnrolled}
                            processing={processing}
                            loading={loading}
                            getSectionStatus={getSectionStatus}
                            groupSchedulesByPattern={groupSchedulesByPattern}
                        />
                    </div>
                ) : (
                    // Admin/Faculty view remains the same
                    <>
                        {/* Filters */}
                        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label
                                    htmlFor="search"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Search
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="search"
                                        placeholder="Search sections..."
                                        className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                            {/* ... existing admin filters ... */}
                        </div>

                        {/* Sections Grid */}
                        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {/* ... existing admin section cards ... */}
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

// Component to display professor information.
const ProfessorInfo = ({ section }) => {
    const professorName =
        section.professor_profile?.user?.name || 'Not assigned';
    return (
        <div className="flex items-center text-sm text-gray-500">
            <User className="mr-2 h-4 w-4 text-gray-400" />
            {professorName}
        </div>
    );
};
