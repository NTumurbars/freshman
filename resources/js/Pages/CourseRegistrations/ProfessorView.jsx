import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, Title, Text, Select, SelectItem, Badge } from '@tremor/react';
import { Search } from 'lucide-react';
import TextInput from '@/Components/TextInput';

export default function ProfessorView({ sections, currentTerm, terms, school }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSection, setSelectedSection] = useState('all');

    // Use effect for debugging
    useEffect(() => {
        console.log('Sections data:', sections);
        if (sections.length > 0) {
            console.log('First section courseRegistrations:', sections[0].courseRegistrations);
            if (sections[0].courseRegistrations && sections[0].courseRegistrations.length > 0) {
                console.log('First student:', sections[0].courseRegistrations[0].student);
            }
        }
    }, [sections]);

    // Function to handle term change
    const handleTermChange = (termId) => {
        router.get(route('professor.students', { school: school.id }), {
            term_id: termId
        }, {
            preserveState: true,
            replace: true
        });
    };

    // Function to filter and display students
    const getFilteredStudents = () => {
        // Create a map to track unique students across sections
        const studentMap = new Map();

        // Filter sections if a specific one is selected
        const sectionsToProcess = selectedSection === 'all'
            ? sections
            : sections.filter(section => section.id.toString() === selectedSection);

        // Process all sections to extract students
        sectionsToProcess.forEach(section => {
            if (section.courseRegistrations && section.courseRegistrations.length > 0) {
                section.courseRegistrations.forEach(registration => {
                    if (registration.student) {
                        // Use student ID as key to avoid duplicates
                        const studentKey = registration.student.id;

                        // If student is not in map or we're processing sections individually, add/update entry
                        if (!studentMap.has(studentKey) || selectedSection !== 'all') {
                            studentMap.set(studentKey, {
                                ...registration.student,
                                section: {
                                    id: section.id,
                                    code: section.section_code,
                                    course: section.course ? section.course.title : 'Unknown Course'
                                },
                                registrationId: registration.id
                            });
                        }
                    }
                });
            }
        });

        // Convert map to array and filter by search term
        return Array.from(studentMap.values())
            .filter(student => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    student.name.toLowerCase().includes(searchLower) ||
                    student.email.toLowerCase().includes(searchLower) ||
                    (student.section && student.section.course.toLowerCase().includes(searchLower)) ||
                    (student.section && student.section.code.toLowerCase().includes(searchLower))
                );
            });
    };

    const filteredStudents = getFilteredStudents();

    // Get total student count across all sections (accounting for duplicates)
    const getTotalUniqueStudentCount = () => {
        const uniqueStudentIds = new Set();

        sections.forEach(section => {
            if (section.courseRegistrations) {
                section.courseRegistrations.forEach(registration => {
                    if (registration.student) {
                        uniqueStudentIds.add(registration.student.id);
                    }
                });
            }
        });

        return uniqueStudentIds.size;
    };

    const totalStudentCount = getTotalUniqueStudentCount();

    return (
        <AppLayout>
            <Head title="My Students" />

            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 sm:px-0">
                    <h1 className="text-2xl font-semibold text-gray-900">My Students</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Manage and view students enrolled in your courses
                    </p>
                </div>

                <div className="mt-6 space-y-6">
                    <Card>
                        <div className="sm:flex sm:items-center sm:justify-between">
                            <div>
                                <Title>Students</Title>
                                <Text>
                                    {currentTerm
                                        ? `Term: ${currentTerm.name}`
                                        : 'All Terms'}
                                </Text>
                            </div>

                            <div className="mt-4 sm:mt-0 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:space-x-4">
                                {/* Term selector */}
                                <Select
                                    value={currentTerm ? currentTerm.id.toString() : ''}
                                    onValueChange={handleTermChange}
                                    className="max-w-xs"
                                >
                                    {terms.map(term => (
                                        <SelectItem key={term.id} value={term.id.toString()}>
                                            {term.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        <div className="mt-6 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                                {/* Section filter */}
                                <Select
                                    value={selectedSection}
                                    onValueChange={setSelectedSection}
                                    className="max-w-xs"
                                >
                                    <SelectItem value="all">All Sections</SelectItem>
                                    {sections.map(section => (
                                        <SelectItem key={section.id} value={section.id.toString()}>
                                            {section.section_code} - {section.course ? section.course.title : 'Unknown Course'}
                                        </SelectItem>
                                    ))}
                                </Select>

                                {/* Search input */}
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                                    <TextInput
                                        type="search"
                                        placeholder="Search students..."
                                        className="pl-8 w-full sm:w-[300px]"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="mt-2">
                                <Badge>
                                    {filteredStudents.length} of {totalStudentCount} students
                                </Badge>
                            </div>

                            {/* Students table */}
                            <div className="rounded-md border mt-4">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 w-[200px]">Name</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Section</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Course</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredStudents.length > 0 ? (
                                            filteredStudents.map((student) => (
                                                <tr key={`${student.id}-${student.section?.id || 'unknown'}`} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.email}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.section?.code || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.section?.course || '-'}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="text-center py-4 text-gray-500">
                                                    {sections.length === 0
                                                        ? "You don't have any sections assigned for this term."
                                                        : searchTerm
                                                            ? "No students match your search criteria."
                                                            : "No students enrolled in your sections."}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </Card>

                    {/* Sections Summary Card */}
                    <Card>
                        <Title>Sections ({sections.length})</Title>
                        <Text>Summary of your teaching sections</Text>

                        <div className="mt-4 space-y-4">
                            {sections.length > 0 ? (
                                <div className="rounded-md border">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Section Code</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Course</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Enrolled</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {sections.map((section) => (
                                                <tr key={section.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        {section.section_code}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {section.course ? section.course.title : 'Unknown Course'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                        {section.courseRegistrations ? section.courseRegistrations.length : 0}
                                                        {section.capacity ? ` / ${section.capacity}` : ''}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-4 text-gray-500 border rounded-md">
                                    No sections assigned for the selected term.
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
