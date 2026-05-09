'use client';

import { useState } from 'react';
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart, BarChart,
} from 'recharts';

interface MonthlyData {
  month: string;
  posts: number;
  views: number;
  users: number;
}

const mockData: MonthlyData[] = [
  { month: 'Jun', posts: 45, views: 2800, users: 120 },
  { month: 'Jul', posts: 52, views: 3200, users: 145 },
  { month: 'Aug', posts: 38, views: 2600, users: 98 },
  { month: 'Sep', posts: 61, views: 4100, users: 178 },
  { month: 'Oct', posts: 55, views: 3800, users: 165 },
  { month: 'Nov', posts: 48, views: 3400, users: 132 },
  { month: 'Dec', posts: 72, views: 5200, users: 210 },
  { month: 'Jan', posts: 68, views: 4800, users: 195 },
  { month: 'Feb', posts: 58, views: 3600, users: 155 },
  { month: 'Mar', posts: 74, views: 5600, users: 230 },
  { month: 'Apr', posts: 63, views: 4300, users: 188 },
  { month: 'May', posts: 80, views: 6100, users: 260 },
];

export function PerformanceChart() {
  const [year, setYear] = useState('2025');
  const data = mockData;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Performance Overview</h3>
          <p className="text-sm text-gray-500">Monthly posts, page views & new users</p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
        >
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: 13,
                }}
              />
              <Area type="monotone" dataKey="views" stroke="#2563eb" strokeWidth={2} fill="url(#viewsGradient)" name="Page Views" dot={{ r: 3, fill: '#2563eb' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: 13,
                }}
              />
              <Legend />
              <Bar dataKey="posts" fill="#2563eb" name="Posts" radius={[6, 6, 0, 0]} barSize={16} />
              <Bar dataKey="users" fill="#06b6d4" name="New Users" radius={[6, 6, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
