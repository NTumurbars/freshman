import AppLayout from '@/Layouts/AppLayout';
import {
    ArrowLeftIcon,
    KeyIcon,
    UserCircleIcon,
} from '@heroicons/react/24/outline';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Button,
    Card,
    Col,
    Divider,
    Grid,
    Text,
    TextInput,
    Title,
} from '@tremor/react';

export default function Edit({ user }) {
    const { data, setData, patch, errors, processing } = useForm({
        name: user.name || '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

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
