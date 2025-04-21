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

    // Log professor data for debugging
    useEffect(() => {
        console.log(
            'Professor profiles data in Edit component:',
            professorProfiles,
        );
        console.log('Section object:', section);
        console.log('Section capacity type:', typeof section.capacity);
        console.log('Section capacity value:', section.capacity);
    }, [professorProfiles, section]);

    // Extract feature IDs from section.requiredFeatures array
    const getRequiredFeatureIds = () => {
        if (
            !section.requiredFeatures ||
            !Array.isArray(section.requiredFeatures)
        ) {
            return [];
        }
        return section.requiredFeatures.map((feature) => feature.id);
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
        console.log('Capacity before submission:', data.capacity, typeof data.capacity);

        // Convert empty capacity string to null
        const submissionData = { ...data };
        if (submissionData.capacity === '') {
            submissionData.capacity = null;
        }

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
