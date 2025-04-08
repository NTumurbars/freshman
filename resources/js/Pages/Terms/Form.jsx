import { useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';
import { useEffect } from 'react';

export default function TermForm({ term = null, school, submitLabel = 'Save Term' }) {
    console.log('School data in form:', school);

    const { data, setData, post, put, processing, errors } = useForm({
        name: term?.name || '',
        start_date: term?.start_date || '',
        end_date: term?.end_date || '',
        school_id: school?.id || '',
    });

    // Update school_id if school prop changes
    useEffect(() => {
        if (school?.id) {
            setData('school_id', school.id);
        }
    }, [school]);

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log('Submitting form with data:', data);
        console.log('School ID:', school?.id);

        if (term) {
            put(route('terms.update', { school: school.id, term: term.id }));
        } else {
            post(route('terms.store', { school: school.id }));
        }
    };

    if (!school || !school.id) {
        return (
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
                <p className="font-medium">Error: School information is missing</p>
                <p className="mt-1">The school information is required to create a term. Please try again or contact support.</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <InputLabel htmlFor="school" value="School" />
                <div className="mt-1 py-2 px-3 block w-full border border-gray-300 bg-gray-100 rounded-md">
                    {school.name}
                </div>
                <p className="mt-1 text-sm text-gray-500">The term will be associated with this school</p>
                {/* Hidden input to ensure school_id is submitted */}
                <input type="hidden" name="school_id" value={school.id} />
            </div>

            <div>
                <InputLabel htmlFor="name" value="Term Name" />
                <TextInput
                    id="name"
                    type="text"
                    className="mt-1 block w-full"
                    value={data.name}
                    onChange={e => setData('name', e.target.value)}
                    placeholder="e.g. Fall 2024"
                />
                <InputError message={errors.name} className="mt-2" />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <InputLabel htmlFor="start_date" value="Start Date" />
                    <TextInput
                        id="start_date"
                        type="date"
                        className="mt-1 block w-full"
                        value={data.start_date}
                        onChange={e => setData('start_date', e.target.value)}
                        disabled={term && term.sections_count > 0}
                    />
                    <InputError message={errors.start_date} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="end_date" value="End Date" />
                    <TextInput
                        id="end_date"
                        type="date"
                        className="mt-1 block w-full"
                        value={data.end_date}
                        onChange={e => setData('end_date', e.target.value)}
                        disabled={term && term.sections_count > 0}
                    />
                    <InputError message={errors.end_date} className="mt-2" />
                </div>
            </div>

            {term && term.sections_count > 0 && (
                <div className="rounded-md bg-yellow-50 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">
                                Term has active sections
                            </h3>
                            <div className="mt-2 text-sm text-yellow-700">
                                <p>
                                    This term has {term.sections_count} active {term.sections_count === 1 ? 'section' : 'sections'}.
                                    You cannot modify the start date or end date while sections are assigned.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-end">
                <button
                    type="submit"
                    disabled={processing}
                    className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest ${
                        processing
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-900 focus:outline-none focus:border-blue-900 focus:ring ring-blue-300'
                    } disabled:opacity-25 transition ease-in-out duration-150`}
                >
                    {processing ? 'Saving...' : submitLabel}
                </button>
            </div>
        </form>
    );
}
