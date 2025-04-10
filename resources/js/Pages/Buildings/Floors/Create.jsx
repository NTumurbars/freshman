import AppLayout from '@/Layouts/AppLayout';
import {
    ArrowLeftIcon,
    BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Button,
    Card,
    Divider,
    Flex,
    NumberInput,
    Text,
    Title,
} from '@tremor/react';
import { useState } from 'react';

export default function Create({ building, school }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        number: '',
        building_id: building.id,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        post(
            route('buildings.floors.store', {
                school: school.id,
                building: building.id,
            }),
            {
                onSuccess: () => {
                    setIsSubmitting(false);
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            },
        );
    };

    return (
        <AppLayout>
            <Head title="Add New Floor" />

            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center">
                    <Link
                        href={route('buildings.floors.index', {
                            building: building.id,
                            school: school.id,
                        })}
                    >
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
                        <BuildingOffice2Icon className="mr-3 h-8 w-8 text-blue-600" />
                        <div>
                            <Title>Add New Floor</Title>
                            <Text>Create a new floor for {building.name}</Text>
                        </div>
                    </div>
                </div>

                <Card className="mt-6">
                    <form onSubmit={handleSubmit}>
                        <Flex flexDirection="col" alignItems="start">
                            <div className="mb-4 w-full">
                                <div className="mb-2">
                                    <Text>Floor Number</Text>
                                </div>
                                <NumberInput
                                    placeholder="Enter floor number"
                                    value={data.number}
                                    onValueChange={(value) =>
                                        setData('number', value)
                                    }
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
