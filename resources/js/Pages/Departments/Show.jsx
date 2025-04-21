import AppLayout from '@/Layouts/AppLayout';
import {
    AcademicCapIcon,
    ArrowLeftIcon,
    BookOpenIcon,
    EnvelopeIcon,
    MapPinIcon,
    PencilIcon,
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
    Tab,
    TabGroup,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    TabList,
    TabPanel,
    TabPanels,
    Text,
    Title,
} from '@tremor/react';

export default function Show({ department, school }) {
    // Ensure professor_profiles is never undefined
    if (!department.professor_profiles) {
        department.professor_profiles = [];
    }

    // Debug - check if users are loaded correctly
    console.log(
        'Professor Profiles with users:',
        JSON.stringify(department.professor_profiles, null, 2),
        Array.isArray(department.courses)
    );
    console.log(
        'Department contact data:',
        JSON.stringify(department.contact, null, 2),
    );

    // Check if we actually have professor profiles
    const hasProfessors =
        Array.isArray(department.professor_profiles) &&
        department.professor_profiles.length > 0;
    const hasMajors =
        Array.isArray(department.majors) && department.majors.length > 0;
    const hasCourses =
        Array.isArray(department.courses) && department.courses.length > 0;

    return (
        <AppLayout>
            <Head title={department.name} />

            <div className="px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('departments.index', {
                                school: school.id,
                            })}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                            <ArrowLeftIcon className="mr-1 h-4 w-4" />
                            <span>Back to Departments</span>
                        </Link>
                        <span className="text-gray-500">|</span>
                        <Title>{department.name}</Title>
                        {department.code && (
                            <Badge size="lg" color="blue">
                                {department.code}
                            </Badge>
                        )}
                    </div>
                    <Link
                        href={route('departments.edit', {
                            school: school.id,
                            department: department.id,
                        })}
                    >
                        <Button icon={PencilIcon}>Edit Department</Button>
                    </Link>
                </div>

                {/* Department Info Section */}
                <Grid numItemsMd={3} className="mt-6 gap-6">
                    {/* Department Details */}
                    <Col numColSpanMd={2}>
                        <Card>
                            <Title>Department Details</Title>
                            <Divider />

                            <div className="mt-4 space-y-4">
                                <div>
                                    <Text className="text-gray-500">Name</Text>
                                    <Text className="text-lg font-medium">
                                        {department.name}
                                    </Text>
                                </div>

                                {department.code && (
                                    <div>
                                        <Text className="text-gray-500">
                                            Department Code
                                        </Text>
                                        <Text className="text-lg font-medium">
                                            {department.code}
                                        </Text>
                                    </div>
                                )}

                                <div className="pt-4">
                                    <Text className="mb-3 text-sm font-medium text-gray-500">
                                        Contact Information
                                    </Text>
                                    <div className="space-y-2">
                                        {department.contact &&
                                            department.contact.email && (
                                                <div className="flex items-center gap-2">
                                                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                                    <Text>
                                                        {
                                                            department.contact
                                                                .email
                                                        }
                                                    </Text>
                                                </div>
                                            )}

                                        {department.contact &&
                                            department.contact.phone && (
                                                <div className="flex items-center gap-2">
                                                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                                                    <Text>
                                                        {
                                                            department.contact
                                                                .phone
                                                        }
                                                    </Text>
                                                </div>
                                            )}

                                        {department.contact &&
                                            department.contact.office && (
                                                <div className="flex items-center gap-2">
                                                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                                                    <Text>
                                                        {
                                                            department.contact
                                                                .office
                                                        }
                                                    </Text>
                                                </div>
                                            )}

                                        {(!department.contact ||
                                            (!department.contact.email &&
                                                !department.contact.phone &&
                                                !department.contact
                                                    .office)) && (
                                            <Text className="text-gray-500">
                                                No contact information available
                                            </Text>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    {/* Stats */}
                    <Col>
                        <Card>
                            <Title>Department Statistics</Title>
                            <Divider />

                            <div className="mt-4 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <AcademicCapIcon className="mr-3 h-8 w-8 text-purple-500" />
                                        <div>
                                            <Text>Majors</Text>
                                            <Title>
                                                {department.majors?.length || 0}
                                            </Title>
                                        </div>
                                    </div>

                                    {hasMajors && (
                                        <Link
                                            href={route('majors.create', {
                                                school: school.id,
                                                department_id: department.id
                                            })}
                                        >
                                            <Button
                                                variant="light"
                                                icon={PlusIcon}
                                            >
                                                Add
                                            </Button>
                                        </Link>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <BookOpenIcon className="mr-3 h-8 w-8 text-green-500" />
                                        <div>
                                            <Text>Courses</Text>
                                            <Title>
                                                {department.courses?.length ||
                                                    0}
                                            </Title>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <UserGroupIcon className="mr-3 h-8 w-8 text-blue-500" />
                                        <div>
                                            <Text>Professors</Text>
                                            <Title>
                                                {department.professor_profiles
                                                    ?.length || 0}
                                            </Title>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Grid>

                {/* Main Content Section - Tabbed Interface */}
                <div className="mt-8">
                    <TabGroup>
                        <TabList className="mb-6">
                            <Tab icon={AcademicCapIcon}>
                                Majors
                                {hasMajors && (
                                    <Badge className="ml-2">
                                        {department.majors.length}
                                    </Badge>
                                )}
                            </Tab>
                            <Tab icon={BookOpenIcon}>
                                Courses
                                {hasCourses && (
                                    <Badge className="ml-2">
                                        {department.courses.length}
                                    </Badge>
                                )}
                            </Tab>
                            <Tab icon={UserGroupIcon}>
                                Professors
                                {hasProfessors && (
                                    <Badge className="ml-2">
                                        {department.professor_profiles.length}
                                    </Badge>
                                )}
                            </Tab>
                        </TabList>

                        <TabPanels>
                            {/* Majors Tab */}
                            <TabPanel>
                                <Card>
                                    <div className="flex items-center justify-between">
                                        <Title>Academic Majors</Title>
                                        <Link
                                            href={route('majors.create', {
                                                school: school.id,
                                                department_id: department.id
                                            })}
                                        >
                                            <Button icon={PlusIcon}>
                                                Add Major
                                            </Button>
                                        </Link>
                                    </div>
                                    <Divider />

                                    {hasMajors ? (
                                        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {department.majors.map((major) => (
                                                <Link
                                                    key={major.id}
                                                    href={route('majors.show', {
                                                        school: school.id,
                                                        major: major.id,
                                                    })}
                                                >
                                                    <Card
                                                        decoration="left"
                                                        decorationColor="blue"
                                                        className="transition-shadow hover:shadow-md"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <Badge color="blue">
                                                                    {major.code}
                                                                </Badge>
                                                                <Text className="mt-2 font-medium">
                                                                    {major.name ||
                                                                        major.code}
                                                                </Text>
                                                            </div>
                                                            <AcademicCapIcon className="h-10 w-10 text-blue-100" />
                                                        </div>
                                                        {major.description && (
                                                            <Text className="mt-2 line-clamp-2 text-sm text-gray-500">
                                                                {
                                                                    major.description
                                                                }
                                                            </Text>
                                                        )}
                                                    </Card>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center">
                                            <AcademicCapIcon className="mx-auto h-12 w-12 text-gray-300" />
                                            <Text className="mt-3 text-gray-500">
                                                No majors found in this
                                                department
                                            </Text>
                                            <Link
                                                href={route('majors.create', {
                                                    school: school.id,
                                                    department_id: department.id
                                                })}
                                                className="mt-4 inline-block"
                                            >
                                                <Button
                                                    variant="light"
                                                    icon={PlusIcon}
                                                >
                                                    Add your first major
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </Card>
                            </TabPanel>

                            {/* Courses Tab */}
                            <TabPanel>
                                <Card>
                                    <div className="flex items-center justify-between">
                                        <Title>Courses</Title>
                                        <Link
                                            href={route('courses.create', {
                                                school: school.id,
                                                department_id: department.id
                                            })}
                                        >
                                            <Button icon={PlusIcon}>
                                                Add Course
                                            </Button>
                                        </Link>
                                    </div>
                                    <Divider />

                                    {hasCourses ? (
                                        <div className="overflow-x-auto">
                                            <Table className="mt-4 w-full">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableHeaderCell className="w-1/4">
                                                            Course Code
                                                        </TableHeaderCell>
                                                        <TableHeaderCell className="w-2/4">
                                                            Title
                                                        </TableHeaderCell>
                                                        <TableHeaderCell className="w-1/4">
                                                            Actions
                                                        </TableHeaderCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {department.courses.map(
                                                        (course) => (
                                                            <TableRow
                                                                key={course.id}
                                                            >
                                                                <TableCell className="font-medium">
                                                                    {
                                                                        course.code
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        course.title
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Link
                                                                        href={route(
                                                                            'courses.show',
                                                                            {
                                                                                school: school.id,
                                                                                course: course.id,
                                                                            },
                                                                        )}
                                                                    >
                                                                        <Button
                                                                            size="xs"
                                                                            variant="light"
                                                                        >
                                                                            View
                                                                        </Button>
                                                                    </Link>
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="py-12 text-center">
                                            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-300" />
                                            <Text className="mt-3 text-gray-500">
                                                No courses found in this
                                                department
                                            </Text>
                                            <Link
                                                href={route('courses.create', {
                                                    school: school.id,
                                                    department_id: department.id
                                                })}
                                            >
                                                <Button
                                                    className="mt-4"
                                                    variant="light"
                                                    icon={PlusIcon}
                                                >
                                                    Add your first course
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </Card>
                            </TabPanel>

                            {/* Professors Tab */}
                            <TabPanel>
                                <Card>
                                    <div className="flex items-center justify-between">
                                        <Title>Faculty Members</Title>
                                        <div className="flex gap-2">
                                            <Link
                                                href={route('users.create', {
                                                    school: school.id,
                                                })}
                                            >
                                                <Button icon={PlusIcon}>
                                                    Add Professor
                                                </Button>
                                            </Link>
                                            <Link
                                                href={route('users.index', {
                                                    school: school.id,
                                                })}
                                            >
                                                <Button
                                                    variant="light"
                                                    size="xs"
                                                >
                                                    View All Users
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                    <Divider />

                                    {hasProfessors ? (
                                        <Table className="mt-4">
                                            <TableHead>
                                                <TableRow>
                                                    <TableHeaderCell>
                                                        Name
                                                    </TableHeaderCell>
                                                    <TableHeaderCell>
                                                        Email
                                                    </TableHeaderCell>
                                                    <TableHeaderCell>
                                                        Office
                                                    </TableHeaderCell>
                                                    <TableHeaderCell>
                                                        Phone
                                                    </TableHeaderCell>
                                                    <TableHeaderCell>
                                                        Actions
                                                    </TableHeaderCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {department.professor_profiles.map(
                                                    (professor) => (
                                                        <TableRow
                                                            key={professor.id}
                                                        >
                                                            <TableCell className="font-medium">
                                                                {professor.user
                                                                    ? professor
                                                                          .user
                                                                          .name
                                                                    : 'User not found'}
                                                            </TableCell>
                                                            <TableCell>
                                                                {professor.user
                                                                    ? professor
                                                                          .user
                                                                          .email
                                                                    : 'N/A'}
                                                            </TableCell>
                                                            <TableCell>
                                                                {professor.office ||
                                                                    'N/A'}
                                                            </TableCell>
                                                            <TableCell>
                                                                {professor.phone ||
                                                                    'N/A'}
                                                            </TableCell>
                                                            <TableCell>
                                                                {professor.user_id && (
                                                                    <Link
                                                                        href={route(
                                                                            'users.show',
                                                                            {
                                                                                school: school.id,
                                                                                user: professor.user_id,
                                                                            },
                                                                        )}
                                                                    >
                                                                        <Button
                                                                            size="xs"
                                                                            variant="light"
                                                                        >
                                                                            View
                                                                        </Button>
                                                                    </Link>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="py-12 text-center">
                                            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-300" />
                                            <Text className="mt-3 text-gray-500">
                                                No professors assigned to this
                                                department yet
                                            </Text>
                                            <Link
                                                href={route('users.create', {
                                                    school: school.id,
                                                })}
                                                className="mt-4 inline-block"
                                            >
                                                <Button
                                                    variant="light"
                                                    icon={PlusIcon}
                                                >
                                                    Add your first professor
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </Card>
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </div>
            </div>
        </AppLayout>
    );
}
