import React from 'react';
import { Card, Text, Metric } from '@tremor/react';

export default function StatisticsCard({ title, value, icon }) {
  return (
    <Card className="flex items-center">
      {icon && (
        <div className="mr-3 text-gray-500">
          {icon}
        </div>
      )}
      <div>
        <Text>{title}</Text>
        <Metric>{value}</Metric>
      </div>
    </Card>
  );
}
