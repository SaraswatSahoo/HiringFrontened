import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '../ui/Card';

interface CGPAChartProps {
  data: Record<string, number>;
}

export const CGPAChart: React.FC<CGPAChartProps> = ({ data }) => {
  const chartData = Object.entries(data).map(([range, count]) => ({
    range,
    count,
  }));

  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-4">CGPA Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="range" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
          <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f1f5f9',
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#9333ea"
            strokeWidth={3}
            dot={{ fill: '#9333ea', r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};
