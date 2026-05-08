'use client';

import { useState } from 'react';
import { Trash2, Play } from 'lucide-react';

export default function StoriesPage() {
  const [stories] = useState([
    { id: '1', title: 'Tech Innovations 2026', slides: 5, views: 234, status: 'published' },
    { id: '2', title: 'World Cup Highlights', slides: 8, views: 567, status: 'published' },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Content</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">Story Manager</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[{ label: 'Total Stories', val: stories.length }, { label: 'Total Views', val: stories.reduce((s, st) => s + st.views, 0) }, { label: 'Published', val: stories.filter((s) => s.status === 'published').length }].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-(--border-default)">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-(--border-default) bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">Story</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Slides</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Views</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stories.map((story) => (
              <tr key={story.id} className="border-b border-(--border-default) last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900">{story.title}</td>
                <td className="px-4 py-3 text-gray-500">{story.slides}</td>
                <td className="px-4 py-3 text-gray-500">{story.views}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">{story.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"><Play className="h-4 w-4" /></button>
                    <button className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
