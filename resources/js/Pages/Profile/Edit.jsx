import AppLayout from '@/Layouts/AppLayout';
import {
    ArrowLeftIcon,
    KeyIcon,
    UserCircleIcon,
    AcademicCapIcon,
    BuildingOfficeIcon,
    PhoneIcon,
    GlobeAltIcon,
    MapPinIcon,
} from '@heroicons/react/24/outline';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    Button,
    Card,
    Col,
    Divider,
    Grid,
    Text,
    TextInput,
    Title,
    Select,
    SelectItem,
} from '@tremor/react';

export default function Edit({ user }) {
    const { departments, professorProfile } = usePage().props;
    const isProfessor = user.role?.id === 3 || user.role?.id === 4;

    // Ensure we're using user.professor_profile consistently
    const profile = user.professor_profile || professorProfile;

    const { data, setData, patch, errors, processing } = useForm({
        name: user.name || '',
        password: '',
        password_confirmation: '',
        professorProfile: {
            department_id: profile?.department_id || '',
            title: profile?.title || '',
            office: profile?.office || '',
            phone: profile?.phone || '',
            website: profile?.website || '',
        }
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    console.log("Professor profile in edit form:", profile);
    console.log("Is professor:", isProfessor);
    console.log("Form data:", data);

    return (
        <AppLayout>
            <Head title="Edit Profile" />

            <div className="mx-auto max-w-4xl px-4 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        href={route('profile.show')}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                        <ArrowLeftIcon className="mr-1 h-4 w-4" />
                        <span>Back to Profile</span>
                    </Link>
                </div>

                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Edit Profile
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
                                <Text className="text-center text-gray-500">
                                    {user.email}
                                </Text>

                                {isProfessor && (
                                    <div className="mt-3 text-center">
                                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                                            <AcademicCapIcon className="mr-1 h-3 w-3" />
                                            Professor
                                        </span>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </Col>

                    <Col numColSpanMd={2}>
                        <Card className="p-6">
                            <Title>Personal Information</Title>
                            <Text className="mt-1 text-gray-500">
                                Update your name and password here.
                            </Text>
                            <Divider className="my-4" />

                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-1 block text-sm font-medium text-gray-700"
                                    >
                                        Display Name
                                    </label>
                                    <TextInput
                                        id="name"
                                        placeholder="Your name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        error={!!errors.name}
                                        errorMessage={errors.name}
                                        icon={UserCircleIcon}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-1 block text-sm font-medium text-gray-700"
                                    >
                                        Email Address
                                    </label>
                                    <TextInput
                                        id="email"
                                        value={user.email}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Contact your administrator to change
                                        your email address.
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <div className="flex items-center">
                                        <KeyIcon className="mr-2 h-5 w-5 text-gray-500" />
                                        <Title className="text-lg">
                                            Change Password
                                        </Title>
                                    </div>
                                    <Text className="mb-4 mt-1 text-gray-500">
                                        Leave these fields blank if you don't
                                        want to change your password.
                                    </Text>

                                    <div className="space-y-4">
                                        <div>
                                            <label
                                                htmlFor="password"
                                                className="mb-1 block text-sm font-medium text-gray-700"
                                            >
                                                New Password
                                            </label>
                                            <TextInput
                                                id="password"
                                                type="password"
                                                placeholder="New password"
                                                value={data.password}
                                                onChange={(e) =>
                                                    setData(
                                                        'password',
                                                        e.target.value,
                                                    )
                                                }
                                                error={!!errors.password}
                                                errorMessage={errors.password}
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="password_confirmation"
                                                className="mb-1 block text-sm font-medium text-gray-700"
                                            >
                                                Confirm New Password
                                            </label>
                                            <TextInput
                                                id="password_confirmation"
                                                type="password"
                                                placeholder="Confirm new password"
                                                value={
                                                    data.password_confirmation
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'password_confirmation',
                                                        e.target.value,
                                                    )
                                                }
                                                error={
                                                    !!errors.password_confirmation
                                                }
                                                errorMessage={
                                                    errors.password_confirmation
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                {isProfessor && (
                                    <div className="pt-4">
                                        <div className="flex items-center">
                                            <AcademicCapIcon className="mr-2 h-5 w-5 text-amber-500" />
                                            <Title className="text-lg">
                                                Professor Information
                                            </Title>
                                        </div>
                                        <Text className="mb-4 mt-1 text-gray-500">
                                            Update your academic profile information.
                                        </Text>

                                        {departments?.length === 0 ? (
                                            <div className="rounded-md bg-yellow-50 p-4 mb-4">
                                                <div className="flex">
                                                    <div className="flex-shrink-0">
                                                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                    <div className="ml-3">
                                                        <h3 className="text-sm font-medium text-yellow-800">No departments available</h3>
                                                        <div className="mt-2 text-sm text-yellow-700">
                                                            <p>Please contact an administrator to add departments.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div>
                                                    <label
                                                        htmlFor="department_id"
                                                        className="mb-1 block text-sm font-medium text-gray-700"
                                                    >
                                                        Department <span className="text-red-500">*</span>
                                                    </label>
                                                    <Select
                                                        id="department_id"
                                                        value={data.professorProfile.department_id ? data.professorProfile.department_id.toString() : ''}
                                                        onValueChange={(value) =>
                                                            setData('professorProfile', {
                                                                ...data.professorProfile,
                                                                department_id: value
                                                            })
                                                        }
                                                        placeholder="Select Department"
                                                        error={!!errors['professorProfile.department_id']}
                                                        errorMessage={errors['professorProfile.department_id']}
                                                        icon={BuildingOfficeIcon}
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
                                                    {errors['professorProfile.department_id'] && (
                                                        <p className="mt-1 text-sm text-red-600">{errors['professorProfile.department_id']}</p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="title"
                                                        className="mb-1 block text-sm font-medium text-gray-700"
                                                    >
                                                        Academic Title
                                                    </label>
                                                    <TextInput
                                                        id="title"
                                                        placeholder="e.g. Associate Professor"
                                                        value={data.professorProfile.title || ''}
                                                        onChange={(e) =>
                                                            setData('professorProfile', {
                                                                ...data.professorProfile,
                                                                title: e.target.value
                                                            })
                                                        }
                                                        error={!!errors['professorProfile.title']}
                                                        errorMessage={errors['professorProfile.title']}
                                                        icon={AcademicCapIcon}
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
                                                        placeholder="e.g. Building A, Room 101"
                                                        value={data.professorProfile.office || ''}
                                                        onChange={(e) =>
                                                            setData('professorProfile', {
                                                                ...data.professorProfile,
                                                                office: e.target.value
                                                            })
                                                        }
                                                        error={!!errors['professorProfile.office']}
                                                        errorMessage={errors['professorProfile.office']}
                                                        icon={MapPinIcon}
                                                    />
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="phone"
                                                        className="mb-1 block text-sm font-medium text-gray-700"
                                                    >
                                                        Contact Phone
                                                    </label>
                                                    <TextInput
                                                        id="phone"
                                                        placeholder="e.g. (123) 456-7890"
                                                        value={data.professorProfile.phone || ''}
                                                        onChange={(e) =>
                                                            setData('professorProfile', {
                                                                ...data.professorProfile,
                                                                phone: e.target.value
                                                            })
                                                        }
                                                        error={!!errors['professorProfile.phone']}
                                                        errorMessage={errors['professorProfile.phone']}
                                                        icon={PhoneIcon}
                                                    />
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="website"
                                                        className="mb-1 block text-sm font-medium text-gray-700"
                                                    >
                                                        Personal Website
                                                    </label>
                                                    <TextInput
                                                        id="website"
                                                        placeholder="e.g. https://example.com"
                                                        value={data.professorProfile.website || ''}
                                                        onChange={(e) =>
                                                            setData('professorProfile', {
                                                                ...data.professorProfile,
                                                                website: e.target.value
                                                            })
                                                        }
                                                        error={!!errors['professorProfile.website']}
                                                        errorMessage={errors['professorProfile.website']}
                                                        icon={GlobeAltIcon}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <Divider />

                                <div className="flex items-center justify-end space-x-3 pt-2">
                                    <Link href={route('profile.show')}>
                                        <Button variant="light" color="gray">
                                            Cancel
                                        </Button>
                                    </Link>

                                    <Button
                                        type="submit"
                                        color="indigo"
                                        disabled={processing}
                                    >
                                        {processing
                                            ? 'Saving...'
                                            : 'Save Changes'}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </Col>
                </Grid>
            </div>
        </AppLayout>
    );
}
