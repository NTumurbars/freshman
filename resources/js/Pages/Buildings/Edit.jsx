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

export default function Edit({ building, school }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, errors, put, processing } = useForm({
        name: building.name || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!data.name) {
            toast.error('Building name is required');
            setIsSubmitting(false);
            return;
        }

        put(route('buildings.update', { school: school.id, building: building.id }), {
            onSuccess: () => {
                toast.success('Building updated successfully');
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
            <Head title={`Edit ${building.name}`} />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between mb-6">
                    <div className="flex items-center">
                        <Link href={route('buildings.show', { school: school.id, building: building.id })}>
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
                            <Title>Edit Building</Title>
                            <Text>Update details for {building.name}</Text>
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
                                {isSubmitting ? 'Updating...' : 'Update Building'}
                            </Button>
                        </Flex>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
