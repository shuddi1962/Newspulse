'use client';

import { useState } from 'react';
import { Plus, RefreshCw, Trash2 } from 'lucide-react';

interface Feed {
  id: string;
  name: string;
  url: string;
  category: string;
  status: 'active' | 'error' | 'paused';
  lastSynced: string;
  articlesImported: number;
}

export default function RssFeedsPage() {
  const [feeds, setFeeds] = useState<Feed[]>([
    { id: '1', name: 'Tech News', url: 'https://example.com/tech/rss', category: 'Technology', status: 'active', lastSynced: '2026-05-07 14:30', articlesImported: 142 },
    { id: '2', name: 'World News', url: 'https://example.com/world/rss', category: 'World', status: 'active', lastSynced: '2026-05-07 14:25', articlesImported: 89 },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', url: '', category: '', autoPublish: false, manualApprove: true, frequency: '360' });

  const addFeed = () => {
    if (!form.name.trim() || !form.url.trim()) return;
    setFeeds([...feeds, { id: String(Date.now()), name: form.name, url: form.url, category: form.category || 'Uncategorized', status: 'active', lastSynced: '—', articlesImported: 0 }]);
    setShowAdd(false);
    setForm({ name: '', url: '', category: '', autoPublish: false, manualApprove: true, frequency: '360' });
  };

  const syncNow = (id: string) => {
    setFeeds(feeds.map((f) => f.id === id ? { ...f, lastSynced: new Date().toLocaleString(), articlesImported: f.articlesImported + 1 } : f));
  };

  const deleteFeed = (id: string) => {
    setFeeds(feeds.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Syndication</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">RSS Feeds</h1>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-4 py-2.5 text-sm font-medium text-white hover:bg-(--color-ink-dark)">
          <Plus className="h-4 w-4" /> Add RSS Feed
        </button>
      </div>

      {showAdd && (
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
          <h3 className="mb-4 font-display text-lg font-semibold">Add RSS Feed</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Feed name" className="field-input" />
            <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="RSS feed URL" className="field-input" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="field-input">
              <option value="">Select category</option>
              <option value="Technology">Technology</option>
              <option value="Sports">Sports</option>
              <option value="Business">Business</option>
              <option value="World">World</option>
            </select>
            <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="field-input">
              <option value="60">Every 1 hour</option>
              <option value="360">Every 6 hours</option>
              <option value="720">Every 12 hours</option>
              <option value="1440">Every 24 hours</option>
            </select>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.autoPublish} onChange={(e) => setForm({ ...form, autoPublish: e.target.checked })} className="rounded border-gray-300" /> Auto-publish imported articles</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.manualApprove} onChange={(e) => setForm({ ...form, manualApprove: e.target.checked })} className="rounded border-gray-300" /> Manual approval mode</label>
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={addFeed} className="rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm text-white hover:bg-(--color-ink-dark)">Add Feed</button>
            <button onClick={() => setShowAdd(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-(--border-default)">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-(--border-default) bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">Feed Name</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">URL</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Last Synced</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Articles</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {feeds.map((feed) => (
              <tr key={feed.id} className="border-b border-(--border-default) last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900">{feed.name}</td>
                <td className="max-w-[200px] truncate px-4 py-3 text-gray-500">{feed.url}</td>
                <td className="px-4 py-3 text-gray-600">{feed.category}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                    feed.status === 'active' ? 'bg-green-100 text-green-700' :
                    feed.status === 'error' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      feed.status === 'active' ? 'bg-green-500' :
                      feed.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`} />
                    {feed.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{feed.lastSynced}</td>
                <td className="px-4 py-3 text-gray-600">{feed.articlesImported}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => syncNow(feed.id)} className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600" title="Sync now"><RefreshCw className="h-4 w-4" /></button>
                    <button onClick={() => deleteFeed(feed.id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {feeds.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No RSS feeds configured. Add your first feed.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
