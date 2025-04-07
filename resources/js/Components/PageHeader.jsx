import { ChevronRight, ArrowLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function PageHeader({
    title,
    subtitle,
    breadcrumbs = [],
    actions,
    backUrl
}) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                <div>
                    {/* Breadcrumbs */}
                    <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                        {backUrl && (
                            <Link
                                href={backUrl}
                                className="inline-flex items-center text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Back
                            </Link>
                        )}
                        {breadcrumbs.length > 0 && backUrl && <ChevronRight className="h-4 w-4" />}
                        {breadcrumbs.map((item, index) => (
                            <div key={item.title} className="flex items-center">
                                {index > 0 && <ChevronRight className="h-4 w-4 mx-2" />}
                                {item.url ? (
                                    <Link
                                        href={item.url}
                                        className="hover:text-gray-900"
                                    >
                                        {item.title}
                                    </Link>
                                ) : (
                                    <span className="text-gray-900">{item.title}</span>
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* Title and Subtitle */}
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    {subtitle && (
                        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                    )}
                </div>

                {/* Actions */}
                {actions && (
                    <div className="flex items-center space-x-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
