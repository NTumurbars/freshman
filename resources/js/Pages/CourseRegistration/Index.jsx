import React, { useState, useMemo } from 'react';
import { Head } from '@inertiajs/react';
import moment from 'moment';
import AppLayout from '@/Layouts/AppLayout';
import { Card, Title, Text, Select, SelectItem, TextInput } from '@tremor/react';
import { Button } from '@/Components/ui/button';
import { router } from '@inertiajs/react';
import ScheduleCalendar from '@/Components/ui/ScheduleCalendar';
import { MagnifyingGlassIcon, FunnelIcon, CalendarIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export default function CourseRegistrationIndex({ sections, registrations, currentTerm }) {
    const [selectedSection, setSelectedSection] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCalendar, setShowCalendar] = useState(false);
    const [expandedCourses, setExpandedCourses] = useState(new Set());
    const [filters, setFilters] = useState({
        department: '',
        courseLevel: '',
        deliveryMethod: '',
        timeOfDay: '',
        availability: '',
    });
    const [showFilters, setShowFilters] = useState(false);

    // Extract unique departments and course levels
    const departments = useMemo(() => {
        const depts = new Set(sections.map(s => s.course.department.name));
        return ['All Departments', ...Array.from(depts)];
    }, [sections]);

    const courseLevels = useMemo(() => {
        const levels = new Set(sections.map(s => Math.floor(parseInt(s.course.code.match(/\d+/)[0]) / 100) * 100));
        return ['All Levels', ...Array.from(levels).sort((a, b) => a - b).map(l => `${l} Level`)];
    }, [sections]);

    // Group sections by course
    const courseGroups = useMemo(() => {
        const groups = {};
        sections.forEach(section => {
            const courseId = section.course.id;
            if (!groups[courseId]) {
                groups[courseId] = {
                    course: section.course,
                    sections: []
                };
            }
            groups[courseId].sections.push(section);
        });
        return groups;
    }, [sections]);

    // Filter course groups based on search and filters
    const filteredCourseGroups = useMemo(() => {
        return Object.values(courseGroups).filter(group => {
            const course = group.course;
            const anySectionMatches = group.sections.some(section => {
                // Search query filter
                const searchString = `${course.code} ${course.title} ${section.professor_profile.user.name}`.toLowerCase();
                if (searchQuery && !searchString.includes(searchQuery.toLowerCase())) {
                    return false;
                }

                // Department filter
                if (filters.department && filters.department !== 'All Departments' &&
                    course.department.name !== filters.department) {
                    return false;
                }

                // Course level filter
                if (filters.courseLevel && filters.courseLevel !== 'All Levels') {
                    const courseNumber = parseInt(course.code.match(/\d+/)[0]);
                    const levelStart = parseInt(filters.courseLevel);
                    if (Math.floor(courseNumber / 100) * 100 !== levelStart) {
                        return false;
                    }
                }

                // Delivery method filter
                if (filters.deliveryMethod && filters.deliveryMethod !== 'All Methods' &&
                    section.delivery_method !== filters.deliveryMethod.toLowerCase()) {
                    return false;
                }

                // Time of day filter
                if (filters.timeOfDay) {
                    const startHour = parseInt(section.schedules[0].start_time.split(':')[0]);
                    switch (filters.timeOfDay) {
                        case 'Morning (8AM-12PM)':
                            if (startHour < 8 || startHour >= 12) return false;
                            break;
                        case 'Afternoon (12PM-5PM)':
                            if (startHour < 12 || startHour >= 17) return false;
                            break;
                        case 'Evening (5PM-10PM)':
                            if (startHour < 17 || startHour >= 22) return false;
                            break;
                    }
                }

                // Availability filter
                if (filters.availability) {
                    const isFull = section.capacity <= section.students_count;
                    if (filters.availability === 'Available' && isFull) return false;
                    if (filters.availability === 'Full' && !isFull) return false;
                }

                return true;
            });

            return anySectionMatches;
        });
    }, [courseGroups, searchQuery, filters]);

    // Toggle course expansion
    const toggleCourse = (courseId) => {
        const newExpanded = new Set(expandedCourses);
        if (newExpanded.has(courseId)) {
            newExpanded.delete(courseId);
        } else {
            newExpanded.add(courseId);
        }
        setExpandedCourses(newExpanded);
    };

    // Transform registrations into schedule format
    const currentSchedules = registrations?.map(registration => ({
        ...registration.section.schedules[0],
        section: registration.section,
        location_type: registration.section.delivery_method === 'online' ? 'virtual' :
                      registration.section.delivery_method === 'hybrid' ? 'hybrid' : 'in-person'
    })) || [];

    // If a section is selected, add it to preview schedules
    const previewSchedules = selectedSection ? [
        ...currentSchedules,
        {
            ...selectedSection.schedules[0],
            section: selectedSection,
            location_type: selectedSection.delivery_method === 'online' ? 'virtual' :
                         selectedSection.delivery_method === 'hybrid' ? 'hybrid' : 'in-person',
            custom_color_class: 'bg-yellow-100 border-yellow-400 text-yellow-800'
        }
    ] : currentSchedules;

    // Check for schedule conflicts
    const hasScheduleConflict = (newSection) => {
        const newSchedule = newSection.schedules[0];
        return currentSchedules.some(existingSchedule => {
            return existingSchedule.day_of_week === newSchedule.day_of_week &&
                   ((moment(newSchedule.start_time, 'HH:mm:ss').isBetween(moment(existingSchedule.start_time, 'HH:mm:ss'), moment(existingSchedule.end_time, 'HH:mm:ss'), undefined, '[]')) ||
                    (moment(newSchedule.end_time, 'HH:mm:ss').isBetween(moment(existingSchedule.start_time, 'HH:mm:ss'), moment(existingSchedule.end_time, 'HH:mm:ss'), undefined, '[]')) ||
                    (moment(existingSchedule.start_time, 'HH:mm:ss').isBetween(moment(newSchedule.start_time, 'HH:mm:ss'), moment(newSchedule.end_time, 'HH:mm:ss'), undefined, '[]')));
        });
    };

    // Calculate total registered credits
    const totalCredits = registrations.reduce((total, reg) => total + (reg.section.course.credits || 0), 0);
    const maxCredits = currentTerm?.max_credits || 18;

    // Check if adding a course would exceed credit limit
    const wouldExceedCreditLimit = (section) => {
        const newTotalCredits = totalCredits + (section.course.credits || 0);
        return newTotalCredits > maxCredits;
    };

    // Handle section registration
    const handleRegister = (section) => {
        if (wouldExceedCreditLimit(section)) {
            alert(`Cannot register for this course. It would exceed the maximum allowed credits (${maxCredits}).`);
            return;
        }
        const schoolId = section.course.department.school_id;
        router.post(route('course-registrations.store', { school: schoolId }), {
            section_id: section.id,
        });
    };

    // Handle section drop
    const handleDrop = (registration) => {
        const schoolId = registration.section.course.department.school_id;
        router.delete(route('course-registrations.destroy', {
            school: schoolId,
            courseRegistration: registration.id
        }));
    };

    return (
        <AppLayout>
            <Head title="Course Registration" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {!currentTerm && (
                        <Card className="mb-4">
                            <Title className="text-red-500">No Active Term Found</Title>
                            <Text>There is no active term for course registration at this time.</Text>
                        </Card>
                    )}

                    {/* Main Content */}
                    <div className="space-y-6">
                        {/* Course Search and List */}
                        <Card>
                            <div className="flex flex-col space-y-4">
                                <div className="flex justify-between items-center">
                                    <Title>Available Courses</Title>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowFilters(!showFilters)}
                                        >
                                            <FunnelIcon className="h-4 w-4 mr-2" />
                                            Filters
                                        </Button>
                                        <Button
                                            variant={showCalendar ? "secondary" : "outline"}
                                            size="sm"
                                            onClick={() => setShowCalendar(!showCalendar)}
                                        >
                                            {showCalendar ? (
                                                <>
                                                    <XMarkIcon className="h-4 w-4 mr-2" />
                                                    Hide Calendar
                                                </>
                                            ) : (
                                                <>
                                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                                    Show Calendar
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {/* Search and Filters (keep existing code) */}
                                <div className="relative">
                                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <TextInput
                                        className="pl-10"
                                        placeholder="Search by course code, title, or professor..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                {/* Existing Filters Section */}
                                {showFilters && (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                        <Select
                                            value={filters.department}
                                            onValueChange={(value) => setFilters(f => ({ ...f, department: value }))}
                                            placeholder="Department"
                                        >
                                            {departments.map((dept) => (
                                                <SelectItem key={dept} value={dept}>
                                                    {dept}
                                                </SelectItem>
                                            ))}
                                        </Select>

                                        <Select
                                            value={filters.courseLevel}
                                            onValueChange={(value) => setFilters(f => ({ ...f, courseLevel: value }))}
                                            placeholder="Course Level"
                                        >
                                            {courseLevels.map((level) => (
                                                <SelectItem key={level} value={level}>
                                                    {level}
                                                </SelectItem>
                                            ))}
                                        </Select>

                                        <Select
                                            value={filters.deliveryMethod}
                                            onValueChange={(value) => setFilters(f => ({ ...f, deliveryMethod: value }))}
                                            placeholder="Delivery Method"
                                        >
                                            {['All Methods', 'In-Person', 'Online', 'Hybrid'].map((method) => (
                                                <SelectItem key={method} value={method}>
                                                    {method}
                                                </SelectItem>
                                            ))}
                                        </Select>

                                        <Select
                                            value={filters.timeOfDay}
                                            onValueChange={(value) => setFilters(f => ({ ...f, timeOfDay: value }))}
                                            placeholder="Time of Day"
                                        >
                                            {['All Times', 'Morning (8AM-12PM)', 'Afternoon (12PM-5PM)', 'Evening (5PM-10PM)'].map((time) => (
                                                <SelectItem key={time} value={time}>
                                                    {time}
                                                </SelectItem>
                                            ))}
                                        </Select>

                                        <Select
                                            value={filters.availability}
                                            onValueChange={(value) => setFilters(f => ({ ...f, availability: value }))}
                                            placeholder="Availability"
                                        >
                                            {['All Sections', 'Available', 'Full'].map((status) => (
                                                <SelectItem key={status} value={status}>
                                                    {status}
                                                </SelectItem>
                                            ))}
                                        </Select>

                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setFilters({
                                                    department: '',
                                                    courseLevel: '',
                                                    deliveryMethod: '',
                                                    timeOfDay: '',
                                                    availability: '',
                                                });
                                                setSearchQuery('');
                                            }}
                                        >
                                            Clear Filters
                                        </Button>
                                    </div>
                                )}

                                {/* Results count */}
                                <div className="flex justify-between items-center">
                                    <Text>
                                        Showing {filteredCourseGroups.length} of {Object.keys(courseGroups).length} courses
                                    </Text>
                                    <Text className="text-sm text-gray-500">
                                        {registrations.length} courses registered
                                    </Text>
                                </div>
                            </div>

                            {/* Course List */}
                            <div className="mt-4 space-y-4 max-h-[600px] overflow-y-auto">
                                {filteredCourseGroups.map(({ course, sections }) => (
                                    <Card
                                        key={course.id}
                                        className="overflow-hidden"
                                    >
                                        {/* Course Header */}
                                        <div
                                            className="flex items-start justify-between p-4 cursor-pointer hover:bg-gray-50"
                                            onClick={() => toggleCourse(course.id)}
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    {expandedCourses.has(course.id) ? (
                                                        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                                                    ) : (
                                                        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                                                    )}
                                                    <Title className="text-lg">{course.code}</Title>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                        {course.credits} {course.credits === 1 ? 'Credit' : 'Credits'}
                                                    </span>
                                                </div>
                                                <Text>{course.title}</Text>
                                                <Text className="text-sm text-gray-500">
                                                    {sections.length} {sections.length === 1 ? 'section' : 'sections'} available
                                                </Text>
                                            </div>
                                        </div>

                                        {/* Sections */}
                                        {expandedCourses.has(course.id) && (
                                            <div className="border-t">
                                                {sections.map((section) => {
                                                    const conflict = hasScheduleConflict(section);
                                                    const isFull = section.capacity <= section.students_count;

                                                    return (
                                                        <div
                                                            key={section.id}
                                                            className={`p-4 border-b last:border-b-0 ${
                                                                selectedSection?.id === section.id
                                                                    ? 'bg-blue-50'
                                                                    : 'hover:bg-gray-50'
                                                            }`}
                                                            onClick={() => {
                                                                setSelectedSection(section);
                                                                if (!showCalendar) setShowCalendar(true);
                                                            }}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Text className="font-medium">Section {section.section_code}</Text>
                                                                        <div className="flex gap-1">
                                                                            {isFull && (
                                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                                                    Full
                                                                                </span>
                                                                            )}
                                                                            {conflict && (
                                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                                                    Schedule Conflict
                                                                                </span>
                                                                            )}
                                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                                section.delivery_method === 'online' ? 'bg-green-100 text-green-800' :
                                                                                section.delivery_method === 'hybrid' ? 'bg-purple-100 text-purple-800' :
                                                                                'bg-blue-100 text-blue-800'
                                                                            }`}>
                                                                                {section.delivery_method}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <Text className="text-sm text-gray-600">
                                                                        Professor: {section.professor_profile.user.name}
                                                                    </Text>
                                                                    <div className="mt-1">
                                                                        {section.schedules.map((schedule) => (
                                                                            <Text key={schedule.id} className="text-sm">
                                                                                {schedule.day_of_week} {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                                                                                {schedule.room && ` | Room ${schedule.room.room_number}`}
                                                                            </Text>
                                                                        ))}
                                                                    </div>
                                                                    <Text className="text-sm mt-1">
                                                                        Available Seats: {section.capacity - section.students_count} of {section.capacity}
                                                                    </Text>
                                                                </div>
                                                                {selectedSection?.id === section.id && (
                                                                    <Button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleRegister(section);
                                                                        }}
                                                                        disabled={
                                                                            hasScheduleConflict(section) ||
                                                                            section.capacity <= section.students_count ||
                                                                            wouldExceedCreditLimit(section)
                                                                        }
                                                                        className="mt-2"
                                                                    >
                                                                        {section.capacity <= section.students_count
                                                                            ? 'Section Full'
                                                                            : hasScheduleConflict(section)
                                                                                ? 'Schedule Conflict'
                                                                                : wouldExceedCreditLimit(section)
                                                                                    ? 'Exceeds Credit Limit'
                                                                                    : 'Register'}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </Card>
                                ))}

                                {filteredCourseGroups.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <Text>No courses found matching your criteria</Text>
                                        <Text className="text-sm">Try adjusting your filters or search terms</Text>
                                    </div>
                                )}
                                    </div>
                                </Card>

                        {/* Calendar and Registrations */}
                        {showCalendar && (
                            <div className="space-y-6">
                                {/* Calendar Preview */}
                                <Card className="overflow-hidden">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <Title>Schedule Preview</Title>
                                            <Text>{selectedSection ? 'Selected course highlighted in yellow' : 'Your current schedule'}</Text>
                                        </div>
                                        {selectedSection && (
                                            <Button
                                                onClick={() => handleRegister(selectedSection)}
                                                disabled={
                                                    hasScheduleConflict(selectedSection) ||
                                                    selectedSection.capacity <= selectedSection.students_count ||
                                                    wouldExceedCreditLimit(selectedSection)
                                                }
                                                size="sm"
                                            >
                                                {selectedSection.capacity <= selectedSection.students_count
                                                    ? 'Section Full'
                                                    : hasScheduleConflict(selectedSection)
                                                        ? 'Schedule Conflict'
                                                        : wouldExceedCreditLimit(selectedSection)
                                                            ? 'Exceeds Credit Limit'
                                                            : 'Register for Selected Course'}
                                            </Button>
                                        )}
                                    </div>
                                    <div className="border rounded-lg overflow-hidden">
                                        <div className="h-[700px] w-full overflow-x-auto">
                                            <div className="min-w-[800px] h-full">
                                                <ScheduleCalendar
                                                    schedules={previewSchedules}
                                                    showWeekView={true}
                                                    viewType="default"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Card>

                                {/* Registered Courses */}
                                <Card>
                                    <div className="flex justify-between items-center mb-4">
                                        <Title>Registered Courses ({registrations.length})</Title>
                                        <Text className="text-sm text-gray-500">
                                            {registrations.reduce((total, reg) => total + (reg.section.course.credits || 0), 0)} / {currentTerm?.max_credits || 18} Credits
                                        </Text>
                                    </div>
                                    <div className="space-y-3">
                                        {registrations.map((registration) => (
                                            <div
                                                key={registration.id}
                                                className="flex justify-between items-start p-4 border rounded-lg hover:bg-gray-50"
                                            >
                                                    <div>
                                                    <div className="flex items-center gap-2">
                                                        <Text className="font-medium">
                                                            {registration.section.course.code} - {registration.section.section_code}
                                                        </Text>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                            registration.section.delivery_method === 'online' ? 'bg-green-100 text-green-800' :
                                                            registration.section.delivery_method === 'hybrid' ? 'bg-purple-100 text-purple-800' :
                                                            'bg-blue-100 text-blue-800'
                                                        }`}>
                                                            {registration.section.delivery_method}
                                                        </span>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                            {registration.section.course.credits} {registration.section.course.credits === 1 ? 'Credit' : 'Credits'}
                                                        </span>
                                                    </div>
                                                    <Text className="text-sm text-gray-600">
                                                        {registration.section.course.title}
                                                    </Text>
                                                    <Text className="text-sm text-gray-500">
                                                        {registration.section.schedules.map(s =>
                                                            `${s.day_of_week} ${s.start_time.substring(0, 5)} - ${s.end_time.substring(0, 5)}`
                                                        ).join(', ')}
                                                    </Text>
                                                    </div>
                                                    <Button
                                                        variant="destructive"
                                                    size="sm"
                                                        onClick={() => handleDrop(registration)}
                                                    >
                                                    Drop
                                                    </Button>
                                                </div>
                                        ))}
                                        {registrations.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                <Text>No courses registered yet</Text>
                                                <Text className="text-sm">Select a course above to register</Text>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
