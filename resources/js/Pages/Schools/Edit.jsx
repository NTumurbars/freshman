import FormSection from '@/Components/FormSection';
import PageHeader from '@/Components/PageHeader';
import StatisticsCard from '@/Components/StatisticsCard';
import AppLayout from '@/Layouts/AppLayout';
import {
    BuildingOfficeIcon,
    CalendarIcon,
    HomeModernIcon,
    UserIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Badge,
    Button,
    Card,
    Select,
    SelectItem,
    Tab,
    TabGroup,
    TabList,
    TabPanel,
    TabPanels,
    Text,
    TextInput,
} from '@tremor/react';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

export default function Edit({ school, stats, formErrors }) {
    const [activeTab, setActiveTab] = useState(0);
    const { flash } = usePage().props;

    // Show success message if it exists in flash
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash?.success]);

    // Initialize form with proper handling for potentially missing fields
    const { data, setData, errors, put, processing } = useForm({
        name: school.name || '',
        code: school.code || '',
        email: school.email || '',
        website_url: school.website_url || '',
        logo_url: school.logo_url || '',
        description: school.description || '',
        address: school.address || '',
        city: school.city || '',
        state: school.state || '',
        country: school.country || '',
        postal_code: school.postal_code || '',
        phone: school.phone || '',
        timezone: school.timezone || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('schools.update', school.id), {
            onSuccess: () => {
                toast.success('School updated successfully');
            },
            onError: (errors) => {
                console.log('Errors:', errors); // Error logging
                toast.error('Something went wrong');
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Edit ${school.name}`} />

            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <PageHeader
                        title={school.name}
                        subtitle="Manage school settings and configuration"
                        actions={
                            <Badge
                                color={processing ? 'yellow' : 'green'}
                                icon={processing ? undefined : CheckCircleIcon}
                                className="shadow-sm"
                            >
                                {processing ? 'Saving...' : 'Up to date'}
                            </Badge>
                        }
                    />
                </div>

                <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="transform transition-all hover:-translate-y-1 hover:shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-blue-50 p-3">
                                <UserIcon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <Text className="text-sm text-gray-500">Total Users</Text>
                                <Text className="text-2xl font-bold text-gray-900">{stats.total_users}</Text>
                            </div>
                        </div>
                    </Card>

                    <Card className="transform transition-all hover:-translate-y-1 hover:shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-purple-50 p-3">
                                <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <Text className="text-sm text-gray-500">Departments</Text>
                                <Text className="text-2xl font-bold text-gray-900">{stats.total_departments}</Text>
                            </div>
                        </div>
                    </Card>

                    <Card className="transform transition-all hover:-translate-y-1 hover:shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-emerald-50 p-3">
                                <HomeModernIcon className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <Text className="text-sm text-gray-500">Buildings</Text>
                                <Text className="text-2xl font-bold text-gray-900">{stats.total_buildings}</Text>
                            </div>
                        </div>
                    </Card>

                    <Card className="transform transition-all hover:-translate-y-1 hover:shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-amber-50 p-3">
                                <CalendarIcon className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <Text className="text-sm text-gray-500">Active Terms</Text>
                                <Text className="text-2xl font-bold text-gray-900">{stats.total_active_terms}</Text>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <TabGroup 
                        index={activeTab} 
                        onIndexChange={setActiveTab}
                        className="rounded-xl bg-white shadow-sm ring-1 ring-gray-200"
                    >
                        <TabList className="border-b border-gray-200 px-6 py-2">
                            <Tab className="relative px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 ui-selected:text-blue-600 ui-selected:after:absolute ui-selected:after:bottom-[-9px] ui-selected:after:left-0 ui-selected:after:h-0.5 ui-selected:after:w-full ui-selected:after:bg-blue-600">
                                General Information
                            </Tab>
                            <Tab className="relative px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 ui-selected:text-blue-600 ui-selected:after:absolute ui-selected:after:bottom-[-9px] ui-selected:after:left-0 ui-selected:after:h-0.5 ui-selected:after:w-full ui-selected:after:bg-blue-600">
                                Contact Details
                            </Tab>
                        </TabList>

                        <TabPanels className="p-6">
                            <TabPanel>
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="space-y-6">
                                        <div>
                                            <Text className="mb-2 font-medium text-gray-700">School Name</Text>
                                            <TextInput
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="Enter school name"
                                                disabled={processing}
                                                className="rounded-lg shadow-sm"
                                                error={errors.name}
                                            />
                                            {errors.name && (
                                                <Text color="red" className="mt-1 text-sm">
                                                    {errors.name}
                                                </Text>
                                            )}
                                        </div>
                                        <div>
                                            <Text className="mb-2 font-medium text-gray-700">School Code</Text>
                                            <TextInput
                                                value={data.code}
                                                onChange={(e) => setData('code', e.target.value)}
                                                placeholder="Enter school code"
                                                disabled={processing}
                                                className="rounded-lg shadow-sm"
                                                error={errors.code}
                                            />
                                            {errors.code && (
                                                <Text color="red" className="mt-1 text-sm">
                                                    {errors.code}
                                                </Text>
                                            )}
                                        </div>
                                        <div>
                                            <Text className="mb-2 font-medium text-gray-700">Email</Text>
                                            <TextInput
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="Enter school email"
                                                disabled={processing}
                                                className="rounded-lg shadow-sm"
                                                error={errors.email}
                                            />
                                            {errors.email && (
                                                <Text color="red" className="mt-1 text-sm">
                                                    {errors.email}
                                                </Text>
                                            )}
                                        </div>
                                        <div>
                                            <Text className="mb-2 font-medium text-gray-700">Website URL</Text>
                                            <TextInput
                                                value={data.website_url}
                                                onChange={(e) => setData('website_url', e.target.value)}
                                                placeholder="Enter website URL"
                                                disabled={processing}
                                                className="rounded-lg shadow-sm"
                                                error={errors.website_url}
                                            />
                                        </div>
                                        <div>
                                            <Text className="mb-2 font-medium text-gray-700">Logo URL</Text>
                                            <TextInput
                                                value={data.logo_url}
                                                onChange={(e) => setData('logo_url', e.target.value)}
                                                placeholder="Enter logo URL"
                                                disabled={processing}
                                                className="rounded-lg shadow-sm"
                                                error={errors.logo_url}
                                            />
                                        </div>
                                        <div>
                                            <Text className="mb-2 font-medium text-gray-700">Description</Text>
                                            <TextInput
                                                value={data.description}
                                                onChange={(e) => setData('description', e.target.value)}
                                                placeholder="Enter school description"
                                                disabled={processing}
                                                className="rounded-lg shadow-sm"
                                                error={errors.description}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6">
                                        <Button
                                            type="submit"
                                            loading={processing}
                                            disabled={processing}
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-white shadow-sm transition-all hover:shadow-md"
                                        >
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            </TabPanel>

                            <TabPanel>
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="space-y-6">
                                        <div>
                                            <Text className="mb-2 font-medium text-gray-700">Address</Text>
                                            <TextInput
                                                value={data.address}
                                                onChange={(e) => setData('address', e.target.value)}
                                                placeholder="Street address"
                                                disabled={processing}
                                                className="rounded-lg shadow-sm"
                                                error={errors.address}
                                            />
                                        </div>
                                        <div>
                                            <Text className="mb-2 font-medium text-gray-700">City</Text>
                                            <TextInput
                                                value={data.city}
                                                onChange={(e) => setData('city', e.target.value)}
                                                placeholder="City"
                                                disabled={processing}
                                                className="rounded-lg shadow-sm"
                                                error={errors.city}
                                            />
                                        </div>
                                        <div>
                                            <Text className="mb-2 font-medium text-gray-700">State/Province</Text>
                                            <TextInput
                                                value={data.state}
                                                onChange={(e) => setData('state', e.target.value)}
                                                placeholder="State or province"
                                                disabled={processing}
                                                className="rounded-lg shadow-sm"
                                                error={errors.state}
                                            />
                                        </div>
                                        <div>
                                            <Text className="mb-2 font-medium text-gray-700">Country</Text>
                                            <TextInput
                                                value={data.country}
                                                onChange={(e) => setData('country', e.target.value)}
                                                placeholder="Country"
                                                disabled={processing}
                                                className="rounded-lg shadow-sm"
                                                error={errors.country}
                                            />
                                        </div>
                                        <div>
                                            <Text className="mb-2 font-medium text-gray-700">Postal Code</Text>
                                            <TextInput
                                                value={data.postal_code}
                                                onChange={(e) => setData('postal_code', e.target.value)}
                                                placeholder="Postal code"
                                                disabled={processing}
                                                className="rounded-lg shadow-sm"
                                                error={errors.postal_code}
                                            />
                                        </div>
                                        <div>
                                            <Text className="mb-2 font-medium text-gray-700">Phone</Text>
                                            <TextInput
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="Phone number"
                                                disabled={processing}
                                                className="rounded-lg shadow-sm"
                                                error={errors.phone}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-6">
                                        <Button
                                            type="submit"
                                            loading={processing}
                                            disabled={processing}
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2.5 text-white shadow-sm transition-all hover:shadow-md"
                                        >
                                            {processing ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                    </div>
                                </form>
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
                </div>
            </div>
        </AppLayout>
    );
}
