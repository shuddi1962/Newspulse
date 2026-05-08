'use client';

import { useState } from 'react';
import { Archive, RotateCcw, Filter } from 'lucide-react';

export default function ArchivePage() {
  const [archives, setArchives] = useState<{ id: string; title: string; category: string; archivedDate: string; }[]>([
    { id: '1', title: 'Q1 2026 Marketing Report', category: 'Business', archivedDate: '2026-04-01' },
    { id: '2', title: 'Winter Sports Roundup', category: 'Sports', archivedDate: '2026-03-15' },
  ]);
  const [filterCat, setFilterCat] = useState('all');
  const [autoDays, setAutoDays] = useState('90');
  const [autoCats, setAutoCats] = useState<string[]>(['Business']);

  const restore = (id: string) => {
    setArchives(archives.filter((a) => a.id !== id));
  };

  const toggleAutoCat = (cat: string) => {
    setAutoCats((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);
  };

  const filtered = filterCat === 'all' ? archives : archives.filter((a) => a.category === filterCat);

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Content</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">Archive</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="field-input pl-9">
                <option value="all">All Categories</option>
                <option value="Business">Business</option>
                <option value="Sports">Sports</option>
                <option value="Technology">Technology</option>
                <option value="Politics">Politics</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-(--border-default)">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--border-default) bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Category</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Archived Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-(--border-default) last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.title}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">{item.category}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{item.archivedDate}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => restore(item.id)} className="flex items-center gap-1 rounded-md px-3 py-1.5 text-sm text-blue-600 transition-colors hover:bg-blue-50">
                        <RotateCcw className="h-3.5 w-3.5" /> Restore
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-400">No archived posts found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold"><Archive className="h-5 w-5" /> Auto-Archive Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Archive posts after (days)</label>
              <input type="number" value={autoDays} onChange={(e) => setAutoDays(e.target.value)} className="field-input mt-1" min={1} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Categories to auto-archive</label>
              <div className="mt-2 space-y-2">
                {['Business', 'Sports', 'Technology', 'Politics', 'World', 'Lifestyle'].map((cat) => (
                  <label key={cat} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={autoCats.includes(cat)} onChange={() => toggleAutoCat(cat)} className="rounded border-gray-300" />
                    {cat}
                  </label>
                ))}
              </div>
            </div>
            <button className="w-full rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm text-white hover:bg-(--color-ink-dark)">Save Settings</button>
          </div>
        </div>
      </div>
    </div>
  );
}
