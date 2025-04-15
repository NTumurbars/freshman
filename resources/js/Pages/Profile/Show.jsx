// resources/js/Pages/Profile/Show.jsx

import AppLayout from '@/Layouts/AppLayout';
import {
    AcademicCapIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    EnvelopeIcon,
    GlobeAltIcon,
    MapPinIcon,
    PencilIcon,
    PhoneIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Badge,
    Button,
    Card,
    Col,
    Divider,
    Grid,
    Text,
    Title,
} from '@tremor/react';

export default function Show({ user, status }) {
    const { auth, professorProfile } = usePage().props;
    const school = auth.user.school;

    // Ensure we have consistent access to professor profile data
    const profile = professorProfile || user.professor_profile;

    console.log("Profile data:", profile);

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

    const isProfessor = auth.user.role.id === 3 || auth.user.role.id === 4;

    return (
        <AppLayout>
            <Head title="My Profile" />

            <div className="mx-auto max-w-4xl px-4 py-8">
                {status && (
                    <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg
                                    className="h-5 w-5 text-green-400"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
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

                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Profile
                    </h1>
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
                                    color={getRoleBadgeColor(auth.user.role.id)}
                                    size="md"
                                >
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
                                    <EnvelopeIcon className="mr-3 mt-0.5 h-5 w-5 text-gray-500" />
                                    <div>
                                        <Text className="font-medium">
                                            Email Address
                                        </Text>
                                        <Text>{user.email}</Text>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <CalendarIcon className="mr-3 mt-0.5 h-5 w-5 text-gray-500" />
                                    <div>
                                        <Text className="font-medium">
                                            Member Since
                                        </Text>
                                        <Text>
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </Text>
                                    </div>
                                </div>

                                {school && (
                                    <div className="flex items-start">
                                        <svg
                                            className="mr-3 mt-0.5 h-5 w-5 text-gray-500"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                            />
                                        </svg>
                                        <div>
                                            <Text className="font-medium">
                                                School
                                            </Text>
                                            <Text>{school.name}</Text>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* If user has role-specific information like professor or student */}
                        {isProfessor && (
                            <Card className="mt-6 p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <AcademicCapIcon className="mr-3 h-6 w-6 text-amber-500" />
                                        <Title>Professor Information</Title>
                                    </div>
                                    <Link href={route('profile.edit')}>
                                        <Button
                                            icon={PencilIcon}
                                            variant="light"
                                            color="amber"
                                            size="xs"
                                        >
                                            Edit
                                        </Button>
                                    </Link>
                                </div>
                                <Divider className="my-4" />

                                {profile ? (
                                    <div className="space-y-5">
                                        <div className="flex items-start">
                                            <BuildingOfficeIcon className="mr-3 mt-0.5 h-5 w-5 text-amber-500" />
                                            <div>
                                                <Text className="font-medium">Department</Text>
                                                <Text className="text-gray-800 text-base">
                                                    {profile.department?.name || (
                                                        <span className="italic text-gray-500">Not assigned</span>
                                                    )}
                                                </Text>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <AcademicCapIcon className="mr-3 mt-0.5 h-5 w-5 text-amber-500" />
                                            <div>
                                                <Text className="font-medium">Academic Title</Text>
                                                <Text className="text-gray-800 text-base">
                                                    {profile.title || (
                                                        <span className="italic text-gray-500">Not specified</span>
                                                    )}
                                                </Text>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <MapPinIcon className="mr-3 mt-0.5 h-5 w-5 text-amber-500" />
                                            <div>
                                                <Text className="font-medium">Office Location</Text>
                                                <Text className="text-gray-800 text-base">
                                                    {profile.office || (
                                                        <span className="italic text-gray-500">Not specified</span>
                                                    )}
                                                </Text>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <PhoneIcon className="mr-3 mt-0.5 h-5 w-5 text-amber-500" />
                                            <div>
                                                <Text className="font-medium">Contact Phone</Text>
                                                <Text className="text-gray-800 text-base">
                                                    {profile.phone || (
                                                        <span className="italic text-gray-500">Not specified</span>
                                                    )}
                                                </Text>
                                            </div>
                                        </div>

                                        <div className="flex items-start">
                                            <GlobeAltIcon className="mr-3 mt-0.5 h-5 w-5 text-amber-500" />
                                            <div>
                                                <Text className="font-medium">Website</Text>
                                                {profile.website ? (
                                                    <a
                                                        href={profile.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 hover:underline"
                                                    >
                                                        {profile.website}
                                                    </a>
                                                ) : (
                                                    <Text className="italic text-gray-500">Not specified</Text>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-md bg-yellow-50 p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-yellow-800">Professor profile not set up</h3>
                                                <div className="mt-2 text-sm text-yellow-700">
                                                    <p>Your professor profile hasn't been created yet. Use the Edit button above to set up your profile.</p>
                                                </div>
                                                <div className="mt-3">
                                                    <Link href={route('profile.edit')}>
                                                        <Button
                                                            variant="light"
                                                            color="amber"
                                                            size="xs"
                                                            icon={PencilIcon}
                                                        >
                                                            Set Up Profile
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        )}
                    </Col>
                </Grid>
            </div>
        </AppLayout>
    );
}
