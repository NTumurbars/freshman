import AppLayout from '@/Layouts/AppLayout';
import {
    ExclamationCircleIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
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
    Text,
    Title,
} from '@tremor/react';
import { Settings } from 'lucide-react';
import { useState } from 'react';

export default function Index({ features, school, can_create }) {
    const { flash } = usePage().props;
    const { delete: destroy, processing: deleting } = useForm();
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('All');

    const handleDelete = (featureId) => {
        destroy(
            route('roomfeatures.destroy', {
                school: school.id,
                roomfeature: featureId,
            }),
        );
    };

    const categoryColors = {
        Technology: 'blue',
        Furniture: 'amber',
        Accessibility: 'green',
        Safety: 'red',
        'Audio/Visual': 'purple',
        Other: 'gray',
    };

    const categories = [
        'All',
        'Technology',
        'Furniture',
        'Accessibility',
        'Safety',
        'Audio/Visual',
        'Other',
    ];

    // Filter features by selected category
    const filteredFeatures =
        categoryFilter === 'All'
            ? features
            : features.filter((feature) => feature.category === categoryFilter);

    return (
        <AppLayout>
            <Head title="Room Features" />

            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center">
                        <Settings className="mr-3 h-8 w-8 text-blue-600" />
                        <div>
                            <Title>Room Features</Title>
                            <Text>
                                Manage features that can be assigned to rooms
                            </Text>
                        </div>
                    </div>
                    {can_create && (
                        <Link href={route('roomfeatures.create', school.id)}>
                            <Button icon={PlusIcon}>Add Feature</Button>
                        </Link>
                    )}
                </div>

                {flash && flash.message && (
                    <div className="mt-4">
                        <Card
                            className={`bg-${flash.type === 'success' ? 'green' : 'red'}-50 border-${flash.type === 'success' ? 'green' : 'red'}-200`}
                        >
                            <div className="flex items-center">
                                <ExclamationCircleIcon
                                    className={`h-5 w-5 text-${flash.type === 'success' ? 'green' : 'red'}-500 mr-2`}
                                />
                                <Text
                                    className={`text-${flash.type === 'success' ? 'green' : 'red'}-700`}
                                >
                                    {flash.message}
                                </Text>
                            </div>
                        </Card>
                    </div>
                )}

                <Card className="mt-6">
                    <div className="mb-6">
                        <Text className="mb-2">Filter by Category</Text>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setCategoryFilter(category)}
                                    className={`
                                        relative flex items-center gap-2 rounded-full border px-4 py-1.5 
                                        text-sm font-medium transition-all duration-200
                                        ${categoryFilter === category
                                            ? category === 'All'
                                                ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                                                : `border-${categoryColors[category]}-200 bg-${categoryColors[category]}-50 text-${categoryColors[category]}-700 shadow-sm`
                                            : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    {/* カテゴリーインジケーター */}
                                    <span 
                                        className={`
                                            h-1.5 w-1.5 rounded-full
                                            ${categoryFilter === category
                                                ? category === 'All'
                                                    ? 'bg-blue-500'
                                                    : `bg-${categoryColors[category]}-500`
                                                : category === 'All'
                                                    ? 'bg-gray-300 group-hover:bg-blue-400'
                                                    : `bg-gray-300 group-hover:bg-${categoryColors[category]}-400`
                                            }
                                        `}
                                    />

                                    {/* カテゴリー名 */}
                                    <span className="relative">
                                        {category}
                                        
                                        {/* 選択時のアンダーライン */}
                                        {categoryFilter === category && (
                                            <span 
                                                className={`
                                                    absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full
                                                    ${category === 'All'
                                                        ? 'bg-blue-500/30'
                                                        : `bg-${categoryColors[category]}-500/30`
                                                    }
                                                `}
                                            />
                                        )}
                                    </span>

                                    {/* 選択時のグロー効果 */}
                                    {categoryFilter === category && (
                                        <span 
                                            className={`
                                                absolute inset-0 -z-10 rounded-full
                                                ${category === 'All'
                                                    ? 'shadow-[0_0_8px_-1px] shadow-blue-500/20'
                                                    : `shadow-[0_0_8px_-1px] shadow-${categoryColors[category]}-500/20`
                                                }
                                            `}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {filteredFeatures.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Settings className="h-12 w-12 text-gray-400" />
                            <Text className="mt-2">
                                {categoryFilter === 'All'
                                    ? 'No room features found'
                                    : `No ${categoryFilter} features found`}
                            </Text>
                            {can_create && categoryFilter === 'All' && (
                                <Link
                                    href={route(
                                        'roomfeatures.create',
                                        school.id,
                                    )}
                                    className="mt-4"
                                >
                                    <Button variant="light" icon={PlusIcon}>
                                        Add your first room feature
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell>Name</TableHeaderCell>
                                    <TableHeaderCell>Category</TableHeaderCell>
                                    <TableHeaderCell>
                                        Description
                                    </TableHeaderCell>
                                    <TableHeaderCell>Rooms</TableHeaderCell>
                                    <TableHeaderCell>Actions</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredFeatures.map((feature) => (
                                    <TableRow key={feature.id}>
                                        <TableCell className="font-medium">
                                            <Link
                                                href={route(
                                                    'roomfeatures.show',
                                                    {
                                                        school: school.id,
                                                        roomfeature: feature.id,
                                                    },
                                                )}
                                            >
                                                {feature.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                color={
                                                    categoryColors[
                                                        feature.category
                                                    ] || 'gray'
                                                }
                                            >
                                                {feature.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {feature.description || (
                                                <span className="italic text-gray-400">
                                                    No description
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {feature.rooms_count}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={route(
                                                        'roomfeatures.edit',
                                                        {
                                                            school: school.id,
                                                            roomfeature: feature.id,
                                                        },
                                                    )}
                                                >
                                                    <Button
                                                        variant="light"
                                                        color="blue"
                                                        icon={PencilIcon}
                                                        tooltip="Edit feature"
                                                        size="xs"
                                                        className="rounded-lg bg-blue-50 px-3 py-1.5 text-blue-600 transition-all hover:bg-blue-100 hover:text-blue-700"
                                                    >
                                                        Edit
                                                    </Button>
                                                </Link>

                                                {deleteConfirmId === feature.id ? (
                                                    <div className="flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 p-1">
                                                        <Text className="px-2 text-sm text-red-600">
                                                            Delete this feature?
                                                        </Text>
                                                        <div className="flex items-center gap-1">
                                                            <Button
                                                                variant="light"
                                                                color="red"
                                                                size="xs"
                                                                loading={deleting}
                                                                onClick={() => handleDelete(feature.id)}
                                                                className="rounded-lg bg-red-100 px-3 py-1.5 font-medium text-red-600 transition-all hover:bg-red-200"
                                                            >
                                                                {deleting ? (
                                                                    <span className="flex items-center gap-1">
                                                                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                                                                        Deleting...
                                                                    </span>
                                                                ) : (
                                                                    'Yes, delete'
                                                                )}
                                                            </Button>
                                                            <Button
                                                                variant="light"
                                                                color="gray"
                                                                size="xs"
                                                                onClick={() => setDeleteConfirmId(null)}
                                                                className="rounded-lg bg-white px-3 py-1.5 font-medium text-gray-600 transition-all hover:bg-gray-100"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="light"
                                                        color="red"
                                                        icon={TrashIcon}
                                                        tooltip="Delete feature"
                                                        size="xs"
                                                        onClick={() => setDeleteConfirmId(feature.id)}
                                                        className="rounded-lg bg-red-50 px-3 py-1.5 text-red-600 transition-all hover:bg-red-100 hover:text-red-700"
                                                    >
                                                        Delete
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </Card>
            </div>
        </AppLayout>
    );
}
