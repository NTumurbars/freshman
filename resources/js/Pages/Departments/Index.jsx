// resources/js/Pages/Departments/Index.jsx

import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Card,
    Title,
    Text,
    Grid,
    Col,
    Metric,
    Badge,
    Button,
    List,
    ListItem,
    Icon,
} from '@tremor/react';
import {
    AcademicCapIcon,
    BookOpenIcon,
    UserGroupIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';

const DepartmentCard = ({ department }) => {
    // Add safe defaults for contact information
    const contactInfo = department.contact || {};

    return (
        <Card>
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <Title>{department.name}</Title>
                    </div>
                </div>
            </div>

            <Grid numItems={1} numItemsSm={3} className="mt-4 gap-4">
                <Card decoration="top" decorationColor="blue">
                    <div className="flex items-center justify-between">
                        <Text>Majors</Text>
                        <Metric>{department.stats?.majors || 0}</Metric>
                    </div>
                </Card>
                <Card decoration="top" decorationColor="green">
                    <div className="flex items-center justify-between">
                        <Text>Courses</Text>
                        <Metric>{department.stats?.courses || 0}</Metric>
                    </div>
                </Card>
                <Card decoration="top" decorationColor="purple">
                    <div className="flex items-center justify-between">
                        <Text>Professors</Text>
                        <Metric>{department.stats?.professors || 0}</Metric>
                    </div>
                </Card>
            </Grid>

            <div className="mt-4">
                <Text className="font-medium">Contact Information</Text>
                <List className="mt-2">
                    {contactInfo.email && (
                        <ListItem>
                            <div className="flex items-center gap-2">
                                <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                                <span>{contactInfo.email}</span>
                            </div>
                        </ListItem>
                    )}
                    {contactInfo.phone && (
                        <ListItem>
                            <div className="flex items-center gap-2">
                                <PhoneIcon className="h-5 w-5 text-gray-500" />
                                <span>{contactInfo.phone}</span>
                            </div>
                        </ListItem>
                    )}
                    {contactInfo.office && (
                        <ListItem>
                            <div className="flex items-center gap-2">
                                <MapPinIcon className="h-5 w-5 text-gray-500" />
                                <span>{contactInfo.office}</span>
                            </div>
                        </ListItem>
                    )}
                </List>
            </div>

            <div className="mt-4 flex justify-end gap-2">
                <Link href={route('departments.show', { school: department.school_id, department: department.id })}>
                    <Button variant="secondary" size="sm">
                        View Details
                    </Button>
                </Link>
                <Link href={route('departments.edit', { school: department.school_id, department: department.id })}>
                    <Button variant="secondary" size="sm">
                        Edit
                    </Button>
                </Link>
            </div>
        </Card>
    );
};

export default function Index({ departments, school, can_create }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Departments" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div>
                        <Title>Departments</Title>
                        <Text>Manage departments for {school.name}</Text>
                    </div>
                    {can_create && (
                        <Link href={route('departments.create', school.id)}>
                            <Button icon={PlusIcon}>Add Department</Button>
                        </Link>
                    )}
                </div>

                <div className="mt-6">
                    {departments.length > 0 ? (
                        <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
                            {departments.map((department) => (
                                <Col key={department.id}>
                                    <DepartmentCard department={department} />
                                </Col>
                            ))}
                        </Grid>
                    ) : (
                        <Card>
                            <div className="flex flex-col items-center justify-center py-12">
                                <AcademicCapIcon className="h-12 w-12 text-gray-400" />
                                <Text className="mt-2">No departments found</Text>
                                {can_create && (
                                    <Link href={route('departments.create', school.id)} className="mt-4">
                                        <Button variant="light" icon={PlusIcon}>
                                            Add your first department
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
