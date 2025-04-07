import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';
import SectionForm from '@/Components/Forms/SectionForm';
import { useState } from 'react';

export default function Create({ courses, terms, professorProfiles, roomFeatures, school }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const userSchool = auth.user.school;

    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        course_id: '',
        term_id: '',
        professor_id: '',
        section_code: '',
        number_of_students: 0,
        required_features: []
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        post(route('sections.store', school.id), {
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
            <Head title="Create New Section" />

            <div className="mb-6 space-y-4">
                <Link
                    href={route('sections.index', school.id)}
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back to Sections
                </Link>

                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Create New Section</h1>
                    <p className="text-gray-600">{school.name}</p>
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
                        professors={professorProfiles}
                        roomFeatures={roomFeatures}
                        isSubmitting={isSubmitting || processing}
                        onSubmit={handleSubmit}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
