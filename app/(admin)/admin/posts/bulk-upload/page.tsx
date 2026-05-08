'use client';

import { useState } from 'react';
import { Upload, FileSpreadsheet, Sparkles, Rss } from 'lucide-react';

export default function BulkUploadPage() {
  const [activeTab, setActiveTab] = useState<'csv' | 'ai' | 'rss'>('csv');

  const tabs = [
    { id: 'csv' as const, label: 'CSV / Excel Upload', icon: FileSpreadsheet },
    { id: 'ai' as const, label: 'AI Bulk Generation', icon: Sparkles },
    { id: 'rss' as const, label: 'RSS Bulk Import', icon: Rss },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Content</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">Bulk Post Upload</h1>
      </div>

      <div className="flex gap-2 border-b border-(--border-default)">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'border-(--color-ink-black) text-(--color-ink-black)' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'csv' && (
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-8 text-center">
          <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 font-display text-lg font-semibold text-gray-900">Upload CSV or Excel File</h3>
          <p className="mt-2 text-sm text-gray-500">Upload a CSV or Excel file with columns: title, content, category, tags, status</p>
          <div className="mt-6 flex justify-center">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-(--color-ink-black) px-6 py-3 text-sm font-medium text-white hover:bg-(--color-ink-dark)">
              <Upload className="h-4 w-4" /> Choose File
              <input type="file" accept=".csv,.xlsx,.xls" className="hidden" />
            </label>
          </div>
          <div className="mt-6 text-left">
            <h4 className="text-sm font-medium text-gray-700">Required columns:</h4>
            <ul className="mt-2 space-y-1 text-sm text-gray-500">
              <li><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">title</code> — Article title (required)</li>
              <li><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">content</code> — Article content (required)</li>
              <li><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">category</code> — Category name or ID</li>
              <li><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">tags</code> — Comma-separated tags</li>
              <li><code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">status</code> — draft / published</li>
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-8">
          <div className="max-w-lg">
            <h3 className="font-display text-lg font-semibold text-gray-900">AI Bulk Generation</h3>
            <p className="mt-2 text-sm text-gray-500">Generate multiple articles at once using AI. Provide topics and quantity.</p>
            <div className="mt-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700">Topics (one per line)</label>
                <textarea className="field-input mt-1" rows={4} placeholder="AI in healthcare&#10;Climate change solutions&#10;Space exploration 2026" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700">Number of articles</label><select className="field-input mt-1"><option>5</option><option>10</option><option>20</option><option>50</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700">Category</label><select className="field-input mt-1"><option>Technology</option><option>Sports</option><option>Business</option></select></div>
              </div>
              <button className="flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm text-white hover:bg-(--color-ink-dark)">
                <Sparkles className="h-4 w-4" /> Generate Articles
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rss' && (
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-8">
          <div className="max-w-lg">
            <h3 className="font-display text-lg font-semibold text-gray-900">RSS Bulk Import</h3>
            <p className="mt-2 text-sm text-gray-500">Import articles from an RSS feed URL. Duplicates are automatically filtered.</p>
            <div className="mt-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700">RSS Feed URL</label><input placeholder="https://example.com/rss" className="field-input mt-1" /></div>
              <div><label className="block text-sm font-medium text-gray-700">Target Category</label><select className="field-input mt-1"><option>Auto-detect</option><option>Technology</option><option>Sports</option><option>Business</option></select></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded border-gray-300" /> Auto-publish imported articles</label>
              <button className="flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm text-white hover:bg-(--color-ink-dark)">
                <Rss className="h-4 w-4" /> Import from RSS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
