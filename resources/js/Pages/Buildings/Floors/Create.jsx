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
    NumberInput,
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
        number: '',
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
            <Head title="Add New Floor" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center mb-6">
                    <Link href={route('buildings.floors.index', {
                        building: building.id,
                        school: school.id,
                    })}>
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
                            <Text>Create a new floor for {building.name}</Text>
                        </div>
                    </div>
                </div>

                <Card className="mt-6">
                    <form onSubmit={handleSubmit}>
                        <Flex flexDirection="col" alignItems="start">
                            <div className="w-full mb-4">
                                <div className="mb-2">
                                    <Text>Floor Number</Text>
                                </div>
                                <NumberInput
                                    placeholder="Enter floor number"
                                    value={data.number}
                                    onValueChange={(value) => setData('number', value)}
                                    error={errors.number ? true : false}
                                    errorMessage={errors.number}
                                    required
                                />
                            </div>
                        </Flex>

                        <Divider className="my-4" />

                        <Flex justifyContent="end">
                            <Button
                                type="submit"
                                loading={isSubmitting}
                                disabled={processing}
                            >
                                Save Floor
                            </Button>
                        </Flex>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
