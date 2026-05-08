'use client';

import { useState } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';

export default function ExternalRssPage() {
  const [feeds] = useState([
    { id: '1', name: 'Reuters Technology', url: 'https://www.reuters.com/technology/rss', status: 'syncing', lastSync: '2026-05-07 14:30' },
    { id: '2', name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss', status: 'active', lastSync: '2026-05-07 14:00' },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Syndication</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">External RSS Feeds</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-4"><p className="text-sm text-gray-500">Connected Feeds</p><p className="text-2xl font-bold text-gray-900">{feeds.length}</p></div>
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-4"><p className="text-sm text-gray-500">Active</p><p className="text-2xl font-bold text-green-600">{feeds.filter((f) => f.status === 'active').length}</p></div>
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-4"><p className="text-sm text-gray-500">Syncing</p><p className="text-2xl font-bold text-blue-600">{feeds.filter((f) => f.status === 'syncing').length}</p></div>
      </div>

      <div className="rounded-lg border border-(--border-default)">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-(--border-default) bg-gray-50">
            <th className="px-4 py-3 text-left font-medium text-gray-500">Feed Name</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">URL</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Last Sync</th>
            <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
          </tr></thead>
          <tbody>
            {feeds.map((feed) => (
              <tr key={feed.id} className="border-b border-(--border-default) last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900">{feed.name}</td>
                <td className="max-w-[250px] truncate px-4 py-3 text-gray-500">{feed.url}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    feed.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${feed.status === 'active' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`} />
                    {feed.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{feed.lastSync}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"><RefreshCw className="h-4 w-4" /></button>
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
