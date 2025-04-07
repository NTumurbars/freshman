import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Card,
    Title,
    Text,
    Flex,
    Grid,
    Col,
    Badge,
    Button,
    Table,
    TableHead,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Divider,
    Icon,
    Select,
    SelectItem,
    List,
    ListItem,
    Bold,
    SearchSelect,
    SearchSelectItem,
} from '@tremor/react';
import { 
    PlusIcon, 
    PencilSquareIcon, 
    TrashIcon, 
    AcademicCapIcon,
    DocumentTextIcon,
    ChevronRightIcon,
    FunnelIcon,
    ArrowsUpDownIcon,
    UsersIcon
} from '@heroicons/react/24/outline';

export default function Index({ majors, school, can_create }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Academic Majors" />

            <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <Title className="text-2xl font-bold">Academic Majors</Title>
                        <Text className="mt-1 text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                            Manage academic programs and majors for {school.name}
                        </Text>
                    </div>
                    {can_create && (
                        <Link href={route('majors.create', school.id)}>
                            <Button icon={PlusIcon} color="blue" size="md" className="shadow-sm hover:shadow-md transition-all">
                                Add Major
                            </Button>
                        </Link>
                    )}
                </div>

                {majors.length > 0 ? (
                    <Card className="shadow-md overflow-hidden border border-gray-200">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-900 border-b">
                            <div className="flex items-center gap-2 mb-2 sm:mb-0">
                                <AcademicCapIcon className="h-5 w-5 text-blue-600" />
                                <Text className="font-medium">All Majors ({majors.length})</Text>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <SearchSelect className="max-w-xs" placeholder="Filter by department">
                                    {/* You can populate this dynamically if needed */}
                                    <SearchSelectItem value="all">All Departments</SearchSelectItem>
                                </SearchSelect>
                                <Select className="w-40" icon={ArrowsUpDownIcon} placeholder="Sort By">
                                    <SelectItem value="name">Name (A-Z)</SelectItem>
                                    <SelectItem value="students">Student Count</SelectItem>
                                </Select>
                            </div>
                        </div>

                        <Table>
                            <TableHead>
                                <TableRow className="bg-gray-50 dark:bg-gray-800">
                                    <TableHeaderCell className="whitespace-nowrap">Major Code</TableHeaderCell>
                                    <TableHeaderCell>Name</TableHeaderCell>
                                    <TableHeaderCell>Department</TableHeaderCell>
                                    <TableHeaderCell>Students</TableHeaderCell>
                                    <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {majors.map((major) => (
                                    <TableRow key={major.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                                        <TableCell>
                                            <Badge color="blue" size="sm" className="mr-2">{major.code}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium text-gray-900 dark:text-white">{major.name || 'Unnamed Major'}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Link 
                                                href={route('departments.show', { 
                                                    school: school.id, 
                                                    department: major.department.id 
                                                })}
                                                className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                            >
                                                {major.department.name}
                                                <ChevronRightIcon className="h-4 w-4" />
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <UsersIcon className="h-4 w-4 text-gray-500" />
                                                <span className="font-medium">{major.student_count || 0}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-2">
                                                <Link 
                                                    href={route('majors.edit', { 
                                                        school: school.id, 
                                                        major: major.id 
                                                    })}
                                                >
                                                    <Button 
                                                        icon={PencilSquareIcon} 
                                                        variant="light" 
                                                        color="blue"
                                                        size="xs"
                                                        tooltip="Edit major"
                                                    >
                                                        Edit
                                                    </Button>
                                                </Link>
                                                
                                                <Link 
                                                    href={route('majors.destroy', { 
                                                        school: school.id, 
                                                        major: major.id 
                                                    })}
                                                    method="delete"
                                                    as="button"
                                                    type="button"
                                                    className="text-red-600 text-xs px-2 py-1 rounded hover:bg-red-50 hover:text-red-700 transition-colors inline-flex items-center gap-1"
                                                >
                                                    <TrashIcon className="h-3 w-3" />
                                                    Delete
                                                </Link>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                ) : (
                    <Card className="border border-dashed border-gray-300 shadow-sm">
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="rounded-full bg-blue-50 p-3 mb-4">
                                <AcademicCapIcon className="h-10 w-10 text-blue-500" />
                            </div>
                            <Title className="mb-2">No majors found</Title>
                            <Text className="max-w-sm mb-6">
                                Get started by adding your first academic major to this school.
                            </Text>
                            {can_create && (
                                <Link href={route('majors.create', school.id)}>
                                    <Button 
                                        variant="primary" 
                                        color="blue" 
                                        icon={PlusIcon}
                                        className="shadow-sm hover:shadow-md transition-all"
                                    >
                                        Create your first major
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