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
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function Create({ roles, schools, departments }) {
    const { flash } = usePage().props;
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        email: '',
        role_id: '',
        school_id: schools?.id || '',
        department_id: '',
        office_location: '',
        phone_number: '',
        title: '',
        website: '',
    });

    const handleChange = (name, value) => setData(name, value);

    const submit = (e) => {
        e.preventDefault();
        post(route('users.store'), {
            onSuccess: () => {
                toast.success('User created successfully');
            },
            onError: (errors) => {
                console.log('Errors:', errors); // Error logging
                toast.error('Something went wrong');
            },
        });
    };

    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school1 = auth.user.school;

    const [isProfessorRole, setIsProfessorRole] = useState(false);

    useEffect(() => {
        const professorRoleIds = ['3', '4']; // professor and major_coordinator
        setIsProfessorRole(professorRoleIds.includes(data.role_id));
    }, [data.role_id]);

    return (
        <AppLayout>
            <Head title="Create User" />

            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <Title className="mb-4">Create New User</Title>

                <Card className="mx-auto max-w-2xl">
                    {flash?.success && (
                        <div className="mb-4 rounded bg-green-100 p-3 text-green-800">
                            {flash.success}
                        </div>
                    )}

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

                                <div>
                                    <label
                                        htmlFor="school"
                                        className="mb-1 block text-sm font-medium text-gray-700"
                                    >
                                        School
                                    </label>
                                    {userRole === 1 ? (
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
                                            {Array.isArray(schools) ? (
                                                schools.map((school) => (
                                                    <SelectItem
                                                        key={school.id}
                                                        value={school.id.toString()}
                                                    >
                                                        {school.name}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem
                                                    value={schools?.id?.toString()}
                                                >
                                                    {schools?.name}
                                                </SelectItem>
                                            )}
                                        </Select>
                                    ) : (
                                        <TextInput
                                            value={school1?.name || ''}
                                            disabled
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        {isProfessorRole && (
                            <div>
                                <Text className="mb-2">Professor Details</Text>
                                <Divider />
                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label
                                            htmlFor="department"
                                            className="mb-1 block text-sm font-medium text-gray-700"
                                        >
                                            Department
                                        </label>
                                        <Select
                                            id="department"
                                            value={data.department_id}
                                            onValueChange={(value) =>
                                                handleChange(
                                                    'department_id',
                                                    value,
                                                )
                                            }
                                            placeholder="Select Department"
                                            error={!!errors.department_id}
                                            errorMessage={errors.department_id}
                                        >
                                            {departments &&
                                            departments.length > 0 ? (
                                                departments.map(
                                                    (department) => (
                                                        <SelectItem
                                                            key={department.id}
                                                            value={department.id.toString()}
                                                        >
                                                            {department.name}
                                                        </SelectItem>
                                                    ),
                                                )
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
                                            placeholder="Professor Title (e.g. Assistant Professor)"
                                            value={data.title}
                                            onChange={(e) =>
                                                handleChange(
                                                    'title',
                                                    e.target.value,
                                                )
                                            }
                                            error={!!errors.title}
                                            errorMessage={errors.title}
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="office_location"
                                            className="mb-1 block text-sm font-medium text-gray-700"
                                        >
                                            Office Location
                                        </label>
                                        <TextInput
                                            id="office_location"
                                            placeholder="Office Location"
                                            value={data.office_location}
                                            onChange={(e) =>
                                                handleChange(
                                                    'office_location',
                                                    e.target.value,
                                                )
                                            }
                                            error={!!errors.office_location}
                                            errorMessage={
                                                errors.office_location
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="phone_number"
                                            className="mb-1 block text-sm font-medium text-gray-700"
                                        >
                                            Phone Number
                                        </label>
                                        <TextInput
                                            id="phone_number"
                                            placeholder="Phone Number"
                                            value={data.phone_number}
                                            onChange={(e) =>
                                                handleChange(
                                                    'phone_number',
                                                    e.target.value,
                                                )
                                            }
                                            error={!!errors.phone_number}
                                            errorMessage={errors.phone_number}
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
                                            placeholder="Faculty Website URL"
                                            value={data.website}
                                            onChange={(e) =>
                                                handleChange(
                                                    'website',
                                                    e.target.value,
                                                )
                                            }
                                            error={!!errors.website}
                                            errorMessage={errors.website}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Creating...' : 'Create User'}
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
