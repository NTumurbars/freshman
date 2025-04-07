import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage, Link, useForm } from '@inertiajs/react';
import { Card, Title, Text, Badge, Divider, Button, Flex, TextInput, Select, SelectItem } from '@tremor/react';
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
} from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Show() {
    const { user, auth, departments } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    const [editingProfile, setEditingProfile] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        department_id: user.professor_profile?.department_id || '',
        office_location: user.professor_profile?.office_location || '',
        phone_number: user.professor_profile?.phone_number || '',
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

    const RoleSpecificDetails = () => {
        // Based on role ID, render different components
        switch (user.role?.id) {
            case 3: // Professor
            case 4: // Coordinator/Head of Department
                return (
                    <Card className="mt-4">
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
                                            <label htmlFor="office_location" className="block text-sm font-medium text-gray-700 mb-1">
                                                Office Location
                                            </label>
                                            <TextInput
                                                id="office_location"
                                                name="office_location"
                                                placeholder="Office Location"
                                                value={data.office_location}
                                                onChange={(e) => handleChange('office_location', e.target.value)}
                                                error={!!errors.office_location}
                                                errorMessage={errors.office_location}
                                            />
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number
                                            </label>
                                            <TextInput
                                                id="phone_number"
                                                name="phone_number"
                                                placeholder="Phone Number"
                                                value={data.phone_number}
                                                onChange={(e) => handleChange('phone_number', e.target.value)}
                                                error={!!errors.phone_number}
                                                errorMessage={errors.phone_number}
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
                                ) : (
                                    <div className="space-y-3 mt-4">
                                        <div className="flex items-start">
                                            <BuildingOfficeIcon className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                                            <div>
                                                <Text className="font-medium">Department</Text>
                                                <Text>{user.professor_profile?.department?.name || 'Not assigned'}</Text>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start">
                                            <MapPinIcon className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                                            <div>
                                                <Text className="font-medium">Office Location</Text>
                                                <Text>{user.professor_profile?.office_location || 'Not specified'}</Text>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-start">
                                            <PhoneIcon className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                                            <div>
                                                <Text className="font-medium">Contact Number</Text>
                                                <Text>{user.professor_profile?.phone_number || 'Not specified'}</Text>
                                            </div>
                                        </div>
                                    </div>
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
                    <Card className="mt-4">
                        <Flex>
                            <div className="flex items-center">
                                <UserCircleIcon className="h-8 w-8 text-indigo-500 mr-3" />
                                <Title>Student Information</Title>
                            </div>
                        </Flex>
                        <Divider />

                        <div className="space-y-3 mt-4">
                            <div className="flex items-center">
                                <BookOpenIcon className="h-5 w-5 text-gray-500 mr-2" />
                                <Text>
                                    <span className="font-medium">Enrolled Courses: </span>
                                    {user.course_registrations?.length || 0}
                                </Text>
                            </div>
                            
                            {/* Additional student-specific details can be added here */}
                        </div>
                    </Card>
                );

            default: // Admin users
                return (
                    <Card className="mt-4">
                        <Flex>
                            <div className="flex items-center">
                                <UserIcon className="h-8 w-8 text-blue-500 mr-3" />
                                <Title>Administrative User</Title>
                            </div>
                        </Flex>
                        <Divider />
                        
                        <div className="bg-blue-50 p-4 rounded-md mt-4">
                            <Text>{getFormattedRoleName(user.role?.name)} has system management capabilities.</Text>
                        </div>
                    </Card>
                );
        }
    };

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title={user.name} />
            
            <div className="mx-auto max-w-4xl px-4 py-8">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
                    
                    <Link href={route('users.edit', user.id)}>
                        <Button color="blue" size="sm">Edit User</Button>
                    </Link>
                </div>
                
                <Card>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="bg-gray-100 p-3 rounded-full">
                                <UserIcon className="h-8 w-8 text-gray-500" />
                            </div>
                            <div>
                                <Title>{user.name}</Title>
                                <div className="flex items-center space-x-2">
                                    <EnvelopeIcon className="h-4 w-4 text-gray-500" />
                                    <Text>{user.email}</Text>
                                </div>
                            </div>
                        </div>
                        
                        <Badge color={getRoleBadgeColor(user.role?.id)} size="md">
                            {getFormattedRoleName(user.role?.name)}
                        </Badge>
                    </div>
                    
                    <Divider />
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Text className="font-medium">School</Text>
                            <Text>{school?.name || 'Not assigned'}</Text>
                        </div>
                        
                        <div>
                            <Text className="font-medium">User ID</Text>
                            <Text>#{user.id}</Text>
                        </div>
                    </div>
                </Card>
                
                <RoleSpecificDetails />
            </div>
        </AppLayout>
    );
}
