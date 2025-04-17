import AppLayout from '@/Layouts/AppLayout';
import {
    AcademicCapIcon,
    AcademicCapIcon as AcademicCapSolid,
    ArrowLeftIcon,
    BookmarkIcon,
    BookOpenIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    IdentificationIcon,
    MapPinIcon,
    PencilIcon,
    PhoneIcon,
    UserCircleIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Badge,
    Button,
    Card,
    Col,
    Divider,
    Flex,
    Grid,
    Select,
    SelectItem,
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels,
    Text,
    TextInput,
    Title,
} from '@tremor/react';
import { useState } from 'react';

export default function Show() {
    const { user, auth, departments } = usePage().props;
    const school = auth.user?.school;
    const [editingProfile, setEditingProfile] = useState(false);
    const [activeTab, setActiveTab] = useState(0);

    // Log the user data with course registrations
    console.log("User data in Show component:", user);
    console.log("Course registrations:", user.courseRegistrations || []);
    console.log("Legacy course_registrations:", user.course_registrations || []);

    // Helper function to get course registrations from either property
    const getCourseRegistrations = () => {
        return user.courseRegistrations || user.course_registrations || [];
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        department_id: user.professor_profile?.department_id || '',
        title: user.professor_profile?.title || '',
        office: user.professor_profile?.office || '',
        phone: user.professor_profile?.phone || '',
        website: user.professor_profile?.website || '',
    });

    const handleChange = (name, value) => {
        setData(name, value);
    };

    const submitProfileEdit = (e) => {
        e.preventDefault();
        post(route('professor_profile.update', user.id), {
            onSuccess: () => {
                setEditingProfile(false);
            },
        });
    };

    const getRoleBadgeColor = (roleId) => {
        const colorMap = {
            1: 'blue', // super admin
            2: 'purple', // school admin
            3: 'amber', // professor
            4: 'emerald', // coordinator
            5: 'indigo', // student
        };
        return colorMap[roleId] || 'gray';
    };

    const getFormattedRoleName = (roleName) => {
        return roleName?.replace('_', ' ').toUpperCase() || 'N/A';
    };

    const getCreatedDate = (date) => {
        if (!date) return 'Unknown';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const ProfessorProfileForm = () => (
        <form onSubmit={submitProfileEdit} className="mt-4 space-y-4">
            <div>
                <label
                    htmlFor="department_id"
                    className="mb-1 block text-sm font-medium text-gray-700"
                >
                    Department
                </label>
                <Select
                    id="department_id"
                    value={data.department_id.toString()}
                    onValueChange={(value) =>
                        handleChange('department_id', value)
                    }
                    placeholder="Select Department"
                    error={!!errors.department_id}
                    errorMessage={errors.department_id}
                >
                    {departments && departments.length > 0 ? (
                        departments.map((department) => (
                            <SelectItem
                                key={department.id}
                                value={department.id.toString()}
                            >
                                {department.name}
                            </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="" disabled>
                            No departments available
                        </SelectItem>
                    )}
                </Select>
            </div>

            <div>
                <label
                    htmlFor="title"
                    className="mb-1 block text-sm font-medium text-gray-700"
                >
                    Title
                </label>
                <TextInput
                    id="title"
                    name="title"
                    placeholder="Title (e.g. Professor, Assistant Professor)"
                    value={data.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    error={!!errors.title}
                    errorMessage={errors.title}
                />
            </div>

            <div>
                <label
                    htmlFor="office"
                    className="mb-1 block text-sm font-medium text-gray-700"
                >
                    Office Location
                </label>
                <TextInput
                    id="office"
                    name="office"
                    placeholder="Office Location"
                    value={data.office}
                    onChange={(e) => handleChange('office', e.target.value)}
                    error={!!errors.office}
                    errorMessage={errors.office}
                />
            </div>

            <div>
                <label
                    htmlFor="phone"
                    className="mb-1 block text-sm font-medium text-gray-700"
                >
                    Phone Number
                </label>
                <TextInput
                    id="phone"
                    name="phone"
                    placeholder="Phone Number"
                    value={data.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    error={!!errors.phone}
                    errorMessage={errors.phone}
                />
            </div>

            <div>
                <label
                    htmlFor="website"
                    className="mb-1 block text-sm font-medium text-gray-700"
                >
                    Website
                </label>
                <TextInput
                    id="website"
                    name="website"
                    placeholder="Website URL"
                    value={data.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    error={!!errors.website}
                    errorMessage={errors.website}
                />
            </div>

            <div className="flex justify-end pt-2">
                <Button type="submit" color="amber" disabled={processing}>
                    {processing ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );

    const ProfessorProfileView = () => (
        <div className="mt-4 space-y-5">
            <div className="flex items-start">
                <BuildingOfficeIcon className="mr-3 mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                    <Text className="font-medium">Department</Text>
                    <Text>
                        {user.professor_profile?.department?.name ||
                            'Not assigned'}
                    </Text>
                </div>
            </div>

            <div className="flex items-start">
                <AcademicCapSolid className="mr-3 mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                    <Text className="font-medium">Title</Text>
                    <Text>
                        {user.professor_profile?.title || 'Not specified'}
                    </Text>
                </div>
            </div>

            <div className="flex items-start">
                <MapPinIcon className="mr-3 mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                    <Text className="font-medium">Office Location</Text>
                    <Text>
                        {user.professor_profile?.office || 'Not specified'}
                    </Text>
                </div>
            </div>

            <div className="flex items-start">
                <PhoneIcon className="mr-3 mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                    <Text className="font-medium">Contact Number</Text>
                    <Text>
                        {user.professor_profile?.phone || 'Not specified'}
                    </Text>
                </div>
            </div>

            <div className="flex items-start">
                <GlobeAltIcon className="mr-3 mt-0.5 h-5 w-5 text-gray-500" />
                <div>
                    <Text className="font-medium">Website</Text>
                    <Text>
                        {user.professor_profile?.website ? (
                            <a
                                href={user.professor_profile.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                            >
                                {user.professor_profile.website}
                            </a>
                        ) : (
                            'Not specified'
                        )}
                    </Text>
                </div>
            </div>
        </div>
    );

    const RoleSpecificDetails = () => {
        // Based on role ID, render different components
        switch (user.role?.id) {
            case 3: // Professor
            case 4: // Coordinator/Head of Department
                return (
                    <Card className="mt-6">
                        <Flex justifyContent="between" alignItems="center">
                            <div className="flex items-center">
                                <AcademicCapIcon className="mr-3 h-8 w-8 text-amber-500" />
                                <Title>Professor Information</Title>
                            </div>
                            {user.professor_profile && (
                                <Button
                                    size="xs"
                                    color="amber"
                                    icon={PencilIcon}
                                    onClick={() =>
                                        setEditingProfile(!editingProfile)
                                    }
                                >
                                    {editingProfile ? 'Cancel' : 'Edit Profile'}
                                </Button>
                            )}
                        </Flex>
                        <Divider />

                        {user.professor_profile ? (
                            <>
                                {editingProfile ? (
                                    <ProfessorProfileForm />
                                ) : (
                                    <ProfessorProfileView />
                                )}
                            </>
                        ) : (
                            <div className="mt-4 rounded-md bg-amber-50 p-4">
                                <Text>
                                    This professor has not completed their
                                    profile yet.
                                </Text>
                            </div>
                        )}
                    </Card>
                );

            case 5: // Student
                return (
                    <Card className="mt-6">
                        <Flex justifyContent="between" alignItems="center">
                            <div className="flex items-center">
                                <UserCircleIcon className="mr-3 h-8 w-8 text-indigo-500" />
                                <Title>Student Information</Title>
                            </div>
                        </Flex>
                        <Divider />

                        <div className="mt-4 space-y-5 p-4">
                            <div className="flex items-center bg-indigo-50 p-4 rounded-lg">
                                <BookOpenIcon className="mr-3 h-6 w-6 text-indigo-600" />
                                <div>
                                    <Text className="font-medium text-lg">
                                        Enrolled Courses
                                    </Text>
                                    <Text className="text-indigo-700 font-bold text-xl">
                                        {user.courseRegistrations?.length || 0}
                                    </Text>
                                </div>
                            </div>

                            {/* Course Registrations List */}
                            <div className="mt-6 border-t pt-4">
                                <Text className="font-medium text-lg mb-3">
                                    Course Registrations
                                </Text>

                                {user.courseRegistrations && user.courseRegistrations.length > 0 ? (
                                    <div className="overflow-auto max-w-full rounded-lg shadow">
                                        <table className="min-w-full divide-y divide-gray-200 table-fixed">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th scope="col" className="w-1/3 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Course
                                                    </th>
                                                    <th scope="col" className="w-1/5 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Section
                                                    </th>
                                                    <th scope="col" className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Professor
                                                    </th>
                                                    <th scope="col" className="w-1/4 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Schedule
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {user.courseRegistrations.map((reg) => (
                                                    <tr key={reg.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3">
                                                            <div className="flex flex-col">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {reg.section?.course?.id ? (
                                                                        <Link
                                                                            href={route('courses.show', [user.school?.id, reg.section.course.id])}
                                                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                                                        >
                                                                            {reg.section.course.code || 'N/A'}
                                                                        </Link>
                                                                    ) : (
                                                                        reg.section?.course?.code || 'N/A'
                                                                    )}
                                                                </div>
                                                                <div className="text-sm text-gray-500 truncate">
                                                                    {reg.section?.course?.title || 'Unknown Course'}
                                                                </div>
                                                                {reg.section?.course?.credits && (
                                                                    <span className="inline-flex mt-1 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                                        {reg.section.course.credits} Credits
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="text-sm text-gray-900">
                                                                {reg.section?.id ? (
                                                                    <Link
                                                                        href={route('sections.show', [user.school?.id, reg.section.id])}
                                                                        className="text-blue-600 hover:text-blue-800 hover:underline"
                                                                    >
                                                                        {reg.section.section_code || `Section ${reg.section_id}`}
                                                                    </Link>
                                                                ) : (
                                                                    reg.section?.section_code || `Section ${reg.section_id}`
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                Registered {new Date(reg.created_at).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center">
                                                                <div className="flex-shrink-0 mr-2">
                                                                    <div className="h-7 w-7 bg-gray-100 rounded-full flex items-center justify-center">
                                                                        <UserCircleIcon className="h-5 w-5 text-gray-500" />
                                                                    </div>
                                                                </div>
                                                                <div className="text-sm text-gray-900 truncate max-w-[120px]">
                                                                    {reg.section?.professor_profile?.user?.name || 'Not assigned'}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-500">
                                                            {reg.section?.schedules?.length > 0 ? (
                                                                <div className="space-y-1 text-xs">
                                                                    {reg.section.schedules.map((schedule, idx) => (
                                                                        <div key={idx} className="flex items-center">
                                                                            <CalendarIcon className="h-3 w-3 mr-1 text-indigo-500 flex-shrink-0" />
                                                                            <span className="truncate">
                                                                                {schedule.day_of_week || ''} {schedule.start_time || ''} - {schedule.end_time || ''}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                'No schedule'
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="mt-2 rounded-lg bg-indigo-50 p-6 text-center">
                                        <BookOpenIcon className="h-12 w-12 text-indigo-300 mx-auto mb-3" />
                                        <Text className="text-lg font-medium text-indigo-900">
                                            No Course Registrations
                                        </Text>
                                        <Text className="text-indigo-700 mt-1">
                                            This student is not currently enrolled in any courses.
                                        </Text>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                );

            default: // Admin users
                return (
                    <Card className="mt-6">
                        <Flex justifyContent="between" alignItems="center">
                            <div className="flex items-center">
                                <IdentificationIcon className="mr-3 h-8 w-8 text-blue-500" />
                                <Title>Administrative User</Title>
                            </div>
                        </Flex>
                        <Divider />

                        <div className="mt-4">
                            <div className="mb-4 flex items-center">
                                <Badge
                                    color={getRoleBadgeColor(user.role?.id)}
                                    size="xl"
                                >
                                    {getFormattedRoleName(user.role?.name)}
                                </Badge>
                            </div>

                            <div className="rounded-md bg-blue-50 p-4">
                                <Text>
                                    This user has system management capabilities
                                    according to their role permissions.
                                </Text>
                            </div>
                        </div>
                    </Card>
                );
        }
    };

    return (
        <AppLayout>
            <Head title={user.name} />

            <div className="mx-auto max-w-6xl px-4 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        href={route('users.index')}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                        <ArrowLeftIcon className="mr-1 h-4 w-4" />
                        <span>Back to Users</span>
                    </Link>
                </div>

                <Grid numItemsMd={3} className="gap-6">
                    <Col numColSpanMd={1}>
                        <Card className="p-6">
                            <div className="flex flex-col items-center">
                                <div className="mb-4 flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                                    <UserCircleIcon className="h-24 w-24 text-gray-400" />
                                </div>

                                <Title className="text-center">
                                    {user.name}
                                </Title>
                                <Badge
                                    className="mt-2"
                                    color={getRoleBadgeColor(user.role?.id)}
                                    size="md"
                                >
                                    {getFormattedRoleName(user.role?.name)}
                                </Badge>

                                <Link
                                    href={route('users.edit', user.id)}
                                    className="mt-4 w-full"
                                >
                                    <Button
                                        icon={PencilIcon}
                                        color="blue"
                                        className="w-full"
                                    >
                                        Edit User
                                    </Button>
                                </Link>
                            </div>

                            <Divider className="my-6" />

                            {/* Contact Information */}
                            <div className="space-y-3">
                                <Text className="font-semibold">
                                    Contact Information
                                </Text>

                                <div className="flex items-center text-sm">
                                    <EnvelopeIcon className="mr-2 h-4 w-4 text-gray-500" />
                                    <Text>{user.email}</Text>
                                </div>

                                <div className="flex items-center text-sm">
                                    <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                    <Text>
                                        Joined {getCreatedDate(user.created_at)}
                                    </Text>
                                </div>

                                <div className="flex items-center text-sm">
                                    <IdentificationIcon className="mr-2 h-4 w-4 text-gray-500" />
                                    <Text>ID: #{user.id}</Text>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col numColSpanMd={2}>
                        <Card>
                            <TabGroup>
                                <TabList className="mt-2">
                                    <Tab icon={UserIcon}>Profile Details</Tab>
                                    {user.role?.id === 3 || user.role?.id === 4 ? (
                                        <Tab icon={AcademicCapIcon}>Professor Info</Tab>
                                    ) : null}
                                </TabList>

                                <TabPanels>
                                    {/* Profile Details Tab - Always present */}
                                    <TabPanel>
                                        <div className="p-4">
                                            <div className="mb-6">
                                                <Title>User Information</Title>
                                                <Text>
                                                    Basic information about this
                                                    user account.
                                                </Text>
                                            </div>

                                            <Grid
                                                numItemsMd={2}
                                                className="gap-6"
                                            >
                                                <Col>
                                                    <div className="rounded-md bg-gray-50 p-4">
                                                        <Text className="font-medium">
                                                            School
                                                        </Text>
                                                        <Text className="text-lg">
                                                            {user.school
                                                                ?.name ||
                                                                'Not assigned'}
                                                        </Text>
                                                    </div>
                                                </Col>

                                                <Col>
                                                    <div className="rounded-md bg-gray-50 p-4">
                                                        <Text className="font-medium">
                                                            Role
                                                        </Text>
                                                        <Text className="text-lg">
                                                            {getFormattedRoleName(
                                                                user.role?.name,
                                                            )}
                                                        </Text>
                                                    </div>
                                                </Col>
                                            </Grid>

                                            <div className="mt-6">
                                                <Text className="mb-2 font-medium">
                                                    Additional Information
                                                </Text>

                                                <div className="rounded-md bg-blue-50 p-4">
                                                    <Text>
                                                        This user was created on{' '}
                                                        {getCreatedDate(
                                                            user.created_at,
                                                        )}
                                                        .
                                                    </Text>
                                                </div>
                                            </div>
                                        </div>
                                    </TabPanel>

                                    {/* Professor Info Tab - Only render if user is a professor */}
                                    {user.role?.id === 3 || user.role?.id === 4 ? (
                                        <TabPanel>
                                            <div className="p-4">
                                                <div className="mb-6">
                                                    <Title>
                                                        Professor Details
                                                    </Title>
                                                    <Text>
                                                        Academic information for
                                                        this professor.
                                                    </Text>
                                                </div>

                                                {user.professor_profile ? (
                                                    <>
                                                        {editingProfile ? (
                                                            <ProfessorProfileForm />
                                                        ) : (
                                                            <div className="space-y-4">
                                                                <Flex justifyContent="end">
                                                                    <Button
                                                                        size="xs"
                                                                        color="amber"
                                                                        icon={
                                                                            PencilIcon
                                                                        }
                                                                        onClick={() =>
                                                                            setEditingProfile(
                                                                                true,
                                                                            )
                                                                        }
                                                                    >
                                                                        Edit
                                                                        Profile
                                                                    </Button>
                                                                </Flex>
                                                                <ProfessorProfileView />
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="rounded-md bg-amber-50 p-4">
                                                        <Text>
                                                            This professor has
                                                            not completed their
                                                            profile yet.
                                                        </Text>
                                                    </div>
                                                )}
                                            </div>
                                        </TabPanel>
                                    ) : null}
                                </TabPanels>
                            </TabGroup>
                        </Card>

                        {/* Keep the standalone role-specific card if preferred over the tabbed interface */}
                        <RoleSpecificDetails />
                    </Col>
                </Grid>
            </div>
        </AppLayout>
    );
}
