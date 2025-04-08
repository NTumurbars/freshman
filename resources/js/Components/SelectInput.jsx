import React from 'react';

export default function SelectInput({
    name,
    id,
    value,
    className = '',
    required = false,
    disabled = false,
    children,
    onChange,
    error = false,
    ...props
}) {
    return (
        <select
            name={name}
            id={id || name}
            value={value}
            className={`mt-1 block w-full rounded-md border ${
                error ? 'border-red-300' : 'border-gray-300'
            } px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm ${className}`}
            required={required}
            disabled={disabled}
            onChange={(e) => onChange(e)}
            {...props}
        >
            {children}
        </select>
    );
}
