import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    BookOpen,
    ChevronLeft,
    Clock,
    GraduationCap,
    Info,
    Plus,
    Users,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Create({
    courses,
    terms,
    professorProfiles,
    roomFeatures,
    rooms,
    school,
    statuses,
    deliveryMethods,
    meetingPatterns: meetingPatternOptions,
    locationTypes: locationTypeOptions,
    activeTerm,
}) {
    // State for active tab
    const [activeTab, setActiveTab] = useState('basic-info');

    // Form state
    const { data, setData, post, processing, errors } = useForm({
        course_id: '',
        term_id: activeTerm?.id || '',
        professor_profile_id: '',
        section_code: '',
        status: 'active',
        delivery_method: 'in-person',
        notes: '',
        required_features: [],
        schedules: [],
        students_count: 0,
    });

    // Set the active term when the component mounts
    useEffect(() => {
        if (activeTerm) {
            setData('term_id', activeTerm.id);
        }
    }, [activeTerm]);

    // State for new schedule
    const [newSchedule, setNewSchedule] = useState({
        room_id: '',
        day_of_week: 'Monday',
        start_time: '09:00:00',
        end_time: '10:00:00',
        meeting_pattern: 'single',
        location_type: 'in-person',
        virtual_meeting_url: '',
    });

    // Helper constants for location types
    const locationTypes = {
        'in-person': 'In Person',
        virtual: 'Virtual',
        hybrid: 'Hybrid',
    };

    // Helper constants for meeting patterns
    const meetingPatternMap = {
        single: 'Single Meeting',
        'monday-wednesday-friday': 'Monday/Wednesday/Friday',
        'tuesday-thursday': 'Tuesday/Thursday',
        'monday-wednesday': 'Monday/Wednesday',
        'tuesday-friday': 'Tuesday/Friday',
        weekly: 'Weekly (Mon-Fri)',
    };

    // Function to add a new schedule
    const addSchedule = () => {
        // Basic validation
        if (
            (newSchedule.location_type === 'in-person' ||
                newSchedule.location_type === 'hybrid') &&
            !newSchedule.room_id
        ) {
            alert('Please select a room for in-person or hybrid classes');
            return;
        }

        if (
            (newSchedule.location_type === 'virtual' ||
                newSchedule.location_type === 'hybrid') &&
            !newSchedule.virtual_meeting_url
        ) {
            alert(
                'Please enter a virtual meeting URL for virtual or hybrid classes',
            );
            return;
        }

        // Time validation
        if (newSchedule.start_time >= newSchedule.end_time) {
            alert('End time must be after start time');
            return;
        }

        // Normalize location_type (ensure it uses hyphens, not underscores)
        let normalizedSchedule = { ...newSchedule };
        if (normalizedSchedule.location_type === 'in_person') {
            normalizedSchedule.location_type = 'in-person';
            console.log('Normalized location_type from in_person to in-person');
        }

        // Create schedules based on meeting pattern
        let schedulesToAdd = [];

        if (normalizedSchedule.meeting_pattern === 'single') {
            schedulesToAdd = [{ ...normalizedSchedule }];
        } else {
            // Get days for the selected pattern
            const days = getDaysFromPattern(normalizedSchedule.meeting_pattern);

            // Create a schedule for each day with the same details
            schedulesToAdd = days.map((day) => ({
                ...normalizedSchedule,
                day_of_week: day,
                meeting_pattern: 'single', // Each individual day is stored as single
            }));
        }

        // Log for debugging
        console.log('Adding schedules:', schedulesToAdd);
        console.log('Location type:', schedulesToAdd[0]?.location_type);

        // Add the new schedules to the existing ones
        setData('schedules', [...data.schedules, ...schedulesToAdd]);

        // Reset the form
        setNewSchedule({
            room_id: '',
            day_of_week: 'Monday',
            start_time: '09:00:00',
            end_time: '10:00:00',
            meeting_pattern: 'single',
            location_type: 'in-person',
            virtual_meeting_url: '',
        });
    };

    // Helper function to get days of week from meeting pattern
    const getDaysFromPattern = (pattern) => {
        const patternMap = {
            'monday-wednesday-friday': ['Monday', 'Wednesday', 'Friday'],
            'tuesday-thursday': ['Tuesday', 'Thursday'],
            'monday-wednesday': ['Monday', 'Wednesday'],
            'tuesday-friday': ['Tuesday', 'Friday'],
            weekly: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            single: [newSchedule.day_of_week],
        };

        return patternMap[pattern] || [newSchedule.day_of_week];
    };

    // Function to remove a schedule
    const removeSchedule = (index) => {
        const updatedSchedules = [...data.schedules];
        updatedSchedules.splice(index, 1);
        setData('schedules', updatedSchedules);
    };

    // Function to handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('sections.store', school.id));
    };

    // Function to toggle a room feature
    const toggleFeature = (featureId) => {
        const features = [...data.required_features];
        const index = features.indexOf(featureId);

        if (index === -1) {
            features.push(featureId);
        } else {
            features.splice(index, 1);
        }

        setData('required_features', features);
    };

    // Function to navigate to tabs
    const switchTab = (tab) => {
        setActiveTab(tab);
    };

    return (
        <AppLayout>
            <Head title="Create Section" />

            <div className="mb-6 space-y-4">
                <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
                    <div>
                        <Link
                            href={route('sections.index', school.id)}
                            className="mb-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" /> Back to
                            Sections
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Create New Section
                        </h1>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow-md">
                {/* Header with gradient background */}
                <div className="flex items-center bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                    <GraduationCap className="mr-3 h-8 w-8 text-white" />
                    <h1 className="text-xl font-bold text-white">
                        Create New Class Section
                    </h1>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 bg-gray-50">
                    <nav className="-mb-px flex px-4">
                        <button
                            onClick={() => switchTab('basic-info')}
                            className={`border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
                                activeTab === 'basic-info'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            <div className="flex items-center">
                                <BookOpen className="mr-2 h-4 w-4" />
                                <span>1. Basic Information</span>
                            </div>
                        </button>
                        <button
                            onClick={() => switchTab('instructor')}
                            className={`border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
                                activeTab === 'instructor'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            <div className="flex items-center">
                                <Users className="mr-2 h-4 w-4" />
                                <span>2. Instructor</span>
                            </div>
                        </button>
                        <button
                            onClick={() => switchTab('requirements')}
                            className={`border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
                                activeTab === 'requirements'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            <div className="flex items-center">
                                <Info className="mr-2 h-4 w-4" />
                                <span>3. Requirements</span>
                            </div>
                        </button>
                        <button
                            onClick={() => switchTab('schedule')}
                            className={`border-b-2 px-6 py-4 text-sm font-medium transition-colors ${
                                activeTab === 'schedule'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            }`}
                        >
                            <div className="flex items-center">
                                <Clock className="mr-2 h-4 w-4" />
                                <span>4. Schedule</span>
                            </div>
                        </button>
                    </nav>
                </div>

                <form onSubmit={handleSubmit} className="p-0">
                    {/* Basic Info Tab */}
                    <div
                        className={`p-6 ${activeTab !== 'basic-info' ? 'hidden' : ''}`}
                    >
                        <div className="space-y-6">
                            <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
                                <h2 className="mb-2 font-medium text-purple-800">
                                    Basic Section Information
                                </h2>
                                <p className="text-sm text-purple-700">
                                    Enter the fundamental details about this
                                    class section
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="course_id"
                                        className="mb-1 block text-sm font-medium text-gray-700"
                                    >
                                        Course{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="course_id"
                                        value={data.course_id}
                                        onChange={(e) =>
                                            setData('course_id', e.target.value)
                                        }
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                    >
                                        <option value="">
                                            Select a course
                                        </option>
                                        {courses &&
                                            courses.map((course) => (
                                                <option
                                                    key={course.id}
                                                    value={course.id}
                                                >
                                                    {course.code} -{' '}
                                                    {course.title}
                                                </option>
                                            ))}
                                    </select>
                                    {errors.course_id && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.course_id}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="term_id"
                                        className="mb-1 block text-sm font-medium text-gray-700"
                                    >
                                        Term{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="term_id"
                                        value={data.term_id}
                                        onChange={(e) =>
                                            setData('term_id', e.target.value)
                                        }
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                    >
                                        <option value="">Select a term</option>
                                        {terms &&
                                            terms.map((term) => (
                                                <option
                                                    key={term.id}
                                                    value={term.id}
                                                >
                                                    {term.name}{' '}
                                                    {term.id === activeTerm?.id
                                                        ? '(Current Term)'
                                                        : ''}
                                                </option>
                                            ))}
                                    </select>
                                    {errors.term_id && (
                                        <div className="mt-1 text-sm text-red-600">
                                            {errors.term_id}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label
                                        htmlFor="section_code"
                                        className="mb-1 block text-sm font-medium text-gray-700"
                                    >
                                        Section Code{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="section_code"
                                        value={data.section_code}
                                        onChange={(e) =>
                                            setData(
                                                'section_code',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="e.g., 001, A, etc."
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                    />
                                    {errors.section_code && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.section_code}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label
                                        htmlFor="number_of_students"
                                        className="mb-1 block text-sm font-medium text-gray-700"
                                    >
                                        Number of Students
                                    </label>
                                    <input
                                        type="number"
                                        id="number_of_students"
                                        min="0"
                                        value={data.number_of_students}
                                        onChange={(e) =>
                                            setData(
                                                'number_of_students',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Expected enrollment"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                    />
                                    {errors.number_of_students && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.number_of_students}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="capacity"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Section Capacity
                                </label>
                                <input
                                    type="number"
                                    id="capacity"
                                    min="1"
                                    value={data.capacity}
                                    onChange={(e) =>
                                        setData('capacity', e.target.value)
                                    }
                                    placeholder="Maximum number of students allowed"
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    {data.delivery_method === 'in-person' ||
                                    data.delivery_method === 'hybrid'
                                        ? 'For in-person or hybrid sections, capacity will be limited by room size.'
                                        : 'For online sections, this sets the maximum enrollment limit.'}
                                </p>
                                {errors.capacity && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.capacity}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => switchTab('instructor')}
                                    className="inline-flex items-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                >
                                    Next: Instructor
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Instructor Tab */}
                    <div
                        className={`p-6 ${activeTab !== 'instructor' ? 'hidden' : ''}`}
                    >
                        <div className="space-y-6">
                            <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
                                <h2 className="mb-2 font-medium text-purple-800">
                                    Instructor Assignment
                                </h2>
                                <p className="text-sm text-purple-700">
                                    Assign a professor to this section
                                </p>
                            </div>

                            <div>
                                <label
                                    htmlFor="professor_profile_id"
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                >
                                    Professor
                                </label>
                                <select
                                    id="professor_profile_id"
                                    value={data.professor_profile_id}
                                    onChange={(e) =>
                                        setData(
                                            'professor_profile_id',
                                            e.target.value,
                                        )
                                    }
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                >
                                    <option value="">Not Assigned</option>
                                    {professorProfiles &&
                                        Array.isArray(professorProfiles) &&
                                        professorProfiles.map(
                                            (profile) =>
                                                profile.user && (
                                                    <option
                                                        key={profile.id}
                                                        value={profile.id}
                                                    >
                                                        {profile.user.name}{' '}
                                                        {profile.title
                                                            ? `(${profile.title})`
                                                            : ''}
                                                    </option>
                                                ),
                                        )}
                                </select>
                                {errors.professor_profile_id && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.professor_profile_id}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => switchTab('basic-info')}
                                    className="inline-flex items-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={() => switchTab('requirements')}
                                    className="inline-flex items-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Requirements Tab */}
                    <div
                        className={`p-6 ${activeTab !== 'requirements' ? 'hidden' : ''}`}
                    >
                        <div className="space-y-6">
                            <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
                                <h2 className="mb-2 font-medium text-purple-800">
                                    Room Requirements
                                </h2>
                                <p className="text-sm text-purple-700">
                                    Specify required room features for this
                                    section
                                </p>
                            </div>

                            <div>
                                <h3 className="mb-4 text-sm font-medium">
                                    Select Required Features:
                                </h3>
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                                    {roomFeatures &&
                                        roomFeatures.map((feature) => (
                                            <div
                                                key={feature.id}
                                                className="flex items-center"
                                            >
                                                <input
                                                    id={`feature-${feature.id}`}
                                                    type="checkbox"
                                                    checked={data.required_features.includes(
                                                        feature.id,
                                                    )}
                                                    onChange={() =>
                                                        toggleFeature(
                                                            feature.id,
                                                        )
                                                    }
                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                                <label
                                                    htmlFor={`feature-${feature.id}`}
                                                    className="ml-2 block text-sm text-gray-700"
                                                >
                                                    {feature.name}
                                                </label>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => switchTab('instructor')}
                                    className="inline-flex items-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={() => switchTab('schedule')}
                                    className="inline-flex items-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Tab */}
                    <div
                        className={`p-6 ${activeTab !== 'schedule' ? 'hidden' : ''}`}
                    >
                        <div className="space-y-6">
                            <div className="mb-6 rounded-lg border border-purple-200 bg-purple-50 p-4">
                                <h2 className="mb-2 font-medium text-purple-800">
                                    Schedule
                                </h2>
                                <p className="text-sm text-purple-700">
                                    Set up the meeting schedule for this section
                                </p>
                            </div>

                            {/* Existing schedules */}
                            {data.schedules.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="mb-2 text-sm font-medium">
                                        Current Schedules:
                                    </h3>
                                    <div className="space-y-3">
                                        {data.schedules.map(
                                            (schedule, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-3"
                                                >
                                                    <div className="text-sm">
                                                        <span className="font-medium">
                                                            {
                                                                schedule.day_of_week
                                                            }
                                                        </span>
                                                        {schedule.meeting_pattern !==
                                                            'single' && (
                                                            <span className="ml-1 text-gray-500">
                                                                (
                                                                {
                                                                    meetingPatternMap[
                                                                        schedule
                                                                            .meeting_pattern
                                                                    ]
                                                                }
                                                                )
                                                            </span>
                                                        )}
                                                        <span className="ml-3">
                                                            {schedule.start_time.slice(
                                                                0,
                                                                5,
                                                            )}{' '}
                                                            -{' '}
                                                            {schedule.end_time.slice(
                                                                0,
                                                                5,
                                                            )}
                                                        </span>
                                                        <span className="ml-3 text-gray-500">
                                                            {schedule.room_id
                                                                ? rooms &&
                                                                  rooms.find(
                                                                      (r) =>
                                                                          r.id.toString() ===
                                                                          schedule.room_id.toString(),
                                                                  )?.room_number
                                                                : 'No Room'}
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeSchedule(
                                                                index,
                                                            )
                                                        }
                                                        className="text-gray-400 hover:text-red-500 focus:outline-none"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Add new schedule */}
                            <div className="rounded-md border border-gray-200 p-4">
                                <h3 className="mb-3 text-sm font-medium">
                                    Add New Schedule:
                                </h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {/* Meeting Pattern */}
                                    <div>
                                        <label
                                            htmlFor="meeting_pattern"
                                            className="mb-1 block text-sm font-medium text-gray-700"
                                        >
                                            Meeting Pattern
                                        </label>
                                        <select
                                            id="meeting_pattern"
                                            value={newSchedule.meeting_pattern}
                                            onChange={(e) =>
                                                setNewSchedule({
                                                    ...newSchedule,
                                                    meeting_pattern:
                                                        e.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        >
                                            {meetingPatternOptions &&
                                                Object.entries(
                                                    meetingPatternOptions,
                                                ).map(([value, label]) => (
                                                    <option
                                                        key={value}
                                                        value={value}
                                                    >
                                                        {label}
                                                    </option>
                                                ))}
                                        </select>
                                        {newSchedule.meeting_pattern !==
                                            'single' && (
                                            <div className="mt-1 flex items-start text-sm text-blue-600">
                                                <Info className="mr-1 mt-0.5 h-4 w-4 flex-shrink-0" />
                                                <span>
                                                    This will create separate
                                                    schedules for each day in
                                                    the pattern.
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Day of Week - only shown for single meetings */}
                                    {newSchedule.meeting_pattern ===
                                        'single' && (
                                        <div>
                                            <label
                                                htmlFor="day_of_week"
                                                className="mb-1 block text-sm font-medium text-gray-700"
                                            >
                                                Day
                                            </label>
                                            <select
                                                id="day_of_week"
                                                value={newSchedule.day_of_week}
                                                onChange={(e) =>
                                                    setNewSchedule({
                                                        ...newSchedule,
                                                        day_of_week:
                                                            e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            >
                                                {[
                                                    'Monday',
                                                    'Tuesday',
                                                    'Wednesday',
                                                    'Thursday',
                                                    'Friday',
                                                    'Saturday',
                                                    'Sunday',
                                                ].map((day) => (
                                                    <option
                                                        key={day}
                                                        value={day}
                                                    >
                                                        {day}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Location Type */}
                                    <div>
                                        <label
                                            htmlFor="location_type"
                                            className="mb-1 block text-sm font-medium text-gray-700"
                                        >
                                            Location Type
                                        </label>
                                        <select
                                            id="location_type"
                                            value={newSchedule.location_type}
                                            onChange={(e) =>
                                                setNewSchedule({
                                                    ...newSchedule,
                                                    location_type:
                                                        e.target.value,
                                                })
                                            }
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        >
                                            {locationTypeOptions &&
                                                Object.entries(
                                                    locationTypeOptions,
                                                ).map(([value, label]) => (
                                                    <option
                                                        key={value}
                                                        value={value}
                                                    >
                                                        {label}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>

                                    {/* Room selector - only shown for in-person or hybrid */}
                                    {(newSchedule.location_type ===
                                        'in-person' ||
                                        newSchedule.location_type ===
                                            'hybrid') && (
                                        <div>
                                            <label
                                                htmlFor="room_id"
                                                className="mb-1 block text-sm font-medium text-gray-700"
                                            >
                                                Room{' '}
                                                {newSchedule.location_type ===
                                                    'in-person' && (
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                )}
                                            </label>
                                            <select
                                                id="room_id"
                                                value={newSchedule.room_id}
                                                onChange={(e) =>
                                                    setNewSchedule({
                                                        ...newSchedule,
                                                        room_id: e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            >
                                                <option value="">
                                                    No Room
                                                </option>
                                                {rooms &&
                                                    rooms.map((room) => (
                                                        <option
                                                            key={room.id}
                                                            value={room.id.toString()}
                                                        >
                                                            {room.room_number} (
                                                            {
                                                                room.floor
                                                                    ?.building
                                                                    ?.name
                                                            }
                                                            )
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Start time */}
                                    <div>
                                        <label
                                            htmlFor="start_time"
                                            className="mb-1 block text-sm font-medium text-gray-700"
                                        >
                                            Start Time{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input
                                                id="start_time"
                                                type="time"
                                                value={newSchedule.start_time.slice(
                                                    0,
                                                    5,
                                                )}
                                                onChange={(e) =>
                                                    setNewSchedule({
                                                        ...newSchedule,
                                                        start_time:
                                                            e.target.value +
                                                            ':00',
                                                    })
                                                }
                                                className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* End time */}
                                    <div>
                                        <label
                                            htmlFor="end_time"
                                            className="mb-1 block text-sm font-medium text-gray-700"
                                        >
                                            End Time{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input
                                                id="end_time"
                                                type="time"
                                                value={newSchedule.end_time.slice(
                                                    0,
                                                    5,
                                                )}
                                                onChange={(e) =>
                                                    setNewSchedule({
                                                        ...newSchedule,
                                                        end_time:
                                                            e.target.value +
                                                            ':00',
                                                    })
                                                }
                                                className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Virtual meeting URL */}
                                    {(newSchedule.location_type === 'virtual' ||
                                        newSchedule.location_type ===
                                            'hybrid') && (
                                        <div className="col-span-full">
                                            <label
                                                htmlFor="virtual_meeting_url"
                                                className="mb-1 block text-sm font-medium text-gray-700"
                                            >
                                                Virtual Meeting URL{' '}
                                                {newSchedule.location_type ===
                                                    'virtual' && (
                                                    <span className="text-red-500">
                                                        *
                                                    </span>
                                                )}
                                            </label>
                                            <input
                                                id="virtual_meeting_url"
                                                type="text"
                                                value={
                                                    newSchedule.virtual_meeting_url
                                                }
                                                onChange={(e) =>
                                                    setNewSchedule({
                                                        ...newSchedule,
                                                        virtual_meeting_url:
                                                            e.target.value,
                                                    })
                                                }
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                placeholder="https://zoom.us/j/123456789"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={addSchedule}
                                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        <Plus className="mr-2 h-4 w-4" /> Add
                                        Schedule
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => switchTab('requirements')}
                                    className="inline-flex items-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                    Previous
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75"
                                >
                                    {processing
                                        ? 'Creating...'
                                        : 'Create Section'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Persistent Bottom Action Bar */}
                    <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={() => {
                                if (activeTab === 'instructor')
                                    switchTab('basic-info');
                                if (activeTab === 'requirements')
                                    switchTab('instructor');
                                if (activeTab === 'schedule')
                                    switchTab('requirements');
                            }}
                            className={`inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                                activeTab === 'basic-info' ? 'invisible' : ''
                            }`}
                        >
                            Previous
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-75"
                        >
                            {processing ? 'Creating...' : 'Create Section'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
