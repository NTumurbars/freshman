import AppLayout from '@/Layouts/AppLayout';
import {
    ChevronDownIcon,
    ChevronUpDownIcon,
    ChevronUpIcon,
    MagnifyingGlassIcon,
    TrashIcon,
    UserPlusIcon,
} from '@heroicons/react/24/outline';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Badge,
    Button,
    Card,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    TextInput,
    Title,
} from '@tremor/react';
import debounce from 'lodash/debounce';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <h3 className="mb-4 text-lg font-medium">Confirm Delete</h3>
                <p className="mb-6 text-gray-500">
                    Are you sure you want to delete this user? This action
                    cannot be undone.
                </p>
                <div className="flex justify-end gap-3">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="red"
                        onClick={onConfirm}
                        loading={isDeleting}
                    >
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default function Index({ users, roles, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [deleteDialog, setDeleteDialog] = useState({
        isOpen: false,
        userId: null,
    });
    const { get, delete: destroy, processing } = useForm();

    const debouncedSearch = debounce((value) => {
        get(
            route('users.index', {
                ...filters,
                search: value,
                page: 1,
            }),
        );
    }, 300);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handleSort = (field) => {
        const direction =
            field === filters.sort_by && filters.sort_direction === 'asc'
                ? 'desc'
                : 'asc';

        get(
            route('users.index', {
                ...filters,
                sort_by: field,
                sort_direction: direction,
            }),
        );
    };

    const handleDelete = (userId) => {
        setDeleteDialog({ isOpen: true, userId });
    };

    const confirmDelete = () => {
        destroy(route('users.destroy', deleteDialog.userId), {
            onSuccess: () => {
                toast.success('User deleted successfully');
                setDeleteDialog({ isOpen: false, userId: null });
            },
            onError: () => {
                toast.error('Failed to delete user');
                setDeleteDialog({ isOpen: false, userId: null });
            },
        });
    };

    const getSortIcon = (field) => {
        if (field !== filters.sort_by)
            return <ChevronUpDownIcon className="h-4 w-4" />;
        return filters.sort_direction === 'asc' ? (
            <ChevronUpIcon className="h-4 w-4" />
        ) : (
            <ChevronDownIcon className="h-4 w-4" />
        );
    };

    return (
        <AppLayout>
            <Head title="User Management" />

            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <Title>User Management</Title>
                    <Link href={route('users.create')}>
                        <Button icon={UserPlusIcon}>Add User</Button>
                    </Link>
                </div>

                <Card className="mt-6">
                    <div className="space-y-4">
                        <div className="sm:flex sm:gap-4">
                            <TextInput
                                icon={MagnifyingGlassIcon}
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="sm:max-w-xs"
                            />
                            <select
                                value={filters.role || ''}
                                onChange={(e) =>
                                    get(
                                        route('users.index', {
                                            ...filters,
                                            role: e.target.value,
                                            page: 1,
                                        }),
                                    )
                                }
                                className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:max-w-xs"
                            >
                                <option value="">All Roles</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell
                                        className="cursor-pointer"
                                        onClick={() => handleSort('name')}
                                    >
                                        <div className="flex items-center gap-2">
                                            Name
                                            {getSortIcon('name')}
                                        </div>
                                    </TableHeaderCell>
                                    <TableHeaderCell>Role</TableHeaderCell>
                                    <TableHeaderCell>School</TableHeaderCell>
                                    <TableHeaderCell>Actions</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.data.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">
                                                    {user.name}
                                                </div>
                                                <div className="text-gray-500">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge color="blue">
                                                {user.role.name}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.school?.name || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Link
                                                    href={route(
                                                        'users.show',
                                                        user.id,
                                                    )}
                                                >
                                                    <Button
                                                        size="xs"
                                                        variant="secondary"
                                                    >
                                                        View
                                                    </Button>
                                                </Link>
                                                <Link
                                                    href={route(
                                                        'users.edit',
                                                        user.id,
                                                    )}
                                                >
                                                    <Button
                                                        size="xs"
                                                        variant="secondary"
                                                    >
                                                        Edit
                                                    </Button>
                                                </Link>
                                                <Button
                                                    size="xs"
                                                    variant="secondary"
                                                    color="red"
                                                    icon={TrashIcon}
                                                    onClick={() =>
                                                        handleDelete(user.id)
                                                    }
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {users.links && users.links.length > 0 && (
                            <div className="mt-4 flex items-center justify-center border-t border-gray-200 pt-4">
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    {users.links.map((link, index) => {
                                        const isDisabled = !link.url;

                                        if (link.label === '&laquo; Previous') {
                                            return isDisabled ? (
                                                <span
                                                    key={index}
                                                    className="relative inline-flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-l-md px-2 py-2 text-gray-300 ring-1 ring-inset ring-gray-200"
                                                >
                                                    <ChevronUpIcon className="h-5 w-5" />
                                                </span>
                                            ) : (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                                >
                                                    <ChevronUpIcon className="h-5 w-5" />
                                                </Link>
                                            );
                                        }

                                        if (link.label === 'Next &raquo;') {
                                            return isDisabled ? (
                                                <span
                                                    key={index}
                                                    className="relative inline-flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-r-md px-2 py-2 text-gray-300 ring-1 ring-inset ring-gray-200"
                                                >
                                                    <ChevronDownIcon className="h-5 w-5" />
                                                </span>
                                            ) : (
                                                <Link
                                                    key={index}
                                                    href={link.url}
                                                    className="relative inline-flex h-10 w-10 items-center justify-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                                >
                                                    <ChevronDownIcon className="h-5 w-5" />
                                                </Link>
                                            );
                                        }

                                        return isDisabled ? (
                                            <span
                                                key={index}
                                                className="relative inline-flex h-10 w-10 cursor-not-allowed items-center justify-center px-4 py-2 text-sm font-semibold text-gray-400 ring-1 ring-inset ring-gray-200"
                                            >
                                                {link.label}
                                            </span>
                                        ) : (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                className={`relative inline-flex h-10 w-10 items-center justify-center px-4 py-2 text-sm font-semibold ${
                                                    link.active
                                                        ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                                                }`}
                                            >
                                                {link.label}
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            <DeleteConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, userId: null })}
                onConfirm={confirmDelete}
                isDeleting={processing}
            />
        </AppLayout>
    );
}
