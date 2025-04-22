// resources/js/Pages/Schools/Create.jsx

import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { Building, Mail, Globe, Image, FileText, BookOpen, Clipboard } from 'lucide-react';

export default function Create() {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        email: '',
        code: '',
        website_url: '',
        logo_url: '',
        description: '',
    });

    const submit = (e) => {
        e.preventDefault();
        console.log('Submitting data:', data);

        post(route('schools.store'), {
            onSuccess: () => {
                toast.success('School created successfully');
            },
            onError: (errors) => {
                console.log('Errors:', errors);
                toast.error('Something went wrong');
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Create School" />

            <div className="mx-auto max-w-4xl">
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Create a New School</h1>
                </div>

                <div className="rounded-lg bg-white p-6 shadow">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* School Name */}
                            <div className="col-span-2">
                                <label className="block font-medium text-gray-700">
                                    School Name <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500">
                                        <Building className="h-4 w-4" />
                                    </span>
                                    <input
                                        type="text"
                                        className="block w-full rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="University of Example"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                </div>
                                {errors.name && (
                                    <div className="mt-1 text-sm text-red-600">
                                        {errors.name}
                                    </div>
                                )}
                            </div>

                            {/* School Code */}
                            <div>
                                <label className="block font-medium text-gray-700">
                                    School Code <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500">
                                        <Clipboard className="h-4 w-4" />
                                    </span>
                                    <input
                                        type="text"
                                        className="block w-full rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="UOE"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        required
                                    />
                                </div>
                                {errors.code && (
                                    <div className="mt-1 text-sm text-red-600">
                                        {errors.code}
                                    </div>
                                )}
                            </div>

                            {/* Admin Email */}
                            <div>
                                <label className="block font-medium text-gray-700">
                                    Admin Email <span className="text-red-500">*</span>
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500">
                                        <Mail className="h-4 w-4" />
                                    </span>
                                    <input
                                        type="email"
                                        className="block w-full rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="admin@example.edu"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                </div>
                                {errors.email && (
                                    <div className="mt-1 text-sm text-red-600">
                                        {errors.email}
                                    </div>
                                )}
                            </div>

                            {/* Website URL */}
                            <div>
                                <label className="block font-medium text-gray-700">
                                    Website URL
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500">
                                        <Globe className="h-4 w-4" />
                                    </span>
                                    <input
                                        type="url"
                                        className="block w-full rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="https://www.example.edu"
                                        value={data.website_url}
                                        onChange={(e) => setData('website_url', e.target.value)}
                                    />
                                </div>
                                {errors.website_url && (
                                    <div className="mt-1 text-sm text-red-600">
                                        {errors.website_url}
                                    </div>
                                )}
                            </div>

                            {/* Logo URL */}
                            <div>
                                <label className="block font-medium text-gray-700">
                                    Logo URL
                                </label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500">
                                        <Image className="h-4 w-4" />
                                    </span>
                                    <input
                                        type="url"
                                        className="block w-full rounded-r-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="https://www.example.edu/logo.png"
                                        value={data.logo_url}
                                        onChange={(e) => setData('logo_url', e.target.value)}
                                    />
                                </div>
                                {errors.logo_url && (
                                    <div className="mt-1 text-sm text-red-600">
                                        {errors.logo_url}
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="col-span-2">
                                <label className="block font-medium text-gray-700">
                                    Description
                                </label>
                                <div className="mt-1">
                                    <textarea
                                        rows={4}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        placeholder="Brief description of the school..."
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                </div>
                                {errors.description && (
                                    <div className="mt-1 text-sm text-red-600">
                                        {errors.description}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={() => window.history.back()}
                                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                {processing ? 'Creating...' : 'Create School'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
