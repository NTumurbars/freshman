import { usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

/**
 * Higher-Order Component (HOC) to wrap pages with the AppLayout and automatically
 * pass the required sidebar props.
 *
 * @param {React.Component} Component - The page component to wrap
 * @returns {React.Component} - The wrapped component with sidebar functionality
 */
export default function withSidebar(Component) {
    return function WrappedComponent(props) {
        const { auth } = usePage().props;
        const userRole = auth.user.role.id;
        const school = auth.user.school;

        return (
            <AppLayout userRole={userRole} school={school}>
                <Component {...props} />
            </AppLayout>
        );
    };
}
