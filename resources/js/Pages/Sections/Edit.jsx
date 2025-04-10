import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import SectionForm from '@/Components/Forms/SectionForm';
import { useState, useEffect } from 'react';

export default function Edit({ section, courses, terms, professorProfiles, roomFeatures, school }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const userSchool = auth.user.school;

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Log professor data for debugging
    useEffect(() => {
        console.log("Professor profiles data in Edit component:", professorProfiles);
        console.log("Section object:", section);
    }, [professorProfiles]);

    // Extract feature IDs from section.requiredFeatures array
    const getRequiredFeatureIds = () => {
        if (!section.requiredFeatures || !Array.isArray(section.requiredFeatures)) {
            return [];
        }
        return section.requiredFeatures.map(feature => feature.id);
    };

    const { data, setData, put, processing, errors } = useForm({
        course_id: section.course_id || '',
        term_id: section.term_id || '',
        professor_profile_id: section.professor_profile_id || '',
        section_code: section.section_code || '',
        required_features: getRequiredFeatureIds(),
        status: section.status || 'active',
        delivery_method: section.delivery_method || 'in-person',
        notes: section.notes || '',
        capacity: section.capacity || '',
        students_count: section.students_count || 0
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        put(route('sections.update', [school.id, section.id]), {
            onSuccess: () => {
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    return (
        <AppLayout userRole={userRole} school={userSchool}>
            <Head title={`Edit Section: ${section.section_code}`} />

            <div className="mb-6 space-y-4">
                <Link
                    href={route('sections.show', [school.id, section.id])}
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back to Section Details
                </Link>

                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Edit Section: {section.section_code}</h1>
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
