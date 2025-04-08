import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { 
    Card, 
    Text, 
    Title, 
    TextInput, 
    Button, 
    Select, 
    SelectItem, 
    Divider 
} from '@tremor/react';

export default function Edit({ user, roles, schools }) {
    const { data, setData, put, errors, processing } = useForm({
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        school_id: user.school_id || '',
        password: '',
        password_confirmation: '',
    });

    const handleChange = (name, value) => setData(name, value);

    const submit = (e) => {
        e.preventDefault();
        put(route('users.update', user.id));
    };
    
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    
    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Edit User" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <Title className="mb-4">Edit User</Title>

                <Card className="max-w-2xl mx-auto">
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <Text className="mb-2">Basic Information</Text>
                            <Divider />
                            <div className="grid grid-cols-1 gap-4 mt-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Name
                                    </label>
                                    <TextInput
                                        id="name"
                                        placeholder="Enter full name"
                                        value={data.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        error={!!errors.name}
                                        errorMessage={errors.name}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        placeholder="Email address"
                                        value={data.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        error={!!errors.email}
                                        errorMessage={errors.email}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <Text className="mb-2">Role & School</Text>
                            <Divider />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    <Select
                                        id="role"
                                        value={data.role_id}
                                        onValueChange={(value) => handleChange('role_id', value)}
                                        placeholder="Select Role"
                                        error={!!errors.role_id}
                                        errorMessage={errors.role_id}
                                    >
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={role.id.toString()}>
                                                {role.name.replace('_', ' ').toUpperCase()}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>

                                {userRole === 1 ? (
                                    <div>
                                        <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
                                            School
                                        </label>
                                        <Select
                                            id="school"
                                            value={data.school_id}
                                            onValueChange={(value) => handleChange('school_id', value)}
                                            placeholder="Select School"
                                            error={!!errors.school_id}
                                            errorMessage={errors.school_id}
                                        >
                                            {schools.map((school) => (
                                                <SelectItem key={school.id} value={school.id.toString()}>
                                                    {school.name}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>
                                ) : (
                                    <div>
                                        <label htmlFor="school_display" className="block text-sm font-medium text-gray-700 mb-1">
                                            School
                                        </label>
                                        <TextInput
                                            id="school_display"
                                            value={user.school?.name || 'No school assigned'}
                                            disabled
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <Text className="mb-2">Password</Text>
                            <Divider />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        New Password
                                    </label>
                                    <TextInput
                                        id="password"
                                        type="password"
                                        placeholder="Leave blank to keep current"
                                        value={data.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        error={!!errors.password}
                                        errorMessage={errors.password}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password
                                    </label>
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        placeholder="Confirm new password"
                                        value={data.password_confirmation}
                                        onChange={(e) => handleChange('password_confirmation', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button
                                type="submit"
                                disabled={processing}
                            >
                                {processing ? 'Updating...' : 'Update User'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
