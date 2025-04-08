export default function Card({
    title,
    subtitle,
    children,
    footer,
    noPadding = false,
    className = ''
}) {
    return (
        <div className={`overflow-hidden rounded-lg bg-white shadow ${className}`}>
            {(title || subtitle) && (
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                    {title && <h2 className="text-lg font-medium text-gray-900">{title}</h2>}
                    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                </div>
            )}

            <div className={noPadding ? '' : 'px-6 py-5'}>
                {children}
            </div>

            {footer && (
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
                    {footer}
                </div>
            )}
        </div>
    );
}
