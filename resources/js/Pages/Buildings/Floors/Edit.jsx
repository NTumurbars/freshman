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

export default function Edit({ floor, building, school }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        number: floor.number || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        put(
            route('buildings.floors.update', {
                school: school.id,
                building: building.id,
                floor: floor.id,
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
            <Head title={`Edit Floor ${floor.number}`} />

            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center">
                        <Link
                            href={route('buildings.floors.index', {
                                school: school.id,
                                building: building.id,
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
                                <Title>Edit Floor</Title>
                                <Text>
                                    Update details for Floor {floor.number}
                                </Text>
                            </div>
                        </div>
                    </div>
                </div>

                <Card>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <Text>Floor Number</Text>
                            <NumberInput
                                value={data.number}
                                onValueChange={(value) =>
                                    setData('number', value)
                                }
                                placeholder="Enter floor number"
                                className="mt-1"
                                error={errors.number}
                                errorMessage={errors.number}
                            />
                        </div>

                        <Divider />

                        <Flex justifyContent="end" className="mt-6">
                            <Button
                                type="submit"
                                loading={isSubmitting || processing}
                            >
                                Update Floor
                            </Button>
                        </Flex>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
