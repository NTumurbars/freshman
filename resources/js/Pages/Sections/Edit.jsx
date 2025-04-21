import SectionForm from '@/Components/Forms/SectionForm';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Edit({
    section,
    courses,
    terms,
    professorProfiles,
    roomFeatures,
    school,
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Log initial section data
    useEffect(() => {
        console.log(
            'Professor profiles data in Edit component:',
            professorProfiles,
        );
        console.log('Section object:', section);
        console.log('Section capacity type:', typeof section.capacity);
        console.log('Section capacity value:', section.capacity);
        console.log('Section required features:', section.requiredFeatures || section.required_features);
    }, [professorProfiles, section]);

    // Extract feature IDs from section.required_features array (the property coming from backend)
    const getRequiredFeatureIds = () => {
        // Logs show the property is 'required_features' (with underscore)
        const features = section.required_features || [];
        console.log('Feature array found:', features);

        if (!Array.isArray(features)) {
            console.log('Features is not an array');
            return [];
        }

        // Make sure all feature IDs are numbers
        const featureIds = features.map((feature) => {
            // Features are objects with id property
            const id = typeof feature.id === 'string' ? parseInt(feature.id, 10) : feature.id;
            return id;
        });

        console.log('Extracted feature IDs:', featureIds);
        return featureIds;
    };

    // Map "open" status to "active" to match backend validation
    const mapStatus = (status) => {
        if (status === 'open') return 'active';
        return status || 'active';
    };

    const { data, setData, put, processing, errors } = useForm({
        course_id: section.course_id || '',
        term_id: section.term_id || '',
        professor_profile_id: section.professor_profile_id || '',
        section_code: section.section_code || '',
        required_features: getRequiredFeatureIds(),
        status: mapStatus(section.status),
        delivery_method: section.delivery_method || 'in-person',
        notes: section.notes || '',
        capacity: !section.capacity || section.capacity === 0 ? '' : section.capacity,
        students_count: section.students_count || 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        console.log('Submitting form with data:', data);
        console.log('Required features:', data.required_features, typeof data.required_features);
        console.log('Required features is array:', Array.isArray(data.required_features));
        console.log('Capacity before submission:', data.capacity, typeof data.capacity);

        // Convert empty capacity string to null
        const submissionData = { ...data };
        if (submissionData.capacity === '') {
            submissionData.capacity = null;
        }

        // Ensure required_features is an array of numbers
        if (submissionData.required_features) {
            // Make sure it's an array
            const featuresArray = Array.isArray(submissionData.required_features)
                ? submissionData.required_features
                : [];

            // Convert all values to numbers and filter out any non-numeric
            submissionData.required_features = featuresArray
                .map(id => typeof id === 'string' ? parseInt(id, 10) : id)
                .filter(id => !isNaN(id));

            console.log('Final required_features for submission:', submissionData.required_features);
        } else {
            console.log('No required_features found for submission');
            submissionData.required_features = [];
        }

        console.log('Final submission data:', submissionData);

        put(route('sections.update', [school.id, section.id]), submissionData, {
            onSuccess: () => {
                setIsSubmitting(false);
            },
            onError: (errors) => {
                console.error('Submission errors:', errors);
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AppLayout>
            <Head title={`Edit Section: ${section.section_code}`} />

            <div className="mb-6 space-y-4">
                <Link
                    href={route('sections.show', [school.id, section.id])}
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back to Section
                    Details
                </Link>

                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Edit Section: {section.section_code}
                    </h1>
                    <p className="text-gray-600">{section.course?.title}</p>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
                <div className="px-6 py-6">
                    <SectionForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        courses={courses}
                        terms={terms}
                        professorProfiles={professorProfiles}
                        roomFeatures={roomFeatures}
                        isSubmitting={isSubmitting || processing}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
