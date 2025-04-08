import { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Card,
    Text,
    Tab,
    TabList,
    TabGroup,
    TabPanels,
    TabPanel,
    TextInput,
    Button,
    Grid,
    Col,
    Metric,
    Select,
    SelectItem,
    Badge,
    Title
} from '@tremor/react';
import { toast } from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import PageHeader from '@/Components/PageHeader';
import FormSection from '@/Components/FormSection';
import { UserIcon, BuildingOfficeIcon, HomeModernIcon, BookOpenIcon, CalendarIcon } from '@heroicons/react/24/outline';
import StatisticsCard from '@/Components/StatisticsCard';
import HeaderTitle from '@/Components/HeaderTitle';

export default function Edit({ school, stats, formErrors }) {
    const [activeTab, setActiveTab] = useState(0);
    const { auth, flash } = usePage().props;
    const userRole = auth.user.role.id;

    // Show success message if it exists in flash
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
    }, [flash?.success]);

    // Default values for form objects
    const defaultAcademicCalendar = {
        term_structure: 'semester',
        start_month: '8',
        term_duration: '16',
        break_duration: '2'
    };

    const defaultSettings = {
        default_language: 'en',
        default_course_capacity: '30',
        registration_window_days: '30',
        email_notifications: 'all',
        reminder_days: '7'
    };

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
        settings: school.settings || {
            default_language: 'en',
            default_course_capacity: '30',
            registration_window_days: '30',
            email_notifications: 'all',
            reminder_days: '7'
        }
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

    const validateForm = () => {
        const newErrors = {};

        // General Settings validation
        if (!data.name?.trim()) newErrors.name = 'School name is required';
        if (!data.code?.trim()) newErrors.code = 'School code is required';
        if (!data.email?.trim()) newErrors.email = 'School email is required';
        if (!data.timezone) newErrors.timezone = 'Timezone is required';

        // Academic Calendar validation
        const academic_calendar = data.academic_calendar || {};
        if (!academic_calendar.term_structure) {
            newErrors.term_structure = 'Term structure is required';
        }

        if (!academic_calendar.start_month) {
            newErrors.start_month = 'Start month is required';
        }

        const termDuration = parseInt(academic_calendar.term_duration);
        if (isNaN(termDuration) || termDuration < 1 || termDuration > 52) {
            newErrors.term_duration = 'Term duration must be between 1 and 52 weeks';
        }

        const breakDuration = parseInt(academic_calendar.break_duration);
        if (isNaN(breakDuration) || breakDuration < 0 || breakDuration > 8) {
            newErrors.break_duration = 'Break duration must be between 0 and 8 weeks';
        }

        // System Settings validation
        const settings = data.settings || {};
        if (!settings.default_language) {
            newErrors.default_language = 'Default language is required';
        }

        const courseCapacity = parseInt(settings.default_course_capacity);
        if (isNaN(courseCapacity) || courseCapacity < 1) {
            newErrors.default_course_capacity = 'Course capacity must be a positive number';
        }

        const registrationDays = parseInt(settings.registration_window_days);
        if (isNaN(registrationDays) || registrationDays < 1) {
            newErrors.registration_window_days = 'Registration window must be at least 1 day';
        }

        if (!settings.email_notifications) {
            newErrors.email_notifications = 'Email notification preference is required';
        }

        const reminderDays = parseInt(settings.reminder_days);
        if (isNaN(reminderDays) || reminderDays < 1 || reminderDays > 30) {
            newErrors.reminder_days = 'Reminder lead time must be between 1 and 30 days';
        }

        return newErrors;
    };

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title={`Edit ${school.name}`} />

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <PageHeader
                    title={school.name}
                    subtitle="Manage school settings and configuration"
                    breadcrumbs={[
                        { title: 'Schools', url: route('schools.index') },
                        { title: school.name }
                    ]}
                    backUrl={route('schools.index')}
                    actions={
                        <Badge color={processing ? "yellow" : "green"} icon={processing ? undefined : CheckCircleIcon}>
                            {processing ? "Saving..." : "Up to date"}
                        </Badge>
                    }
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 mb-6">
                    <StatisticsCard
                        title="Total Users"
                        value={stats.total_users}
                        icon={<UserIcon className="h-5 w-5" />}
                    />
                    <StatisticsCard
                        title="Departments"
                        value={stats.total_departments}
                        icon={<BuildingOfficeIcon className="h-5 w-5" />}
                    />
                    <StatisticsCard
                        title="Buildings"
                        value={stats.total_buildings}
                        icon={<HomeModernIcon className="h-5 w-5" />}
                    />
                    <StatisticsCard
                        title="Active Terms"
                        value={stats.total_active_terms}
                        icon={<CalendarIcon className="h-5 w-5" />}
                    />
                </div>

                <div className="space-y-6">
                    <TabGroup index={activeTab} onIndexChange={setActiveTab}>
                        <Card>
                            <TabList className="border-b border-gray-200 -mx-4 px-4 -mt-2">
                                <Tab className="!text-sm">General Information</Tab>
                                <Tab className="!text-sm">Contact Details</Tab>
                            </TabList>

                            <TabPanels>
                                <TabPanel>
                                    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                                        <FormSection
                                            title="Basic Information"
                                            description="Update the school's basic information and identity."
                                        >
                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                <div>
                                                    <Text>School Name</Text>
                                                    <TextInput
                                                        value={data.name}
                                                        onChange={e => setData('name', e.target.value)}
                                                        error={errors.name}
                                                        placeholder="Enter school name"
                                                        disabled={processing}
                                                    />
                                                    {errors.name && (
                                                        <Text color="red" className="mt-1">{errors.name}</Text>
                                                    )}
                                                </div>
                                                <div>
                                                    <Text>School Code</Text>
                                                    <TextInput
                                                        value={data.code}
                                                        onChange={e => setData('code', e.target.value)}
                                                        error={errors.code}
                                                        placeholder="Enter school code"
                                                        disabled={processing}
                                                    />
                                                    {errors.code && (
                                                        <Text color="red" className="mt-1">{errors.code}</Text>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="mt-4">
                                                <Text>Email</Text>
                                                <TextInput
                                                    value={data.email}
                                                    onChange={e => setData('email', e.target.value)}
                                                    error={errors.email}
                                                    placeholder="Enter school email"
                                                    disabled={processing}
                                                />
                                                {errors.email && (
                                                    <Text color="red" className="mt-1">{errors.email}</Text>
                                                )}
                                            </div>
                                            <div className="mt-4">
                                                <Text>Website URL</Text>
                                                <TextInput
                                                    value={data.website_url}
                                                    onChange={e => setData('website_url', e.target.value)}
                                                    error={errors.website_url}
                                                    placeholder="Enter website URL"
                                                    disabled={processing}
                                                />
                                            </div>
                                            <div className="mt-4">
                                                <Text>Logo URL</Text>
                                                <TextInput
                                                    value={data.logo_url}
                                                    onChange={e => setData('logo_url', e.target.value)}
                                                    error={errors.logo_url}
                                                    placeholder="Enter logo URL"
                                                    disabled={processing}
                                                />
                                            </div>
                                            <div className="mt-4">
                                                <Text>Description</Text>
                                                <TextInput
                                                    value={data.description}
                                                    onChange={e => setData('description', e.target.value)}
                                                    error={errors.description}
                                                    placeholder="Enter school description"
                                                    disabled={processing}
                                                />
                                            </div>
                                        </FormSection>

                                        <FormSection
                                            title="Regional Settings"
                                            description="Configure timezone and regional preferences."
                                        >
                                            <div>
                                                <Text>Timezone</Text>
                                                <Select
                                                    value={data.timezone}
                                                    onValueChange={value => setData('timezone', value)}
                                                    error={errors.timezone}
                                                    placeholder="Select timezone"
                                                    disabled={processing}
                                                >
                                                    <SelectItem value="UTC">UTC</SelectItem>
                                                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                                                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                                                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                                    <SelectItem value="Asia/Tokyo">Japan Time</SelectItem>
                                                    <SelectItem value="Europe/London">London Time</SelectItem>
                                                    <SelectItem value="Europe/Paris">Central European Time</SelectItem>
                                                    <SelectItem value="Australia/Sydney">Sydney Time</SelectItem>
                                                </Select>
                                                {errors.timezone && (
                                                    <Text color="red" className="mt-1">{errors.timezone}</Text>
                                                )}
                                                <Text className="text-gray-500 text-xs mt-1">
                                                    System-wide timezone for scheduling
                                                </Text>
                                            </div>
                                        </FormSection>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                loading={processing}
                                                disabled={processing}
                                                className="w-32"
                                            >
                                                {processing ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </div>
                                    </form>
                                </TabPanel>

                                <TabPanel>
                                    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                                        <FormSection
                                            title="Contact Information"
                                            description="Update the school's contact details and address."
                                        >
                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                <div>
                                                    <Text>Address</Text>
                                                    <TextInput
                                                        value={data.address}
                                                        onChange={e => setData('address', e.target.value)}
                                                        error={errors.address}
                                                        placeholder="Street address"
                                                        disabled={processing}
                                                    />
                                                </div>
                                                <div>
                                                    <Text>City</Text>
                                                    <TextInput
                                                        value={data.city}
                                                        onChange={e => setData('city', e.target.value)}
                                                        error={errors.city}
                                                        placeholder="City"
                                                        disabled={processing}
                                                    />
                                                </div>
                                                <div>
                                                    <Text>State/Province</Text>
                                                    <TextInput
                                                        value={data.state}
                                                        onChange={e => setData('state', e.target.value)}
                                                        error={errors.state}
                                                        placeholder="State or province"
                                                        disabled={processing}
                                                    />
                                                </div>
                                                <div>
                                                    <Text>Country</Text>
                                                    <TextInput
                                                        value={data.country}
                                                        onChange={e => setData('country', e.target.value)}
                                                        error={errors.country}
                                                        placeholder="Country"
                                                        disabled={processing}
                                                    />
                                                </div>
                                                <div>
                                                    <Text>Postal Code</Text>
                                                    <TextInput
                                                        value={data.postal_code}
                                                        onChange={e => setData('postal_code', e.target.value)}
                                                        error={errors.postal_code}
                                                        placeholder="Postal code"
                                                        disabled={processing}
                                                    />
                                                </div>
                                                <div>
                                                    <Text>Phone</Text>
                                                    <TextInput
                                                        value={data.phone}
                                                        onChange={e => setData('phone', e.target.value)}
                                                        error={errors.phone}
                                                        placeholder="Phone number"
                                                        disabled={processing}
                                                    />
                                                </div>
                                            </div>
                                        </FormSection>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                loading={processing}
                                                disabled={processing}
                                                className="w-32"
                                            >
                                                {processing ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </div>
                                    </form>
                                </TabPanel>
                            </TabPanels>
                        </Card>
                    </TabGroup>
                </div>
            </div>
        </AppLayout>
    );
}
