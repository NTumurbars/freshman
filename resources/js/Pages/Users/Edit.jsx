import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Button,
    Card,
    Divider,
    Select,
    SelectItem,
    Text,
    TextInput,
    Title,
} from '@tremor/react';
import toast from 'react-hot-toast';

export default function Edit({ user, roles, schools }) {
    const { data, setData, put, errors, processing } = useForm({
        name: user.name,
        email: user.email,
        role_id: user.role_id ? user.role_id.toString() : '',
        school_id: user.school_id ? user.school_id.toString() : '',
        password: '',
        password_confirmation: '',
    });

    // Check if the logged-in user is a super admin (role_id 1)
    const isSuperAdmin = user.role?.name === 'super_admin';
    console.log('user:', user);

    const { auth } = usePage().props;

    const isAdmin = auth.user.role.id === 2;

    const handleChange = (name, value) => setData(name, value);

    const submit = (e) => {
        e.preventDefault();
        put(route('users.update', user.id), {
            onSuccess: () => {
                toast.success('User updated successfully');
            },
            onError: (errors) => {
                console.log('Errors:', errors); // Error logging
                toast.error('Something went wrong');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Edit User" />

            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <Title className="mb-4">Edit User</Title>

                <Card className="mx-auto max-w-2xl">
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <Text className="mb-2">Basic Information</Text>
                            <Divider />
                            <div className="mt-4 grid grid-cols-1 gap-4">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="mb-1 block text-sm font-medium text-gray-700"
                                    >
                                        Name
                                    </label>
                                    <TextInput
                                        id="name"
                                        placeholder="Enter full name"
                                        value={data.name}
                                        onChange={(e) =>
                                            handleChange('name', e.target.value)
                                        }
                                        error={!!errors.name}
                                        errorMessage={errors.name}
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="email"
                                        className="mb-1 block text-sm font-medium text-gray-700"
                                    >
                                        Email
                                    </label>
                                    <TextInput
                                        id="email"
                                        type="email"
                                        placeholder="Email address"
                                        value={data.email}
                                        onChange={(e) =>
                                            handleChange(
                                                'email',
                                                e.target.value,
                                            )
                                        }
                                        error={!!errors.email}
                                        errorMessage={errors.email}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <Text className="mb-2">Role & School</Text>
                            <Divider />
                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                {isAdmin || isSuperAdmin ? (
                                    <div>
                                        <label
                                            htmlFor="role"
                                            className="mb-1 block text-sm font-medium text-gray-700"
                                        >
                                            Role
                                        </label>
                                        <Select
                                            id="role"
                                            value={data.role_id}
                                            onValueChange={(value) =>
                                                handleChange('role_id', value)
                                            }
                                            placeholder="Select Role"
                                            error={!!errors.role_id}
                                            errorMessage={errors.role_id}
                                        >
                                            {roles.map((role) => (
                                                <SelectItem
                                                    key={role.id}
                                                    value={role.id.toString()}
                                                >
                                                    {role.name
                                                        .replace('_', ' ')
                                                        .toUpperCase()}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>
                                ) : (
                                    <div>
                                        <label
                                            htmlFor="role"
                                            className="mb-1 block text-sm font-medium text-gray-700"
                                        >
                                            Role
                                        </label>
                                        <TextInput
                                            id="role_display"
                                            value={
                                                roles.find(
                                                    (s) =>
                                                        s.id ===
                                                        parseInt(data.role_id),
                                                )?.name || 'No role assigned'
                                            }
                                            disabled
                                        />
                                    </div>
                                )}

                                {isSuperAdmin ? (
                                    <div>
                                        <label
                                            htmlFor="school"
                                            className="mb-1 block text-sm font-medium text-gray-700"
                                        >
                                            School
                                        </label>
                                        <Select
                                            id="school"
                                            value={data.school_id}
                                            onValueChange={(value) =>
                                                handleChange('school_id', value)
                                            }
                                            placeholder="Select School"
                                            error={!!errors.school_id}
                                            errorMessage={errors.school_id}
                                        >
                                            {schools.map((school) => (
                                                <SelectItem
                                                    key={school.id}
                                                    value={school.id.toString()}
                                                >
                                                    {school.name}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    </div>
                                ) : (
                                    <div>
                                        <label
                                            htmlFor="school_display"
                                            className="mb-1 block text-sm font-medium text-gray-700"
                                        >
                                            School
                                        </label>
                                        <TextInput
                                            id="school_display"
                                            value={
                                                schools.find(
                                                    (s) =>
                                                        s.id ===
                                                        parseInt(
                                                            data.school_id,
                                                        ),
                                                )?.name || 'No school assigned'
                                            }
                                            disabled
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* <div>
                            <Text className="mb-2">Password</Text>
                            <Divider />
                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
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
                                        placeholder="Leave blank to keep current"
                                        value={data.password}
                                        onChange={(e) =>
                                            handleChange(
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
                                        Confirm Password
                                    </label>
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        placeholder="Confirm new password"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            handleChange(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </div> */}

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Updating...' : 'Update User'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
