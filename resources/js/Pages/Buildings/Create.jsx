import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import {
    Card,
    Title,
    Text,
    TextInput,
    Button,
    Flex,
    Divider,
} from '@tremor/react';
import { BuildingOffice2Icon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function Create({ school }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
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
                Object.keys(errors).forEach(key => {
                    toast.error(errors[key]);
                });
                setIsSubmitting(false);
            }
        });
    };

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Create Building" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between mb-6">
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
                            <div className="w-full mb-6">
                                <Text>Building Name</Text>
                                <TextInput
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="Enter building name"
                                    error={errors.name}
                                    icon={BuildingOffice2Icon}
                                    className="mt-1"
                                    disabled={isSubmitting}
                                />
                                {errors.name && (
                                    <Text color="red" className="mt-1">{errors.name}</Text>
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
                                {isSubmitting ? 'Creating...' : 'Create Building'}
                            </Button>
                        </Flex>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
