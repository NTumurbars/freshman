import React from 'react';
import { Title } from '@tremor/react';

export default function HeaderTitle({ children, icon, className = '' }) {
  return (
    <div className={`flex items-center ${className}`}>
      {icon && (
        <div className="mr-2 text-gray-600">
          {icon}
        </div>
      )}
      <Title>{children}</Title>
    </div>
  );
}
