import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import {
    Button,
    Card,
    Col,
    Grid,
    Select,
    SelectItem,
    Text,
    TextInput,
    Title,
} from '@tremor/react';
import toast from 'react-hot-toast';

export default function Edit({ major, departments, school }) {
    const { data, setData, put, processing, errors } = useForm({
        department_id: major.department_id.toString(),
        code: major.code,
        name: major.name || '',
        description: major.description || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('majors.update', { school: school.id, major: major.id }), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Major updated successfully');
            },
            onError: (errors) => {
                console.log('Errors:', errors); // Error logging
                toast.error('Something went wrong');
            },
        });
    };
    return (
        <AppLayout>
            <Head title="Edit Academic Major" />

            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <Title>Edit Academic Major</Title>
                        <Text>Update major information for {school.name}</Text>
                    </div>
                </div>

                <Card>
                    <form onSubmit={handleSubmit}>
                        <Grid numItemsMd={2} className="gap-6">
                            <Col>
                                <div className="mb-4">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Department{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        value={data.department_id}
                                        onValueChange={(value) =>
                                            setData('department_id', value)
                                        }
                                        placeholder="Select department"
                                        error={errors.department_id}
                                        errorMessage={errors.department_id}
                                    >
                                        {departments.map((department) => (
                                            <SelectItem
                                                key={department.id}
                                                value={department.id.toString()}
                                            >
                                                {department.name}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            </Col>

                            <Col>
                                <div className="mb-4">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Major Code{' '}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <TextInput
                                        placeholder="e.g. CS-BA"
                                        value={data.code}
                                        onChange={(e) =>
                                            setData('code', e.target.value)
                                        }
                                        error={errors.code}
                                        errorMessage={errors.code}
                                    />
                                </div>
                            </Col>
                        </Grid>

                        <div className="mb-4 mt-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Major Name
                            </label>
                            <TextInput
                                placeholder="e.g. Bachelor of Science in Computer Science"
                                value={data.name}
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                error={errors.name}
                                errorMessage={errors.name}
                            />
                        </div>

                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <TextInput
                                placeholder="Brief description of the major"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                error={errors.description}
                                errorMessage={errors.description}
                            />
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => window.history.back()}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" loading={processing}>
                                Update Major
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
