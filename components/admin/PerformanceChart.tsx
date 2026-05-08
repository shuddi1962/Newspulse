'use client';

import { useState } from 'react';
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart,
} from 'recharts';

interface MonthlyData {
  month: string;
  posts: number;
  reports: number;
  visitors: number;
}

const mockData: MonthlyData[] = [
  { month: 'Jun', posts: 45, reports: 12, visitors: 2800 },
  { month: 'Jul', posts: 52, reports: 15, visitors: 3200 },
  { month: 'Aug', posts: 38, reports: 10, visitors: 2600 },
  { month: 'Sep', posts: 61, reports: 18, visitors: 4100 },
  { month: 'Oct', posts: 55, reports: 14, visitors: 3800 },
  { month: 'Nov', posts: 48, reports: 11, visitors: 3400 },
  { month: 'Dec', posts: 72, reports: 20, visitors: 5200 },
  { month: 'Jan', posts: 68, reports: 17, visitors: 4800 },
  { month: 'Feb', posts: 58, reports: 13, visitors: 3600 },
  { month: 'Mar', posts: 74, reports: 22, visitors: 5600 },
  { month: 'Apr', posts: 63, reports: 16, visitors: 4300 },
  { month: 'May', posts: 80, reports: 25, visitors: 6100 },
];

export function PerformanceChart() {
  const [year, setYear] = useState('2025');
  const data = mockData;

  return (
    <div className="rounded-lg border border-[var(--color-admin-border)] bg-[var(--color-admin-card)] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-admin-text)]">Performance Overview</h3>
          <p className="text-sm text-[var(--color-admin-text-muted)]">Monthly posts, reports & visitors</p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="rounded-md border border-[var(--color-admin-border)] bg-white px-3 py-1.5 text-sm text-[var(--color-admin-text)]"
        >
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e9ecef" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#718096' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#718096' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #e9ecef',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            />
            <Legend />
            <Bar dataKey="posts" fill="#059669" name="Posts" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar dataKey="reports" fill="#1a2332" name="Reports" radius={[4, 4, 0, 0]} barSize={20} />
            <Line type="monotone" dataKey="visitors" stroke="#e63946" name="Visitors" strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
