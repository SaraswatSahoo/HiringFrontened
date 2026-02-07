import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '../ui/Card';

interface CollegeChartProps {
  data: Array<{
    collegeName: string;
    totalApplied: number;
  }>;
}

const COLORS = ['#9333ea', '#14b8a6', '#3b82f6', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'];

export const CollegeChart: React.FC<CollegeChartProps> = ({ data }) => {
  const chartData = data.slice(0, 7).map((item) => ({
    name: item.collegeName,
    value: item.totalApplied,
  }));

  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-4">Top Colleges</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              color: '#f1f5f9',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};
