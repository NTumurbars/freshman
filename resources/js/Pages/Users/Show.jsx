import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import { Card, Title, Text, Badge, Divider, Button, Flex, TextInput, Select, SelectItem, Grid, Col, Metric, Tab, TabGroup, TabList, TabPanel, TabPanels } from '@tremor/react';
import {
    UserIcon,
    AcademicCapIcon,
    BuildingOfficeIcon,
    PhoneIcon,
    MapPinIcon,
    EnvelopeIcon,
    UserCircleIcon,
    BookOpenIcon,
    PencilIcon,
    GlobeAltIcon,
    AcademicCapIcon as AcademicCapSolid,
    CalendarIcon,
    IdentificationIcon,
    ChevronLeftIcon,
    BookmarkIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Show() {
    const { user, auth, departments } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    const [editingProfile, setEditingProfile] = useState(false);

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
        post(route('professorProfile.update', user.id), {
            onSuccess: () => {
                setEditingProfile(false);
            }
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
            day: 'numeric'
        });
    };

    const ProfessorProfileForm = () => (
        <form onSubmit={submitProfileEdit} className="mt-4 space-y-4">
            <div>
                <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                </label>
                <Select
                    id="department_id"
                    value={data.department_id.toString()}
                    onValueChange={(value) => handleChange('department_id', value)}
                    placeholder="Select Department"
                    error={!!errors.department_id}
                    errorMessage={errors.department_id}
                >
                    {departments && departments.length > 0 ? 
                        departments.map((department) => (
                            <SelectItem key={department.id} value={department.id.toString()}>
                                {department.name}
                            </SelectItem>
                        )) : 
                        <SelectItem value="" disabled>
                            No departments available
                        </SelectItem>
                    }
                </Select>
            </div>
            
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
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
                <label htmlFor="office" className="block text-sm font-medium text-gray-700 mb-1">
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
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
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
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
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
                <Button
                    type="submit"
                    color="amber"
                    disabled={processing}
                >
                    {processing ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );

    const ProfessorProfileView = () => (
        <div className="space-y-5 mt-4">
            <div className="flex items-start">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                    <Text className="font-medium">Department</Text>
                    <Text>{user.professor_profile?.department?.name || 'Not assigned'}</Text>
                </div>
            </div>
            
            <div className="flex items-start">
                <AcademicCapSolid className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                    <Text className="font-medium">Title</Text>
                    <Text>{user.professor_profile?.title || 'Not specified'}</Text>
                </div>
            </div>
            
            <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                    <Text className="font-medium">Office Location</Text>
                    <Text>{user.professor_profile?.office || 'Not specified'}</Text>
                </div>
            </div>
            
            <div className="flex items-start">
                <PhoneIcon className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                    <Text className="font-medium">Contact Number</Text>
                    <Text>{user.professor_profile?.phone || 'Not specified'}</Text>
                </div>
            </div>
            
            <div className="flex items-start">
                <GlobeAltIcon className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                <div>
                    <Text className="font-medium">Website</Text>
                    <Text>{user.professor_profile?.website ? (
                        <a href={user.professor_profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                            {user.professor_profile.website}
                        </a>
                    ) : 'Not specified'}</Text>
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
                                <AcademicCapIcon className="h-8 w-8 text-amber-500 mr-3" />
                                <Title>Professor Information</Title>
                            </div>
                            {user.professor_profile && (
                                <Button 
                                    size="xs" 
                                    color="amber" 
                                    icon={PencilIcon}
                                    onClick={() => setEditingProfile(!editingProfile)}
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
                            <div className="bg-amber-50 p-4 rounded-md mt-4">
                                <Text>This professor has not completed their profile yet.</Text>
                            </div>
                        )}
                    </Card>
                );
                
            case 5: // Student
                return (
                    <Card className="mt-6">
                        <Flex justifyContent="between" alignItems="center">
                            <div className="flex items-center">
                                <UserCircleIcon className="h-8 w-8 text-indigo-500 mr-3" />
                                <Title>Student Information</Title>
                            </div>
                        </Flex>
                        <Divider />

                        <div className="space-y-5 mt-4">
                            <div className="flex items-center">
                                <BookOpenIcon className="h-5 w-5 text-indigo-500 mr-3" />
                                <div>
                                    <Text className="font-medium">Enrolled Courses</Text>
                                    <Text>{user.course_registrations?.length || 0}</Text>
                                </div>
                            </div>

                            {user.course_registrations && user.course_registrations.length > 0 ? (
                                <div className="mt-2 bg-indigo-50 p-4 rounded-md">
                                    <Text>
                                        View details in the Courses section to see enrollment history and current courses.
                                    </Text>
                                </div>
                            ) : (
                                <div className="mt-2 bg-indigo-50 p-4 rounded-md">
                                    <Text>This student is not enrolled in any courses yet.</Text>
                                </div>
                            )}
                            
                            {/* Additional student-specific details can be added here */}
                        </div>
                    </Card>
                );

            default: // Admin users
                return (
                    <Card className="mt-6">
                        <Flex justifyContent="between" alignItems="center">
                            <div className="flex items-center">
                                <IdentificationIcon className="h-8 w-8 text-blue-500 mr-3" />
                                <Title>Administrative User</Title>
                            </div>
                        </Flex>
                        <Divider />
                        
                        <div className="mt-4">
                            <div className="flex items-center mb-4">
                                <Badge color={getRoleBadgeColor(user.role?.id)} size="xl">
                                    {getFormattedRoleName(user.role?.name)}
                                </Badge>
                            </div>
                            
                            <div className="bg-blue-50 p-4 rounded-md">
                                <Text>This user has system management capabilities according to their role permissions.</Text>
                            </div>
                        </div>
                    </Card>
                );
        }
    };

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title={user.name} />
            
            <div className="mx-auto max-w-6xl px-4 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Link 
                        href={route('users.index')} 
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        <span>Back to Users</span>
                    </Link>
                </div>
            
                <Grid numItemsMd={3} className="gap-6">
                    <Col numColSpanMd={1}>
                        <Card className="p-6">
                            <div className="flex flex-col items-center">
                                <div className="mb-4 h-32 w-32 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
                                    <UserCircleIcon className="h-24 w-24 text-gray-400" />
                                </div>
                                
                                <Title className="text-center">{user.name}</Title>
                                <Badge className="mt-2" color={getRoleBadgeColor(user.role?.id)} size="md">
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
                                <Text className="font-semibold">Contact Information</Text>
                                
                                <div className="flex items-center text-sm">
                                    <EnvelopeIcon className="h-4 w-4 text-gray-500 mr-2" />
                                    <Text>{user.email}</Text>
                                </div>
                                
                                <div className="flex items-center text-sm">
                                    <CalendarIcon className="h-4 w-4 text-gray-500 mr-2" />
                                    <Text>Joined {getCreatedDate(user.created_at)}</Text>
                                </div>
                                
                                <div className="flex items-center text-sm">
                                    <IdentificationIcon className="h-4 w-4 text-gray-500 mr-2" />
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
                                    {(user.role?.id === 3 || user.role?.id === 4) && <Tab icon={AcademicCapIcon}>Professor Info</Tab>}
                                    {user.role?.id === 5 && <Tab icon={BookmarkIcon}>Student Info</Tab>}
                                </TabList>
                                
                                <TabPanels>
                                    <TabPanel>
                                        <div className="p-4">
                                            <div className="mb-6">
                                                <Title>User Information</Title>
                                                <Text>Basic information about this user account.</Text>
                                            </div>
                                            
                                            <Grid numItemsMd={2} className="gap-6">
                                                <Col>
                                                    <div className="bg-gray-50 p-4 rounded-md">
                                                        <Text className="font-medium">School</Text>
                                                        <Text className="text-lg">{school?.name || 'Not assigned'}</Text>
                                                    </div>
                                                </Col>
                                                
                                                <Col>
                                                    <div className="bg-gray-50 p-4 rounded-md">
                                                        <Text className="font-medium">Role</Text>
                                                        <Text className="text-lg">{getFormattedRoleName(user.role?.name)}</Text>
                                                    </div>
                                                </Col>
                                            </Grid>
                                            
                                            <div className="mt-6">
                                                <Text className="font-medium mb-2">Additional Information</Text>
                                                
                                                <div className="bg-blue-50 p-4 rounded-md">
                                                    <Text>
                                                        This user was created on {getCreatedDate(user.created_at)}.
                                                    </Text>
                                                </div>
                                            </div>
                                        </div>
                                    </TabPanel>
                                    
                                    {(user.role?.id === 3 || user.role?.id === 4) && (
                                        <TabPanel>
                                            <div className="p-4">
                                                <div className="mb-6">
                                                    <Title>Professor Details</Title>
                                                    <Text>Academic information for this professor.</Text>
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
                                                                        icon={PencilIcon}
                                                                        onClick={() => setEditingProfile(true)}
                                                                    >
                                                                        Edit Profile
                                                                    </Button>
                                                                </Flex>
                                                                <ProfessorProfileView />
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="bg-amber-50 p-4 rounded-md">
                                                        <Text>This professor has not completed their profile yet.</Text>
                                                    </div>
                                                )}
                                            </div>
                                        </TabPanel>
                                    )}
                                    
                                    {user.role?.id === 5 && (
                                        <TabPanel>
                                            <div className="p-4">
                                                <div className="mb-6">
                                                    <Title>Student Details</Title>
                                                    <Text>Enrollment information for this student.</Text>
                                                </div>
                                                
                                                <div className="space-y-5 mt-4">
                                                    <div className="flex items-center">
                                                        <BookOpenIcon className="h-5 w-5 text-indigo-500 mr-3" />
                                                        <div>
                                                            <Text className="font-medium">Enrolled Courses</Text>
                                                            <Text>{user.course_registrations?.length || 0}</Text>
                                                        </div>
                                                    </div>
                                                    
                                                    {user.course_registrations && user.course_registrations.length > 0 ? (
                                                        <div className="mt-2 bg-indigo-50 p-4 rounded-md">
                                                            <Text>
                                                                View details in the Courses section to see enrollment history.
                                                            </Text>
                                                        </div>
                                                    ) : (
                                                        <div className="mt-2 bg-indigo-50 p-4 rounded-md">
                                                            <Text>This student is not enrolled in any courses yet.</Text>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </TabPanel>
                                    )}
                                </TabPanels>
                            </TabGroup>
                        </Card>
                        
                        {/* Keep the standalone role-specific card if preferred over the tabbed interface */}
                        {/* <RoleSpecificDetails /> */}
                    </Col>
                </Grid>
            </div>
        </AppLayout>
    );
}
