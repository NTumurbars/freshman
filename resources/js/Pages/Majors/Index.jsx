import AppLayout from '@/Layouts/AppLayout';
import {
    AcademicCapIcon,
    ArrowsUpDownIcon,
    ChevronRightIcon,
    PencilSquareIcon,
    PlusIcon,
    TrashIcon,
    UsersIcon,
} from '@heroicons/react/24/outline';
import { Head, Link, router } from '@inertiajs/react';
import {
    Badge,
    Button,
    Card,
    SearchSelect,
    SearchSelectItem,
    Select,
    SelectItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    Text,
    Title,
} from '@tremor/react';
import { useState } from 'react';

export default function Index({ majors, school, can_create }) {
    const [selectedDepartment, setSelectedDepartment] = useState('all');

    // Filter majors based on the selected department
    const filteredMajors =
        selectedDepartment === 'all'
            ? majors
            : majors.filter(
                  (major) => major.department.name === selectedDepartment
              );

    return (
        <AppLayout>
            <Head title="Academic Majors" />

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Title className="text-2xl font-bold">
                            Academic Majors
                        </Title>
                        <Text className="dark:text-dark-tremor-content mt-1 text-tremor-default text-tremor-content">
                            Manage academic programs and majors for{' '}
                            {school.name}
                        </Text>
                    </div>
                    {can_create && (
                        <Link href={route('majors.create', school.id)}>
                            <Button
                                icon={PlusIcon}
                                color="blue"
                                size="md"
                                className="shadow-sm transition-all hover:shadow-md"
                            >
                                Add Major
                            </Button>
                        </Link>
                    )}
                </div>

                {majors.length > 0 ? (
                    <Card className="overflow-hidden border border-gray-200 shadow-md">
                        <div className="flex flex-col items-start justify-between border-b bg-gradient-to-r from-blue-50 to-white p-4 dark:from-gray-800 dark:to-gray-900 sm:flex-row sm:items-center">
                            <div className="mb-2 flex items-center gap-2 sm:mb-0">
                                <AcademicCapIcon className="h-5 w-5 text-blue-600" />
                                <Text className="font-medium">
                                    All Majors ({filteredMajors.length})
                                </Text>
                            </div>
                            <div className="flex w-full gap-2 sm:w-auto">
                                <SearchSelect
                                    className="max-w-xs"
                                    placeholder="Filter by department"
                                    value={selectedDepartment}
                                    onValueChange={(value) =>
                                        setSelectedDepartment(value)
                                    }
                                >
                                    <SearchSelectItem value="all">
                                        All Departments
                                    </SearchSelectItem>
                                    {[...new Set(majors.map((major) => major.department.name))].map(
                                        (departmentName) => (
                                            <SearchSelectItem
                                                key={departmentName}
                                                value={departmentName}
                                            >
                                                {departmentName}
                                            </SearchSelectItem>
                                        )
                                    )}
                                </SearchSelect>
                                <Select
                                    className="w-40"
                                    icon={ArrowsUpDownIcon}
                                    placeholder="Sort By"
                                >
                                    <SelectItem value="name">
                                        Name (A-Z)
                                    </SelectItem>
                                    <SelectItem value="students">
                                        Student Count
                                    </SelectItem>
                                </Select>
                            </div>
                        </div>

                        <Table>
                            <TableHead>
                                <TableRow className="bg-gray-50 dark:bg-gray-800">
                                    <TableHeaderCell className="whitespace-nowrap">
                                        Major Code
                                    </TableHeaderCell>
                                    <TableHeaderCell>Name</TableHeaderCell>
                                    <TableHeaderCell>
                                        Department
                                    </TableHeaderCell>
                                    <TableHeaderCell>Students</TableHeaderCell>
                                    <TableHeaderCell className="text-right">
                                        Actions
                                    </TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredMajors.map((major) => (
                                    <TableRow
                                        key={major.id}
                                        className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                        onClick={() =>
                                            router.visit(
                                                route('majors.show', {
                                                    school: school.id,
                                                    major: major.id,
                                                }),
                                            )
                                        }
                                    >
                                        <TableCell>
                                            <Link
                                                href={route('majors.show', {
                                                    school: school.id,
                                                    major: major.id,
                                                })}
                                                className="hover:text-blue-600 hover:underline"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <Badge
                                                    color="blue"
                                                    size="sm"
                                                    className="mr-2"
                                                >
                                                    {major.code}
                                                </Badge>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={route('majors.show', {
                                                    school: school.id,
                                                    major: major.id,
                                                })}
                                                className="font-medium text-gray-900 hover:text-blue-600 hover:underline dark:text-white"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                {major.name || 'Unnamed Major'}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link
                                                href={route(
                                                    'departments.show',
                                                    {
                                                        school: school.id,
                                                        department:
                                                            major.department.id,
                                                    },
                                                )}
                                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                {major.department.name}
                                                <ChevronRightIcon className="h-4 w-4" />
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <UsersIcon className="h-4 w-4 text-gray-500" />
                                                <span className="font-medium">
                                                    {major.student_count || 0}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route('majors.edit', {
                                                        school: school.id,
                                                        major: major.id,
                                                    })}
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
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
                                                    href={route(
                                                        'majors.destroy',
                                                        {
                                                            school: school.id,
                                                            major: major.id,
                                                        },
                                                    )}
                                                    method="delete"
                                                    as="button"
                                                    type="button"
                                                    className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
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
                            <div className="mb-4 rounded-full bg-blue-50 p-3">
                                <AcademicCapIcon className="h-10 w-10 text-blue-500" />
                            </div>
                            <Title className="mb-2">No majors found</Title>
                            <Text className="mb-6 max-w-sm">
                                Get started by adding your first academic major
                                to this school.
                            </Text>
                            {can_create && (
                                <Link href={route('majors.create', school.id)}>
                                    <Button
                                        variant="primary"
                                        color="blue"
                                        icon={PlusIcon}
                                        className="shadow-sm transition-all hover:shadow-md"
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