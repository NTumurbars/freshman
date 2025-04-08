import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import {
    Card,
    Title,
    Text,
    Button,
    TextInput,
    Select,
    SelectItem,
    Textarea,
} from '@tremor/react';
import { ArrowLeftIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Settings } from 'lucide-react';

export default function Edit({ roomfeature, school, categories }) {
    const { auth, flash } = usePage().props;
    const userRole = auth.user.role.id;

    const { data, setData, put, processing, errors } = useForm({
        name: roomfeature.name || '',
        description: roomfeature.description || '',
        category: roomfeature.category || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('roomfeatures.update', { school: school.id, roomfeature: roomfeature.id }));
    };

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Edit Room Feature" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center mb-6">
                    <Link href={route('roomfeatures.index', school.id)}>
                        <Button
                            variant="light"
                            color="gray"
                            icon={ArrowLeftIcon}
                            className="mr-4"
                        >
                            Back to Features
                        </Button>
                    </Link>
                    <div className="flex items-center">
                        <Settings className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                            <Title>Edit Room Feature</Title>
                            <Text>Update feature details</Text>
                        </div>
                    </div>
                </div>

                {flash && flash.message && (
                    <div className="mt-4 mb-6">
                        <Card className={`bg-${flash.type === 'success' ? 'green' : 'red'}-50 border-${flash.type === 'success' ? 'green' : 'red'}-200`}>
                            <div className="flex items-center">
                                <ExclamationCircleIcon className={`h-5 w-5 text-${flash.type === 'success' ? 'green' : 'red'}-500 mr-2`} />
                                <Text className={`text-${flash.type === 'success' ? 'green' : 'red'}-700`}>{flash.message}</Text>
                            </div>
                        </Card>
                    </div>
                )}

                <Card>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Feature Name
                                </label>
                                <div className="mt-1">
                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Enter feature name"
                                        error={errors.name}
                                        errorMessage={errors.name}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                    Category
                                </label>
                                <div className="mt-1">
                                    <Select
                                        id="category"
                                        name="category"
                                        value={data.category}
                                        onValueChange={(value) => setData('category', value)}
                                        placeholder="Select a category"
                                        error={errors.category}
                                        errorMessage={errors.category}
                                        required
                                    >
                                        {Object.entries(categories).map(([key, value]) => (
                                            <SelectItem key={key} value={key}>
                                                {value}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <div className="mt-1">
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Enter a description of this feature"
                                        error={errors.description}
                                        errorMessage={errors.description}
                                        rows={4}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Link href={route('roomfeatures.index', school.id)}>
                                    <Button variant="secondary" color="gray" className="mr-2">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button type="submit" loading={processing}>
                                    Update Feature
                                </Button>
                            </div>
                        </div>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
} 