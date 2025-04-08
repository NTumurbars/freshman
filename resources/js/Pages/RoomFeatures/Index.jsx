import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage, useForm } from '@inertiajs/react';
import {
    Card,
    Title,
    Text,
    Table,
    TableHead,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Badge,
    Button,
    Icon,
} from '@tremor/react';
import {
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { Settings } from 'lucide-react';
import { useState } from 'react';

export default function Index({ features, school, can_create }) {
    const { auth, flash } = usePage().props;
    const userRole = auth.user.role.id;
    const { delete: destroy, processing: deleting } = useForm();
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('All');

    const handleDelete = (featureId) => {
        destroy(
            route('roomfeatures.destroy', {
                school: school.id,
                roomfeature: featureId,
            })
        );
    };

    const categoryColors = {
        'Technology': 'blue',
        'Furniture': 'amber',
        'Accessibility': 'green',
        'Safety': 'red',
        'Audio/Visual': 'purple',
        'Other': 'gray'
    };

    const categories = [
        'All',
        'Technology',
        'Furniture',
        'Accessibility',
        'Safety',
        'Audio/Visual',
        'Other'
    ];

    // Filter features by selected category
    const filteredFeatures = categoryFilter === 'All' 
        ? features 
        : features.filter(feature => feature.category === categoryFilter);

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title="Room Features" />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="flex items-center">
                        <Settings className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                            <Title>Room Features</Title>
                            <Text>Manage features that can be assigned to rooms</Text>
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
                        <Card className={`bg-${flash.type === 'success' ? 'green' : 'red'}-50 border-${flash.type === 'success' ? 'green' : 'red'}-200`}>
                            <div className="flex items-center">
                                <ExclamationCircleIcon className={`h-5 w-5 text-${flash.type === 'success' ? 'green' : 'red'}-500 mr-2`} />
                                <Text className={`text-${flash.type === 'success' ? 'green' : 'red'}-700`}>{flash.message}</Text>
                            </div>
                        </Card>
                    </div>
                )}

                <Card className="mt-6">
                    <div className="mb-6">
                        <Text className="mb-2">Filter by Category</Text>
                        <div className="flex flex-wrap gap-2">
                            {categories.map(category => (
                                <Badge
                                    key={category}
                                    color={categoryFilter === category ? 
                                        (category === 'All' ? 'blue' : categoryColors[category]) : 
                                        'gray'}
                                    size="lg"
                                    className={`cursor-pointer ${categoryFilter === category ? 'ring-2 ring-offset-1' : ''}`}
                                    onClick={() => setCategoryFilter(category)}
                                >
                                    {category}
                                </Badge>
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
                                <Link href={route('roomfeatures.create', school.id)} className="mt-4">
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
                                    <TableHeaderCell>Description</TableHeaderCell>
                                    <TableHeaderCell>Rooms</TableHeaderCell>
                                    <TableHeaderCell>Actions</TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredFeatures.map((feature) => (
                                    <TableRow key={feature.id}>
                                        <TableCell className="font-medium">
                                            <Link href={route('roomfeatures.show', { school: school.id, roomfeature: feature.id })}>
                                                {feature.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Badge color={categoryColors[feature.category] || 'gray'}>
                                                {feature.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {feature.description || <span className="text-gray-400 italic">No description</span>}
                                        </TableCell>
                                        <TableCell>
                                            {feature.rooms_count}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Link href={route('roomfeatures.edit', { school: school.id, roomfeature: feature.id })}>
                                                    <Button
                                                        variant="light"
                                                        color="blue"
                                                        icon={PencilIcon}
                                                        tooltip="Edit"
                                                        size="xs"
                                                    />
                                                </Link>
                                                
                                                {deleteConfirmId === feature.id ? (
                                                    <div className="flex space-x-2">
                                                        <Button
                                                            variant="light"
                                                            color="red"
                                                            size="xs"
                                                            loading={deleting}
                                                            onClick={() => handleDelete(feature.id)}
                                                        >
                                                            Confirm
                                                        </Button>
                                                        <Button
                                                            variant="light"
                                                            color="gray"
                                                            size="xs"
                                                            onClick={() => setDeleteConfirmId(null)}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="light"
                                                        color="red"
                                                        icon={TrashIcon}
                                                        tooltip="Delete"
                                                        size="xs"
                                                        onClick={() => setDeleteConfirmId(feature.id)}
                                                    />
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