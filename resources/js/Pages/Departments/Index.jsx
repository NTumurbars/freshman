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
    Flex,
    Divider,
    TabGroup,
    TabList,
    Tab,
    Select,
    SelectItem,
    SearchSelect,
    SearchSelectItem,
} from '@tremor/react';
import {
    AcademicCapIcon,
    BookOpenIcon,
    UserGroupIcon,
    EnvelopeIcon,
    PhoneIcon,
    MapPinIcon,
    PlusIcon,
    BuildingOfficeIcon,
    ChevronRightIcon,
    EyeIcon,
    PencilSquareIcon,
    ArrowsUpDownIcon,
    FunnelIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';

const DepartmentCard = ({ department, school }) => {
    // Add safe defaults for contact information
    const contactInfo = department.contact || {};

    return (
        <Card className="hover:shadow-md transition-all border border-gray-200 h-full">
            <div className="flex flex-col">
                <div className="mb-2">
                    <Badge icon={BuildingOfficeIcon} color="blue" className="px-2.5 py-1">
                        {department.code || 'DEPT'}
                    </Badge>
                </div>
                <Title className="text-2xl mb-5">{department.name}</Title>

                <Divider />

                <div className="my-4">
                    <Grid numItems={1} numItemsSm={3} className="gap-2">
                        <div className="flex items-center gap-2">
                            <AcademicCapIcon className="h-5 w-5 text-blue-500" />
                            <Text>Majors</Text>
                            <Text className="text-blue-600 font-semibold text-lg">{department.stats?.majors || 0}</Text>
                        </div>
                        <div className="flex items-center gap-2">
                            <BookOpenIcon className="h-5 w-5 text-green-500" />
                            <Text>Courses</Text>
                            <Text className="text-green-600 font-semibold text-lg">{department.stats?.courses || 0}</Text>
                        </div>
                        <div className="flex items-center gap-2">
                            <UserGroupIcon className="h-5 w-5 text-purple-500" />
                            <Text>Professors</Text>
                            <Text className="text-purple-600 font-semibold text-lg">{department.stats?.professors || 0}</Text>
                        </div>
                    </Grid>
                </div>

                <div className="mt-3">
                    <Text className="text-gray-700 font-medium">Contact Information</Text>
                    {!(contactInfo.email || contactInfo.phone || contactInfo.office) && (
                        <Text className="text-gray-500 italic mt-1">No contact information available</Text>
                    )}
                    {(contactInfo.email || contactInfo.phone || contactInfo.office) && (
                        <List className="mt-1">
                            {contactInfo.email && (
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                                        <a href={`mailto:${contactInfo.email}`} className="text-blue-600 hover:underline">{contactInfo.email}</a>
                                    </div>
                                </ListItem>
                            )}
                            {contactInfo.phone && (
                                <ListItem>
                                    <div className="flex items-center gap-2">
                                        <PhoneIcon className="h-5 w-5 text-gray-500" />
                                        <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
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
                    )}
                </div>

                <div className="items-center pt-4 flex justify-end gap-4 border-t border-gray-100 mt-4">
                    <Link href={route('departments.show', { school: department.school_id, department: department.id })}>
                        <Button variant="light" size="sm" className="text-blue-600">
                            View
                        </Button>
                    </Link>
                    <Link href={route('departments.edit', { school: department.school_id, department: department.id })}>
                        <Button variant="light" size="sm" className="text-blue-600">
                            Edit
                        </Button>
                    </Link>
                    <Link 
                        href={route('departments.destroy', { 
                            school: school.id, 
                            department: department.id 
                        })}
                        method="delete"
                        as="button"
                        type="button"
                        className="text-red-600 text-sm hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    >
                        Delete
                    </Link>
                </div>
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

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <Title className="text-2xl font-bold">Academic Departments</Title>
                        <Text className="mt-1 text-gray-600">
                            Manage departments and academic units for {school.name}
                        </Text>
                    </div>
                    {can_create && (
                        <Link href={route('departments.create', school.id)}>
                            <Button icon={PlusIcon} color="blue" size="md" className="shadow-sm hover:shadow-md transition-all">
                                Add Department
                            </Button>
                        </Link>
                    )}
                </div>

                {departments.length > 0 ? (
                    <div>
                        <Card className="shadow-md overflow-hidden border border-gray-200 mb-6">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border-b">
                                <div className="flex items-center gap-2 mb-2 sm:mb-0">
                                    <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
                                    <Text className="font-medium">All Departments ({departments.length})</Text>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <SearchSelect className="max-w-xs" placeholder="Search departments">
                                        {departments.map((dept) => (
                                            <SearchSelectItem key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </SearchSelectItem>
                                        ))}
                                    </SearchSelect>
                                    <Select className="w-40" icon={ArrowsUpDownIcon} placeholder="Sort By">
                                        <SelectItem value="name">Name (A-Z)</SelectItem>
                                        <SelectItem value="courses">Course Count</SelectItem>
                                        <SelectItem value="professors">Professor Count</SelectItem>
                                    </Select>
                                </div>
                            </div>
                        </Card>

                        <Grid numItems={1} numItemsSm={2} numItemsLg={3} className="gap-6">
                            {departments.map((department) => (
                                <Col key={department.id}>
                                    <DepartmentCard department={department} school={school} />
                                </Col>
                            ))}
                        </Grid>
                    </div>
                ) : (
                    <Card className="border border-dashed border-gray-300 shadow-sm">
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="rounded-full bg-blue-50 p-3 mb-4">
                                <BuildingOfficeIcon className="h-10 w-10 text-blue-500" />
                            </div>
                            <Title className="mb-2">No departments found</Title>
                            <Text className="max-w-sm mb-6">
                                Get started by adding your first academic department to this school.
                            </Text>
                            {can_create && (
                                <Link href={route('departments.create', school.id)}>
                                    <Button 
                                        variant="primary" 
                                        color="blue" 
                                        icon={PlusIcon}
                                        className="shadow-sm hover:shadow-md transition-all"
                                    >
                                        Create your first department
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
