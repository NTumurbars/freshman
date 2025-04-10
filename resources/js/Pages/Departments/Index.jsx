import AppLayout from '@/Layouts/AppLayout';
import {
    AcademicCapIcon,
    ArrowsUpDownIcon,
    BookOpenIcon,
    BuildingOfficeIcon,
    EnvelopeIcon,
    MapPinIcon,
    PhoneIcon,
    PlusIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import { Head, Link } from '@inertiajs/react';
import {
    Badge,
    Button,
    Card,
    Col,
    Divider,
    Grid,
    List,
    ListItem,
    Select,
    SelectItem,
    Text,
    Title,
} from '@tremor/react';
import { useState } from 'react';

const DepartmentCard = ({ department, school }) => {
    const contactInfo = department.contact || {};

    return (
        <Card className="h-full border border-gray-200 transition-all hover:shadow-md">
            <div className="flex flex-col">
                <div className="mb-2">
                    <Badge
                        icon={BuildingOfficeIcon}
                        color="blue"
                        className="px-2.5 py-1"
                    >
                        {department.code || 'DEPT'}
                    </Badge>
                </div>
                <Title className="mb-5 text-2xl">{department.name}</Title>
                <Divider />
                <div className="my-4">
                    <Grid numItems={1} numItemsSm={3} className="gap-2">
                        <div className="flex items-center gap-2">
                            <AcademicCapIcon className="h-5 w-5 text-blue-500" />
                            <Text>Majors</Text>
                            <Text className="text-lg font-semibold text-blue-600">
                                {department.stats?.majors || 0}
                            </Text>
                        </div>
                        <div className="flex items-center gap-2">
                            <BookOpenIcon className="h-5 w-5 text-green-500" />
                            <Text>Courses</Text>
                            <Text className="text-lg font-semibold text-green-600">
                                {department.stats?.courses || 0}
                            </Text>
                        </div>
                        <div className="flex items-center gap-2">
                            <UserGroupIcon className="h-5 w-5 text-purple-500" />
                            <Text>Professors</Text>
                            <Text className="text-lg font-semibold text-purple-600">
                                {department.stats?.professors || 0}
                            </Text>
                        </div>
                    </Grid>
                </div>

                <div className="mt-3">
                    <Text className="font-medium text-gray-700">
                        Contact Information
                    </Text>
                    {!(
                        contactInfo.email ||
                        contactInfo.phone ||
                        contactInfo.office
                    ) && (
                        <Text className="mt-1 italic text-gray-500">
                            No contact information available
                        </Text>
                    )}
                    {(contactInfo.email ||
                        contactInfo.phone ||
                        contactInfo.office) && (
                        <List className="mt-1">
                            {contactInfo.email && (
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                                        <a
                                            href={`mailto:${contactInfo.email}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {contactInfo.email}
                                        </a>
                                    </div>
                                </ListItem>
                            )}
                            {contactInfo.phone && (
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <PhoneIcon className="h-5 w-5 text-gray-500" />
                                        <a href={`tel:${contactInfo.phone}`}>
                                            {contactInfo.phone}
                                        </a>
                                    </div>
                                </ListItem>
                            )}
                            {contactInfo.office && (
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <MapPinIcon className="h-5 w-5 text-gray-500" />
                                        <span>{contactInfo.office}</span>
                                    </div>
                                </ListItem>
                            )}
                        </List>
                    )}
                </div>

                <div className="mt-auto flex justify-end gap-4 border-t border-gray-100 pt-4">
                    <Link
                        href={route('departments.show', {
                            school: department.school_id,
                            department: department.id,
                        })}
                    >
                        <Button
                            variant="light"
                            size="sm"
                            className="text-blue-600"
                        >
                            View
                        </Button>
                    </Link>
                    <Link
                        href={route('departments.edit', {
                            school: department.school_id,
                            department: department.id,
                        })}
                    >
                        <Button
                            variant="light"
                            size="sm"
                            className="text-blue-600"
                        >
                            Edit
                        </Button>
                    </Link>
                    <Link
                        href={route('departments.destroy', {
                            school: school.id,
                            department: department.id,
                        })}
                        method="delete"
                        as="button"
                        type="button"
                        className="text-sm text-red-600 hover:text-red-800"
                    >
                        Delete
                    </Link>
                </div>
            </div>
        </Card>
    );
};

export default function Index({ departments, school, can_create }) {
    // Filtering by query
    const [searchQuery, setSearchQuery] = useState('');
    // Sorting (low to high)
    const [sortBy, setSortBy] = useState('name');

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredDepartments = departments.filter((department) =>
        department.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    // Sorting logic
    const sortedDepartments = filteredDepartments.sort((a, b) => {
        if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
        } else if (sortBy === 'courses') {
            // Sort by number of courses, handling missing values
            const aCourses = a.stats?.courses || 0;
            const bCourses = b.stats?.courses || 0;
            return aCourses - bCourses;
        } else if (sortBy === 'professors') {
            // Sort by number of professors, handling missing values
            const aProfessors = a.stats?.professors || 0;
            const bProfessors = b.stats?.professors || 0;
            return aProfessors - bProfessors;
        }
        return 0;
    });

    return (
        <AppLayout>
            <Head title="Departments" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Title className="text-2xl font-bold">
                            Academic Departments
                        </Title>
                        <Text className="mt-1 text-gray-600">
                            Manage departments and academic units for{' '}
                            {school.name}
                        </Text>
                    </div>
                    {can_create && (
                        <Link href={route('departments.create', school.id)}>
                            <Button
                                icon={PlusIcon}
                                color="blue"
                                size="md"
                                className="shadow-sm transition-all hover:shadow-md"
                            >
                                Add Department
                            </Button>
                        </Link>
                    )}
                </div>

                {departments.length > 0 ? (
                    <div>
                        <Card className="mb-6 overflow-hidden border border-gray-200 shadow-md">
                            <div className="flex flex-col items-start justify-between border-b bg-gradient-to-r from-blue-50 to-white p-4 dark:from-gray-800 dark:to-gray-900 sm:flex-row sm:items-center">
                                <div className="mb-2 flex items-center gap-2 sm:mb-0">
                                    <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                                    <Text className="font-medium">
                                        All Departments (
                                        {filteredDepartments.length})
                                    </Text>
                                </div>
                                <div className="flex w-full gap-2 sm:w-auto">
                                    <input
                                        className="max-w-xs rounded-md border border-gray-300 p-2"
                                        placeholder="Search departments"
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                    />
                                    <Select
                                        className="w-40"
                                        icon={ArrowsUpDownIcon}
                                        placeholder="Sort By"
                                        value={sortBy}
                                        onChange={(value) => setSortBy(value)} // Use the direct value passed by Select
                                    >
                                        <SelectItem value="name">
                                            Name (A-Z)
                                        </SelectItem>
                                        <SelectItem value="courses">
                                            Course Count
                                        </SelectItem>
                                        <SelectItem value="professors">
                                            Professor Count
                                        </SelectItem>
                                    </Select>
                                </div>
                            </div>
                        </Card>

                        <Grid
                            numItems={1}
                            numItemsSm={2}
                            numItemsLg={3}
                            className="gap-6"
                        >
                            {sortedDepartments.map((department) => (
                                <Col key={department.id}>
                                    <DepartmentCard
                                        department={department}
                                        school={school}
                                    />
                                </Col>
                            ))}
                        </Grid>
                    </div>
                ) : (
                    <Card className="border border-dashed border-gray-300 shadow-sm">
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-4 rounded-full bg-blue-50 p-3">
                                <BuildingOfficeIcon className="h-10 w-10 text-blue-500" />
                            </div>
                            <Title className="mb-2">No departments found</Title>
                            <Text className="mb-6 max-w-sm">
                                Get started by adding your first academic
                                department to this school.
                            </Text>
                            {can_create && (
                                <Link
                                    href={route(
                                        'departments.create',
                                        school.id,
                                    )}
                                >
                                    <Button
                                        variant="primary"
                                        color="blue"
                                        icon={PlusIcon}
                                        className="shadow-sm transition-all hover:shadow-md"
                                    >
                                        Create your first department
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
