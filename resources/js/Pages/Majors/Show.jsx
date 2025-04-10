import AppLayout from '@/Layouts/AppLayout';
import {
    ArrowLeftIcon,
    BookOpenIcon,
    PencilIcon,
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

export default function Show({ major, school }) {
    // Check if we actually have courses
    const hasCourses = Array.isArray(major.courses) && major.courses.length > 0;

    return (
        <AppLayout>
            <Head title={`${major.code} - Major Details`} />

            <div className="px-4 py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('majors.index', { school: school.id })}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                            <ArrowLeftIcon className="mr-1 h-4 w-4" />
                            <span>Back to Majors</span>
                        </Link>
                        <span className="text-gray-500">|</span>
                        <Title>{major.name || major.code}</Title>
                        <Badge size="lg" color="blue">
                            {major.code}
                        </Badge>
                    </div>
                    <Link
                        href={route('majors.edit', {
                            school: school.id,
                            major: major.id,
                        })}
                    >
                        <Button icon={PencilIcon}>Edit Major</Button>
                    </Link>
                </div>

                {/* Major Info Section */}
                <Grid numItemsMd={3} className="mt-6 gap-6">
                    {/* Major Details */}
                    <Col numColSpanMd={2}>
                        <Card>
                            <Title>Major Details</Title>
                            <Divider />

                            <div className="mt-4 space-y-4">
                                <div>
                                    <Text className="text-gray-500">
                                        Department
                                    </Text>
                                    <Link
                                        href={route('departments.show', {
                                            school: school.id,
                                            department: major.department.id,
                                        })}
                                        className="text-blue-600 hover:underline"
                                    >
                                        <Text className="text-lg font-medium">
                                            {major.department.name}
                                        </Text>
                                    </Link>
                                </div>

                                <div>
                                    <Text className="text-gray-500">Code</Text>
                                    <Text className="text-lg font-medium">
                                        {major.code}
                                    </Text>
                                </div>

                                {major.name && (
                                    <div>
                                        <Text className="text-gray-500">
                                            Full Name
                                        </Text>
                                        <Text className="text-lg font-medium">
                                            {major.name}
                                        </Text>
                                    </div>
                                )}

                                {major.description && (
                                    <div>
                                        <Text className="text-gray-500">
                                            Description
                                        </Text>
                                        <Text>{major.description}</Text>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </Col>

                    {/* Stats */}
                    <Col>
                        <Card>
                            <Title>Major Statistics</Title>
                            <Divider />

                            <div className="mt-4 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <BookOpenIcon className="mr-3 h-8 w-8 text-green-500" />
                                        <div>
                                            <Text>Courses</Text>
                                            <Title>
                                                {major.courses?.length || 0}
                                            </Title>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <UserGroupIcon className="mr-3 h-8 w-8 text-blue-500" />
                                        <div>
                                            <Text>Students</Text>
                                            <Title>0</Title>
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
                            <Tab icon={BookOpenIcon}>
                                Courses
                                {hasCourses && (
                                    <Badge className="ml-2">
                                        {major.courses.length}
                                    </Badge>
                                )}
                            </Tab>
                            <Tab icon={UserGroupIcon}>
                                Students
                                <Badge className="ml-2">0</Badge>
                            </Tab>
                        </TabList>

                        <TabPanels>
                            {/* Courses Tab */}
                            <TabPanel>
                                <Card>
                                    <div className="flex items-center justify-between">
                                        <Title>Courses in this Major</Title>
                                        <Link
                                            href={route('courses.create', {
                                                school: school.id,
                                            })}
                                        >
                                            <Button icon={PlusIcon}>
                                                Add Course
                                            </Button>
                                        </Link>
                                    </div>
                                    <Divider />

                                    {hasCourses ? (
                                        <Table className="mt-4">
                                            <TableHead>
                                                <TableRow>
                                                    <TableHeaderCell>
                                                        Course Code
                                                    </TableHeaderCell>
                                                    <TableHeaderCell>
                                                        Title
                                                    </TableHeaderCell>
                                                    <TableHeaderCell>
                                                        Actions
                                                    </TableHeaderCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {major.courses.map((course) => (
                                                    <TableRow key={course.id}>
                                                        <TableCell className="font-medium">
                                                            {course.code}
                                                        </TableCell>
                                                        <TableCell>
                                                            {course.title}
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
                                                ))}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <div className="py-12 text-center">
                                            <BookOpenIcon className="mx-auto h-12 w-12 text-gray-300" />
                                            <Text className="mt-3 text-gray-500">
                                                No courses associated with this
                                                major yet
                                            </Text>
                                            <Link
                                                href={route('courses.create', {
                                                    school: school.id,
                                                })}
                                                className="mt-4 inline-block"
                                            >
                                                <Button
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

                            {/* Students Tab */}
                            <TabPanel>
                                <Card>
                                    <div className="flex items-center justify-between">
                                        <Title>Students in this Major</Title>
                                        <Link
                                            href={route('users.create', {
                                                school: school.id,
                                            })}
                                        >
                                            <Button icon={PlusIcon}>
                                                Add Student
                                            </Button>
                                        </Link>
                                    </div>
                                    <Divider />

                                    <div className="py-12 text-center">
                                        <UserGroupIcon className="mx-auto h-12 w-12 text-gray-300" />
                                        <Text className="mt-3 text-gray-500">
                                            No students enrolled in this major
                                            yet
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
                                                Add your first student
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </div>
            </div>
        </AppLayout>
    );
}
