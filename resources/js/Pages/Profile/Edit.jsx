import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Card, Title, Text, Divider, Button, TextInput, Grid, Col } from '@tremor/react';
import { 
    ArrowLeftIcon,
    UserCircleIcon,
    KeyIcon
} from '@heroicons/react/24/outline';

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
    
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    
    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Edit Profile" />

            <div className="mx-auto max-w-4xl px-4 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Link 
                        href={route('profile.show')} 
                        className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        <span>Back to Profile</span>
                    </Link>
                </div>
                
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
                </div>
                
                <Grid numItemsMd={3} className="gap-6">
                    <Col numColSpanMd={1}>
                        <Card className="p-6">
                            <div className="flex flex-col items-center">
                                <div className="mb-4 h-32 w-32 overflow-hidden rounded-full bg-gray-100 flex items-center justify-center">
                                    <UserCircleIcon className="h-24 w-24 text-gray-400" />
                                </div>
                                
                                <Title className="text-center">{user.name}</Title>
                                <Text className="text-center text-gray-500">{user.email}</Text>
                            </div>
                        </Card>
                    </Col>
                    
                    <Col numColSpanMd={2}>
                        <Card className="p-6">
                            <Title>Personal Information</Title>
                            <Text className="text-gray-500 mt-1">Update your name and password here.</Text>
                            <Divider className="my-4" />
                            
                            <form onSubmit={submit} className="space-y-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Display Name
                                    </label>
                                    <TextInput
                                        id="name"
                                        placeholder="Your name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        error={!!errors.name}
                                        errorMessage={errors.name}
                                        icon={UserCircleIcon}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <TextInput
                                        id="email"
                                        value={user.email}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        Contact your administrator to change your email address.
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <div className="flex items-center">
                                        <KeyIcon className="h-5 w-5 text-gray-500 mr-2" />
                                        <Title className="text-lg">Change Password</Title>
                                    </div>
                                    <Text className="text-gray-500 mt-1 mb-4">
                                        Leave these fields blank if you don't want to change your password.
                                    </Text>
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                                New Password
                                            </label>
                                            <TextInput
                                                id="password"
                                                type="password"
                                                placeholder="New password"
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                error={!!errors.password}
                                                errorMessage={errors.password}
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                                                Confirm New Password
                                            </label>
                                            <TextInput
                                                id="password_confirmation"
                                                type="password"
                                                placeholder="Confirm new password"
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                error={!!errors.password_confirmation}
                                                errorMessage={errors.password_confirmation}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Divider />
                                
                                <div className="flex justify-end pt-2 space-x-3">
                                    <Link href={route('profile.show')}>
                                        <Button
                                            variant="light"
                                            color="gray"
                                        >
                                            Cancel
                                        </Button>
                                    </Link>
                                    
                                    <Button
                                        type="submit"
                                        color="indigo"
                                        disabled={processing}
                                    >
                                        {processing ? 'Saving...' : 'Save Changes'}
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
