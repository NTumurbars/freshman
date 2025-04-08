// resources/js/Pages/Profile/Show.jsx

import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Card, Title, Text, Divider, Badge, Button, Grid, Col, Flex } from '@tremor/react';
import {
    UserCircleIcon,
    EnvelopeIcon,
    CalendarIcon,
    PencilIcon,
} from '@heroicons/react/24/outline';

export default function Show({ user, status }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    
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
    
    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="My Profile" />
            
            <div className="mx-auto max-w-4xl px-4 py-8">
                {status && (
                    <div className="mb-4 rounded-md bg-green-50 p-3 border border-green-200">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">
                                    {status}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                </div>
                
                <Grid numItemsMd={3} className="gap-6">
                    <Col numColSpanMd={1}>
                        <Card className="p-6">
                            <div className="flex flex-col items-center">
                                <div className="mb-4 h-32 w-32 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
                                    <UserCircleIcon className="h-24 w-24 text-gray-400" />
                                </div>
                                
                                <Title className="text-center">{user.name}</Title>
                                <Badge className="mt-2" color={getRoleBadgeColor(auth.user.role.id)} size="md">
                                    {getFormattedRoleName(auth.user.role?.name)}
                                </Badge>
                                
                                <Link
                                    href={route('profile.edit')}
                                    className="mt-4 w-full"
                                >
                                    <Button 
                                        icon={PencilIcon} 
                                        variant="secondary" 
                                        color="indigo"
                                        className="w-full"
                                    >
                                        Edit Profile
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    </Col>
                    
                    <Col numColSpanMd={2}>
                        <Card className="p-6">
                            <Title>Personal Information</Title>
                            <Divider className="my-4" />
                            
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                    <div>
                                        <Text className="font-medium">Email Address</Text>
                                        <Text>{user.email}</Text>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <CalendarIcon className="h-5 w-5 text-gray-500 mr-3 mt-0.5" />
                                    <div>
                                        <Text className="font-medium">Member Since</Text>
                                        <Text>{new Date(user.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long', 
                                            day: 'numeric'
                                        })}</Text>
                                    </div>
                                </div>
                                
                                {school && (
                                    <div className="flex items-start">
                                        <svg className="h-5 w-5 text-gray-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <div>
                                            <Text className="font-medium">School</Text>
                                            <Text>{school.name}</Text>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                        
                        {/* If user has role-specific information like professor or student */}
                        {auth.user.role.id === 3 || auth.user.role.id === 4 ? (
                            <Card className="p-6 mt-6">
                                <Title>Professor Information</Title>
                                <Divider className="my-4" />
                                
                                <div className="bg-amber-50 p-4 rounded-md">
                                    <Text>To view or edit your professor details, please visit the User Management section.</Text>
                                </div>
                            </Card>
                        ) : auth.user.role.id === 5 ? (
                            <Card className="p-6 mt-6">
                                <Title>Student Information</Title>
                                <Divider className="my-4" />
                                
                                <div className="bg-indigo-50 p-4 rounded-md">
                                    <Text>To view your student details and enrollments, please check the Courses section.</Text>
                                </div>
                            </Card>
                        ) : null}
                    </Col>
                </Grid>
            </div>
        </AppLayout>
    );
}
