import { ChevronLeft } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function PageHeader({
    title,
    subtitle,
    backUrl,
    backLabel,
    actions
}) {
    return (
        <div className="mb-6 space-y-4">
            {backUrl && (
                <Link
                    href={backUrl}
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" /> {backLabel || 'Back'}
                </Link>
            )}

            <div className="flex flex-col justify-between space-y-4 md:flex-row md:items-center md:space-y-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                    {subtitle && <p className="text-gray-600">{subtitle}</p>}
                </div>

                {actions && (
                    <div className="flex flex-wrap gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
