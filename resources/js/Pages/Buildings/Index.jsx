import AppLayout from '@/Layouts/AppLayout';
import { usePage } from '@inertiajs/react';

const Block = ({ title, children, tagline, action }) => (
    <div className="rounded-lg bg-white p-6 shadow-md">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <p className="mt-2 text-lg text-gray-600">{children}</p>
        {tagline && <p className="mt-2 text-sm text-gray-500">{tagline}</p>}
        {action && (
            <div className="mt-4">
                <button
                    onClick={action}
                    className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                    Add Building
                </button>
            </div>
        )}
    </div>
);

export default function Index({ buildings }) {
    const { auth } = usePage().props;
    const userRole = auth.user.role.id;
    const school = auth.user.school;

    return (
        <AppLayout userRole={userRole} school={school}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {buildings.length > 0 ? (
                    buildings.map((building, index) => (
                        <Block
                            key={building.id}
                            title={`Building ${index + 1}`}
                            children={building.name}
                            tagline={`Floors: ${building.floors}`}
                        />
                    ))
                ) : (
                    <Block
                        title="No Buildings Yet"
                        children="It seems there are no buildings in your school. Start by adding a new building."
                        tagline="Add your first building."
                    />
                )}
            </div>
        </AppLayout>
    );
}
