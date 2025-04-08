import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Card, Title, Text, Button, TextInput, Grid, Col } from '@tremor/react';

export default function Create() {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        contact: {
            email: '',
            phone: '',
            office: ''
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('departments.store', { school: school.id }), {
            onSuccess: () => {
                console.log('Success: Department created successfully');
            }
        });
    };

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Create Department" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between mb-6">
                    <div>
                        <Title>Create Department</Title>
                        <Text>Add a new department to {school.name}</Text>
                    </div>
                </div>

                <Card>
                    <form onSubmit={handleSubmit}>
                        <Grid numItemsMd={2} className="gap-6">
                            <Col>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Department Name <span className="text-red-500">*</span>
                                    </label>
                                    <TextInput
                                        placeholder="e.g. Computer Science"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        error={errors.name}
                                        errorMessage={errors.name}
                                        required
                                    />
                                </div>
                            </Col>
                            
                            <Col>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Department Code
                                    </label>
                                    <TextInput
                                        placeholder="e.g. CS"
                                        value={data.code}
                                        onChange={e => setData('code', e.target.value)}
                                        error={errors.code}
                                        errorMessage={errors.code}
                                    />
                                </div>
                            </Col>
                        </Grid>

                        <Title className="mt-6 mb-3">Contact Information</Title>
                        
                        <Grid numItemsMd={3} className="gap-6">
                            <Col>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <TextInput
                                        placeholder="department@university.edu"
                                        value={data.contact.email}
                                        onChange={e => setData('contact', {...data.contact, email: e.target.value})}
                                        error={errors['contact.email']}
                                        errorMessage={errors['contact.email']}
                                    />
                                </div>
                            </Col>
                            
                            <Col>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone
                                    </label>
                                    <TextInput
                                        placeholder="(123) 456-7890"
                                        value={data.contact.phone}
                                        onChange={e => setData('contact', {...data.contact, phone: e.target.value})}
                                        error={errors['contact.phone']}
                                        errorMessage={errors['contact.phone']}
                                    />
                                </div>
                            </Col>
                            
                            <Col>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Office Location
                                    </label>
                                    <TextInput
                                        placeholder="Building name, Room number"
                                        value={data.contact.office}
                                        onChange={e => setData('contact', {...data.contact, office: e.target.value})}
                                        error={errors['contact.office']}
                                        errorMessage={errors['contact.office']}
                                    />
                                </div>
                            </Col>
                        </Grid>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button 
                                type="button"
                                variant="secondary"
                                onClick={() => window.history.back()}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                loading={processing}
                            >
                                Create Department
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </AppLayout>
    );
}
