import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Show() {
    const { user, auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;
    console.log(user.professor_profile.department);

    return (
        <AppLayout userRole={userRole} school={school}>
            <Head title={user.name} />
            <div className="mx-auto max-w-3xl rounded-lg bg-gray-50 p-6 shadow-md">
                <h1 className="mb-4 text-3xl font-bold text-gray-900">
                    {user.name}
                </h1>

                <div className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-lg text-gray-700">
                        <strong>Role:</strong> {user.role.name}
                    </p>
                    <p className="text-lg text-gray-700">
                        <strong>Email:</strong> {user.email}
                    </p>
                    <p className="text-lg text-gray-700">
                        <strong>School:</strong> {school.name}
                    </p>

                    {/* Conditionally render department and profile details based on role */}
                    {(user.role.id === 3 || user.role.id === 4) &&
                    user.professor_profile ? (
                        <div className="mt-4 rounded-lg bg-gray-100 p-4">
                            <p className="text-md text-gray-700">
                                <strong>Department:</strong>{' '}
                                {user.professor_profile.department.name}
                            </p>
                            <p className="text-md text-gray-700">
                                <strong>Office Location:</strong>{' '}
                                {user.professor_profile?.office_location}
                            </p>
                            <p className="text-md text-gray-700">
                                <strong>Phone Number:</strong>{' '}
                                {user.professorProfile?.phone_number}
                            </p>
                        </div>
                    ) : userRole === 3 || userRole === 4 ? (
                        <p className="mt-4 italic text-gray-600">
                            This user has not yet created a professor profile.
                        </p>
                    ) : null}
                </div>
            </div>
        </AppLayout>
    );
}
