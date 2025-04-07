import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    Card,
    Title,
    Text,
    Button,
    Flex,
    TextInput,
    Divider,
} from '@tremor/react';
import {
    BuildingOffice2Icon,
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';

export default function Create({ building, school }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        building_id: building.id,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        post(route('buildings.floors.store', {
            school: school.id,
            building: building.id,
        }), {
            onSuccess: () => {
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title={`Add Floor - ${building.name}`} />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between mb-6">
                    <div className="flex items-center">
                        <Link href={route('buildings.floors.index', { school: school.id, building: building.id })}>
                            <Button
                                variant="light"
                                color="gray"
                                icon={ArrowLeftIcon}
                                className="mr-4"
                            >
                                Back to Floors
                            </Button>
                        </Link>
                        <div className="flex items-center">
                            <BuildingOffice2Icon className="h-8 w-8 text-blue-600 mr-3" />
                            <div>
                                <Title>Add New Floor</Title>
                                <Text>Create a new floor in {building.name}</Text>
                            </div>
                        </div>
                    </div>
                </div>

                <Card>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <Text>Floor Name</Text>
                            <TextInput
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Enter floor name (e.g. First Floor, Basement)"
                                className="mt-1"
                                error={errors.name}
                                errorMessage={errors.name}
                                required
                            />
                        </div>

                        <Divider />

                        <Flex justifyContent="end" className="mt-6">
                            <Button
                                type="submit"
                                loading={isSubmitting || processing}
                            >
                                Create Floor
                            </Button>
                        </Flex>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
