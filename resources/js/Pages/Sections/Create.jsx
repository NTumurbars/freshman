import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft, Plus, X, Info, Clock, GraduationCap, BookOpen, Users } from 'lucide-react';

export default function Create({ courses, terms, professors, roomFeatures, rooms, school, statuses, deliveryMethods, meetingPatterns: meetingPatternOptions, locationTypes: locationTypeOptions }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const userSchool = auth.user.school;
    
    // State for active tab
    const [activeTab, setActiveTab] = useState('basic-info');
    
    // Form state
    const { data, setData, post, processing, errors } = useForm({
        course_id: '',
        term_id: '',
        professor_id: '',
        section_code: '',
        number_of_students: 0,
        status: 'active',
        delivery_method: 'in-person',
        notes: '',
        required_features: [],
        schedules: []
    });
    
    // State for new schedule
    const [newSchedule, setNewSchedule] = useState({
        room_id: '',
        day_of_week: 'Monday',
        start_time: '09:00:00',
        end_time: '10:00:00',
        meeting_pattern: 'single',
        location_type: 'in-person',
        virtual_meeting_url: ''
    });
    
    // Helper constants for location types
    const locationTypes = {
        'in-person': 'In Person',
        'virtual': 'Virtual',
        'hybrid': 'Hybrid'
    };
    
    // Helper constants for meeting patterns
    const meetingPatternMap = {
        'single': 'Single Meeting',
        'monday-wednesday-friday': 'Monday/Wednesday/Friday',
        'tuesday-thursday': 'Tuesday/Thursday',
        'monday-wednesday': 'Monday/Wednesday',
        'tuesday-friday': 'Tuesday/Friday',
        'weekly': 'Weekly (Mon-Fri)'
    };
    
    // Function to add a new schedule
    const addSchedule = () => {
        // Basic validation
        if ((newSchedule.location_type === 'in-person' || newSchedule.location_type === 'hybrid') && !newSchedule.room_id) {
            alert('Please select a room for in-person or hybrid classes');
            return;
        }
        
        if ((newSchedule.location_type === 'virtual' || newSchedule.location_type === 'hybrid') && !newSchedule.virtual_meeting_url) {
            alert('Please enter a virtual meeting URL for virtual or hybrid classes');
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
            schedulesToAdd = days.map(day => ({
                ...normalizedSchedule,
                day_of_week: day,
                meeting_pattern: 'single' // Each individual day is stored as single
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
            virtual_meeting_url: ''
        });
    };
    
    // Helper function to get days of week from meeting pattern
    const getDaysFromPattern = (pattern) => {
        const patternMap = {
            'monday-wednesday-friday': ['Monday', 'Wednesday', 'Friday'],
            'tuesday-thursday': ['Tuesday', 'Thursday'],
            'monday-wednesday': ['Monday', 'Wednesday'],
            'tuesday-friday': ['Tuesday', 'Friday'],
            'weekly': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            'single': [newSchedule.day_of_week]
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
        <AppLayout userRole={userRole} school={userSchool}>
            <Head title="Create Section" />

            <div className="mb-6 space-y-4">
                <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
                    <div>
                        <Link
                            href={route('sections.index', school.id)}
                            className="mb-2 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                            <ChevronLeft className="mr-1 h-4 w-4" /> Back to Sections
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800">Create New Section</h1>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                {/* Header with gradient background */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 py-4 px-6 flex items-center">
                    <GraduationCap className="h-8 w-8 text-white mr-3" />
                    <h1 className="text-xl font-bold text-white">Create New Class Section</h1>
                </div>
                
                {/* Tabs */}
                <div className="border-b border-gray-200 bg-gray-50">
                    <nav className="flex -mb-px px-4">
                        <button
                            onClick={() => switchTab('basic-info')}
                            className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'basic-info'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center">
                                <BookOpen className="h-4 w-4 mr-2" />
                                <span>1. Basic Information</span>
                            </div>
                        </button>
                        <button
                            onClick={() => switchTab('instructor')}
                            className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'instructor'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center">
                                <Users className="h-4 w-4 mr-2" />
                                <span>2. Instructor</span>
                            </div>
                        </button>
                        <button
                            onClick={() => switchTab('requirements')}
                            className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'requirements'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center">
                                <Info className="h-4 w-4 mr-2" />
                                <span>3. Requirements</span>
                            </div>
                        </button>
                        <button
                            onClick={() => switchTab('schedule')}
                            className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'schedule'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>4. Schedule</span>
                            </div>
                        </button>
                    </nav>
                </div>

                <form onSubmit={handleSubmit} className="p-0">
                    {/* Basic Info Tab */}
                    <div className={`p-6 ${activeTab !== 'basic-info' ? 'hidden' : ''}`}>
                        <div className="space-y-6">
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                                <h2 className="text-purple-800 font-medium mb-2">Basic Section Information</h2>
                                <p className="text-sm text-purple-700">Enter the fundamental details about this class section</p>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label htmlFor="course_id" className="block text-sm font-medium text-gray-700 mb-1">
                                        Course <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="course_id"
                                        value={data.course_id}
                                        onChange={(e) => setData('course_id', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                    >
                                        <option value="">Select a course</option>
                                        {courses && courses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.course_code} - {course.title}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.course_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.course_id}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="term_id" className="block text-sm font-medium text-gray-700 mb-1">
                                        Term <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="term_id"
                                        value={data.term_id}
                                        onChange={(e) => setData('term_id', e.target.value)}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                    >
                                        <option value="">Select a term</option>
                                        {terms && terms.map((term) => (
                                            <option key={term.id} value={term.id}>
                                                {term.name} ({new Date(term.start_date).toLocaleDateString()} - {new Date(term.end_date).toLocaleDateString()})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.term_id && (
                                        <p className="mt-1 text-sm text-red-600">{errors.term_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label htmlFor="section_code" className="block text-sm font-medium text-gray-700 mb-1">
                                        Section Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="section_code"
                                        value={data.section_code}
                                        onChange={(e) => setData('section_code', e.target.value)}
                                        placeholder="e.g., 001, A, etc."
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                    />
                                    {errors.section_code && (
                                        <p className="mt-1 text-sm text-red-600">{errors.section_code}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="number_of_students" className="block text-sm font-medium text-gray-700 mb-1">
                                        Number of Students
                                    </label>
                                    <input
                                        type="number"
                                        id="number_of_students"
                                        min="0"
                                        value={data.number_of_students}
                                        onChange={(e) => setData('number_of_students', e.target.value)}
                                        placeholder="Expected enrollment"
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                    />
                                    {errors.number_of_students && (
                                        <p className="mt-1 text-sm text-red-600">{errors.number_of_students}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => switchTab('instructor')}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                >
                                    Next: Instructor
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Instructor Tab */}
                    <div className={`p-6 ${activeTab !== 'instructor' ? 'hidden' : ''}`}>
                        <div className="space-y-6">
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                                <h2 className="text-purple-800 font-medium mb-2">Instructor Assignment</h2>
                                <p className="text-sm text-purple-700">Assign a professor to this section</p>
                            </div>

                            <div>
                                <label htmlFor="professor_id" className="block text-sm font-medium text-gray-700 mb-1">
                                    Professor
                                </label>
                                <select
                                    id="professor_id"
                                    value={data.professor_id}
                                    onChange={(e) => setData('professor_id', e.target.value)}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                >
                                    <option value="">Not Assigned</option>
                                    {professors && Array.isArray(professors) && professors.map((profile) => 
                                        profile.user && (
                                            <option key={profile.user.id} value={profile.user.id}>
                                                {profile.user.name}
                                            </option>
                                        )
                                    )}
                                </select>
                                {errors.professor_id && (
                                    <p className="mt-1 text-sm text-red-600">{errors.professor_id}</p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => switchTab('basic-info')}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={() => switchTab('requirements')}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Requirements Tab */}
                    <div className={`p-6 ${activeTab !== 'requirements' ? 'hidden' : ''}`}>
                        <div className="space-y-6">
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                                <h2 className="text-purple-800 font-medium mb-2">Room Requirements</h2>
                                <p className="text-sm text-purple-700">Specify required room features for this section</p>
                            </div>

                            <div>
                                <h3 className="mb-4 text-sm font-medium">Select Required Features:</h3>
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                                    {roomFeatures && roomFeatures.map((feature) => (
                                        <div key={feature.id} className="flex items-center">
                                            <input
                                                id={`feature-${feature.id}`}
                                                type="checkbox"
                                                checked={data.required_features.includes(feature.id)}
                                                onChange={() => toggleFeature(feature.id)}
                                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label htmlFor={`feature-${feature.id}`} className="ml-2 block text-sm text-gray-700">
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
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Previous
                                </button>
                                <button
                                    type="button"
                                    onClick={() => switchTab('schedule')}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Schedule Tab */}
                    <div className={`p-6 ${activeTab !== 'schedule' ? 'hidden' : ''}`}>
                        <div className="space-y-6">
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                                <h2 className="text-purple-800 font-medium mb-2">Schedule</h2>
                                <p className="text-sm text-purple-700">Set up the meeting schedule for this section</p>
                            </div>

                            {/* Existing schedules */}
                            {data.schedules.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="mb-2 text-sm font-medium">Current Schedules:</h3>
                                    <div className="space-y-3">
                                        {data.schedules.map((schedule, index) => (
                                            <div key={index} className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-3">
                                                <div className="text-sm">
                                                    <span className="font-medium">{schedule.day_of_week}</span>
                                                    {schedule.meeting_pattern !== 'single' && (
                                                        <span className="ml-1 text-gray-500">
                                                            ({meetingPatternMap[schedule.meeting_pattern]})
                                                        </span>
                                                    )}
                                                    <span className="ml-3">
                                                        {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                                                    </span>
                                                    <span className="ml-3 text-gray-500">
                                                        {schedule.room_id 
                                                            ? rooms && rooms.find(r => r.id.toString() === schedule.room_id.toString())?.room_number 
                                                            : 'No Room'
                                                        }
                                                    </span>
                                                </div>
                                                <button 
                                                    type="button"
                                                    onClick={() => removeSchedule(index)}
                                                    className="text-gray-400 hover:text-red-500 focus:outline-none"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add new schedule */}
                            <div className="rounded-md border border-gray-200 p-4">
                                <h3 className="mb-3 text-sm font-medium">Add New Schedule:</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {/* Meeting Pattern */}
                                    <div>
                                        <label htmlFor="meeting_pattern" className="block text-sm font-medium text-gray-700 mb-1">
                                            Meeting Pattern
                                        </label>
                                        <select
                                            id="meeting_pattern"
                                            value={newSchedule.meeting_pattern}
                                            onChange={(e) => setNewSchedule({...newSchedule, meeting_pattern: e.target.value})}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        >
                                            {meetingPatternOptions && Object.entries(meetingPatternOptions).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                        {newSchedule.meeting_pattern !== 'single' && (
                                            <div className="mt-1 flex items-start text-sm text-blue-600">
                                                <Info className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                                                <span>This will create separate schedules for each day in the pattern.</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Day of Week - only shown for single meetings */}
                                    {newSchedule.meeting_pattern === 'single' && (
                                        <div>
                                            <label htmlFor="day_of_week" className="block text-sm font-medium text-gray-700 mb-1">
                                                Day
                                            </label>
                                            <select
                                                id="day_of_week"
                                                value={newSchedule.day_of_week}
                                                onChange={(e) => setNewSchedule({...newSchedule, day_of_week: e.target.value})}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            >
                                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                                                    <option key={day} value={day}>
                                                        {day}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Location Type */}
                                    <div>
                                        <label htmlFor="location_type" className="block text-sm font-medium text-gray-700 mb-1">
                                            Location Type
                                        </label>
                                        <select
                                            id="location_type"
                                            value={newSchedule.location_type}
                                            onChange={(e) => setNewSchedule({...newSchedule, location_type: e.target.value})}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        >
                                            {locationTypeOptions && Object.entries(locationTypeOptions).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Room selector - only shown for in-person or hybrid */}
                                    {(newSchedule.location_type === 'in-person' || newSchedule.location_type === 'hybrid') && (
                                        <div>
                                            <label htmlFor="room_id" className="block text-sm font-medium text-gray-700 mb-1">
                                                Room {newSchedule.location_type === 'in-person' && <span className="text-red-500">*</span>}
                                            </label>
                                            <select
                                                id="room_id"
                                                value={newSchedule.room_id}
                                                onChange={(e) => setNewSchedule({...newSchedule, room_id: e.target.value})}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            >
                                                <option value="">No Room</option>
                                                {rooms && rooms.map((room) => (
                                                    <option key={room.id} value={room.id.toString()}>
                                                        {room.room_number} ({room.floor?.building?.name})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Start time */}
                                    <div>
                                        <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                                            Start Time <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input
                                                id="start_time"
                                                type="time"
                                                value={newSchedule.start_time.slice(0, 5)}
                                                onChange={(e) => setNewSchedule({...newSchedule, start_time: e.target.value + ':00'})}
                                                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* End time */}
                                    <div>
                                        <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                                            End Time <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                            </div>
                                            <input
                                                id="end_time"
                                                type="time"
                                                value={newSchedule.end_time.slice(0, 5)}
                                                onChange={(e) => setNewSchedule({...newSchedule, end_time: e.target.value + ':00'})}
                                                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Virtual meeting URL */}
                                    {(newSchedule.location_type === 'virtual' || newSchedule.location_type === 'hybrid') && (
                                        <div className="col-span-full">
                                            <label htmlFor="virtual_meeting_url" className="block text-sm font-medium text-gray-700 mb-1">
                                                Virtual Meeting URL {newSchedule.location_type === 'virtual' && <span className="text-red-500">*</span>}
                                            </label>
                                            <input
                                                id="virtual_meeting_url"
                                                type="text"
                                                value={newSchedule.virtual_meeting_url}
                                                onChange={(e) => setNewSchedule({...newSchedule, virtual_meeting_url: e.target.value})}
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
                                        <Plus className="mr-2 h-4 w-4" /> Add Schedule
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <button
                                    type="button"
                                    onClick={() => switchTab('requirements')}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Previous
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-75 disabled:cursor-not-allowed"
                                >
                                    {processing ? 'Creating...' : 'Create Section'}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Persistent Bottom Action Bar */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => {
                                if (activeTab === 'instructor') switchTab('basic-info');
                                if (activeTab === 'requirements') switchTab('instructor');
                                if (activeTab === 'schedule') switchTab('requirements');
                            }}
                            className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                                activeTab === 'basic-info' ? 'invisible' : ''
                            }`}
                        >
                            Previous
                        </button>
                        
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-75 disabled:cursor-not-allowed"
                        >
                            {processing ? 'Creating...' : 'Create Section'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
