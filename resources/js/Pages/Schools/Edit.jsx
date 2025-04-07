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
    const [isSaving, setIsSaving] = useState(false);
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            Object.keys(validationErrors).forEach(key => {
                toast.error(validationErrors[key]);
            });
            setIsSaving(false);
            return;
        }

        try {
            await put(route('schools.update', school.id), {
                onSuccess: () => {
                    toast.success('School settings updated successfully');
                    setIsSaving(false);
                },
                onError: (errors) => {
                    Object.keys(errors).forEach(key => {
                        toast.error(errors[key]);
                    });
                    setIsSaving(false);
                }
            });
        } catch (error) {
            console.error('Error updating school settings:', error);
            toast.error('An unexpected error occurred. Please try again.');
            setIsSaving(false);
        }
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
                        <Badge color={isSaving ? "yellow" : "green"} icon={isSaving ? undefined : CheckCircleIcon}>
                            {isSaving ? "Saving..." : "Up to date"}
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
                                <Tab className="!text-sm">System Settings</Tab>
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
                                                        disabled={isSaving}
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
                                                        disabled={isSaving}
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
                                                    disabled={isSaving}
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
                                                    disabled={isSaving}
                                                />
                                            </div>
                                            <div className="mt-4">
                                                <Text>Logo URL</Text>
                                                <TextInput
                                                    value={data.logo_url}
                                                    onChange={e => setData('logo_url', e.target.value)}
                                                    error={errors.logo_url}
                                                    placeholder="Enter logo URL"
                                                    disabled={isSaving}
                                                />
                                            </div>
                                            <div className="mt-4">
                                                <Text>Description</Text>
                                                <TextInput
                                                    value={data.description}
                                                    onChange={e => setData('description', e.target.value)}
                                                    error={errors.description}
                                                    placeholder="Enter school description"
                                                    disabled={isSaving}
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
                                                    disabled={isSaving}
                                                >
                                                    <option value="UTC">UTC</option>
                                                    <option value="America/New_York">Eastern Time</option>
                                                    <option value="America/Chicago">Central Time</option>
                                                    <option value="America/Denver">Mountain Time</option>
                                                    <option value="America/Los_Angeles">Pacific Time</option>
                                                    <option value="Asia/Tokyo">Japan Time</option>
                                                    <option value="Europe/London">London Time</option>
                                                    <option value="Europe/Paris">Central European Time</option>
                                                    <option value="Australia/Sydney">Sydney Time</option>
                                                </Select>
                                                {errors.timezone && (
                                                    <Text color="red" className="mt-1">{errors.timezone}</Text>
                                                )}
                                            </div>
                                        </FormSection>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                loading={isSaving}
                                                disabled={isSaving}
                                                className="w-32"
                                            >
                                                {isSaving ? 'Saving...' : 'Save Changes'}
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
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                                <div>
                                                    <Text>City</Text>
                                                    <TextInput
                                                        value={data.city}
                                                        onChange={e => setData('city', e.target.value)}
                                                        error={errors.city}
                                                        placeholder="City"
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                                <div>
                                                    <Text>State/Province</Text>
                                                    <TextInput
                                                        value={data.state}
                                                        onChange={e => setData('state', e.target.value)}
                                                        error={errors.state}
                                                        placeholder="State or province"
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                                <div>
                                                    <Text>Country</Text>
                                                    <TextInput
                                                        value={data.country}
                                                        onChange={e => setData('country', e.target.value)}
                                                        error={errors.country}
                                                        placeholder="Country"
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                                <div>
                                                    <Text>Postal Code</Text>
                                                    <TextInput
                                                        value={data.postal_code}
                                                        onChange={e => setData('postal_code', e.target.value)}
                                                        error={errors.postal_code}
                                                        placeholder="Postal code"
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                                <div>
                                                    <Text>Phone</Text>
                                                    <TextInput
                                                        value={data.phone}
                                                        onChange={e => setData('phone', e.target.value)}
                                                        error={errors.phone}
                                                        placeholder="Phone number"
                                                        disabled={isSaving}
                                                    />
                                                </div>
                                            </div>
                                        </FormSection>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                loading={isSaving}
                                                disabled={isSaving}
                                                className="w-32"
                                            >
                                                {isSaving ? 'Saving...' : 'Save Changes'}
                                            </Button>
                                        </div>
                                    </form>
                                </TabPanel>

                                <TabPanel>
                                    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                                        <FormSection
                                            title="System Settings"
                                            description="Configure system-wide preferences and defaults."
                                        >
                                            <div className="grid grid-cols-1 gap-6">
                                                <div>
                                                    <Text>Default Language</Text>
                                                    <Select
                                                        value={data.settings.default_language}
                                                        onValueChange={value => setData('settings', {
                                                            ...data.settings,
                                                            default_language: value
                                                        })}
                                                        error={errors.default_language}
                                                        disabled={isSaving}
                                                    >
                                                        <option value="en">English</option>
                                                        <option value="es">Spanish</option>
                                                        <option value="fr">French</option>
                                                        <option value="de">German</option>
                                                        <option value="zh">Chinese</option>
                                                        <option value="ja">Japanese</option>
                                                        <option value="ar">Arabic</option>
                                                        <option value="ru">Russian</option>
                                                    </Select>
                                                    {errors.default_language && (
                                                        <Text color="red" className="mt-1">{errors.default_language}</Text>
                                                    )}
                                                </div>

                                                <div>
                                                    <Text className="font-medium mb-2">Course Registration Settings</Text>
                                                    <div className="space-y-3 pl-3 border-l-2 border-gray-100">
                                                        <div>
                                                            <Text>Default Course Capacity</Text>
                                                            <TextInput
                                                                type="number"
                                                                value={data.settings.default_course_capacity}
                                                                onChange={e => setData('settings', {
                                                                    ...data.settings,
                                                                    default_course_capacity: e.target.value
                                                                })}
                                                                error={errors.default_course_capacity}
                                                                min="1"
                                                                disabled={isSaving}
                                                            />
                                                            {errors.default_course_capacity && (
                                                                <Text color="red" className="mt-1">{errors.default_course_capacity}</Text>
                                                            )}
                                                            <Text className="text-gray-500 text-sm mt-1">
                                                                Enter a positive number for default course capacity
                                                            </Text>
                                                        </div>
                                                        <div>
                                                            <Text>Registration Window (days before term)</Text>
                                                            <TextInput
                                                                type="number"
                                                                value={data.settings.registration_window_days}
                                                                onChange={e => setData('settings', {
                                                                    ...data.settings,
                                                                    registration_window_days: e.target.value
                                                                })}
                                                                error={errors.registration_window_days}
                                                                min="1"
                                                                disabled={isSaving}
                                                            />
                                                            {errors.registration_window_days && (
                                                                <Text color="red" className="mt-1">{errors.registration_window_days}</Text>
                                                            )}
                                                            <Text className="text-gray-500 text-sm mt-1">
                                                                Enter the number of days before term start when registration opens
                                                            </Text>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <Text className="font-medium mb-2">Notification Settings</Text>
                                                    <div className="space-y-3 pl-3 border-l-2 border-gray-100">
                                                        <div>
                                                            <Text>Email Notifications</Text>
                                                            <Select
                                                                value={data.settings.email_notifications || 'all'}
                                                                onValueChange={value => setData('settings', {
                                                                    ...data.settings,
                                                                    email_notifications: value
                                                                })}
                                                                error={errors.email_notifications}
                                                                disabled={isSaving}
                                                            >
                                                                <option value="all">All Notifications</option>
                                                                <option value="important">Important Only</option>
                                                                <option value="none">None</option>
                                                            </Select>
                                                            {errors.email_notifications && (
                                                                <Text color="red" className="mt-1">{errors.email_notifications}</Text>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <Text>Reminder Days</Text>
                                                            <TextInput
                                                                type="number"
                                                                value={data.settings.reminder_days || '7'}
                                                                onChange={e => setData('settings', {
                                                                    ...data.settings,
                                                                    reminder_days: e.target.value
                                                                })}
                                                                error={errors.reminder_days}
                                                                min="1"
                                                                max="30"
                                                                disabled={isSaving}
                                                            />
                                                            {errors.reminder_days && (
                                                                <Text color="red" className="mt-1">{errors.reminder_days}</Text>
                                                            )}
                                                            <Text className="text-gray-500 text-sm mt-1">
                                                                Enter the number of days before events to send reminders
                                                            </Text>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </FormSection>

                                        <div className="flex justify-end">
                                            <Button
                                                type="submit"
                                                loading={isSaving}
                                                disabled={isSaving}
                                                className="w-32"
                                            >
                                                {isSaving ? 'Saving...' : 'Save Changes'}
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
