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
    Text,
    TextInput,
    Title,
} from '@tremor/react';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function Create({ school }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, errors, post, processing } = useForm({
        name: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!data.name) {
            toast.error('Building name is required');
            setIsSubmitting(false);
            return;
        }

        post(route('buildings.store', school.id), {
            onSuccess: () => {
                toast.success('Building created successfully');
                setIsSubmitting(false);
            },
            onError: (errors) => {
                Object.keys(errors).forEach((key) => {
                    toast.error(errors[key]);
                });
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Create Building" />

            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6 sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center">
                        <Link href={route('buildings.index', school.id)}>
                            <Button
                                variant="light"
                                color="gray"
                                icon={ArrowLeftIcon}
                                className="mr-4"
                            >
                                Back
                            </Button>
                        </Link>
                        <div>
                            <Title>Create Building</Title>
                            <Text>Add a new building to {school.name}</Text>
                        </div>
                    </div>
                </div>

                <Card>
                    <form onSubmit={handleSubmit}>
                        <Flex flexDirection="col" alignItems="start">
                            <div className="mb-6 w-full">
                                <Text>Building Name</Text>
                                <TextInput
                                    value={data.name}
                                    onChange={(e) =>
                                        setData('name', e.target.value)
                                    }
                                    placeholder="Enter building name"
                                    error={errors.name}
                                    icon={BuildingOffice2Icon}
                                    className="mt-1"
                                    disabled={isSubmitting}
                                />
                                {errors.name && (
                                    <Text color="red" className="mt-1">
                                        {errors.name}
                                    </Text>
                                )}
                            </div>
                        </Flex>

                        <Divider />

                        <Flex justifyContent="end">
                            <Button
                                type="submit"
                                loading={isSubmitting}
                                disabled={isSubmitting}
                            >
                                {isSubmitting
                                    ? 'Creating...'
                                    : 'Create Building'}
                            </Button>
                        </Flex>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
