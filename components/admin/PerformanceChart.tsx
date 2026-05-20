'use client';

import { useState } from 'react';
import {
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart, BarChart,
} from 'recharts';

interface PerformanceChartProps {
  data: { month: string; posts: number; views: number; users: number }[];
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const [year, setYear] = useState('all');

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
          <option value="all">All time</option>
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
              <Area type="monotone" dataKey="posts" stroke="#2563eb" strokeWidth={2} fill="url(#viewsGradient)" name="Posts" dot={{ r: 3, fill: '#2563eb' }} />
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
              <Bar dataKey="views" fill="#2563eb" name="Views" radius={[6, 6, 0, 0]} barSize={16} />
              <Bar dataKey="users" fill="#06b6d4" name="Users" radius={[6, 6, 0, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {data.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">No performance data yet. Publish articles to see trends.</p>
      )}
    </div>
  );
}
