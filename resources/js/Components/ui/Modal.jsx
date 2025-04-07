import { X } from 'lucide-react';
import BaseModal from '@/Components/Modal';

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
    title = null,
}) {
    return (
        <BaseModal
            show={show}
            maxWidth={maxWidth}
            closeable={closeable}
            onClose={onClose}
        >
            {title && (
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                    {closeable && (
                        <button
                            type="button"
                            className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
            )}
            {children}
        </BaseModal>
    );
} 