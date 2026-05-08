'use client';

import { useState } from 'react';
import { Search, Folder, Image, Video, FileText, Trash2, Download, HardDrive } from 'lucide-react';

export default function FileManagerPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [currentFolder, setCurrentFolder] = useState('All Media');

  const folders = ['All Media', 'Images', 'Videos', 'Documents', 'Downloads'];

  const stats = { total: 1247, size: '3.2 GB', images: 892, videos: 156, documents: 199 };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Media</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">File Manager</h1>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-4"><p className="flex items-center gap-2 text-sm text-gray-500"><HardDrive className="h-4 w-4" /> Total Files</p><p className="text-2xl font-bold text-gray-900">{stats.total}</p></div>
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-4"><p className="flex items-center gap-2 text-sm text-gray-500"><Image className="h-4 w-4" /> Images</p><p className="text-2xl font-bold text-blue-600">{stats.images}</p></div>
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-4"><p className="flex items-center gap-2 text-sm text-gray-500"><Video className="h-4 w-4" /> Videos</p><p className="text-2xl font-bold text-purple-600">{stats.videos}</p></div>
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-4"><p className="flex items-center gap-2 text-sm text-gray-500"><HardDrive className="h-4 w-4" /> Storage Used</p><p className="text-2xl font-bold text-gray-900">{stats.size}</p></div>
      </div>

      <div className="flex gap-4">
        <div className="w-48 space-y-1">
          {folders.map((f) => (
            <button key={f} onClick={() => setCurrentFolder(f)}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${currentFolder === f ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-600 hover:bg-gray-50'}`}>
              <Folder className="h-4 w-4 text-gray-400" /> {f}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files..." className="field-input pl-9" /></div>
            <div className="flex rounded-lg border border-(--border-default)">
              <button onClick={() => setView('grid')} className={`px-3 py-2 text-sm ${view === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>Grid</button>
              <button onClick={() => setView('list')} className={`px-3 py-2 text-sm ${view === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}>List</button>
            </div>
          </div>

          {view === 'grid' ? (
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="group relative rounded-lg border border-(--border-default) bg-(--bg-surface) p-3 transition-shadow hover:shadow-sm">
                  <div className="flex h-28 items-center justify-center rounded-md bg-gray-50">
                    {i % 3 === 0 ? <Image className="h-10 w-10 text-blue-300" /> : i % 3 === 1 ? <Video className="h-10 w-10 text-purple-300" /> : <FileText className="h-10 w-10 text-gray-300" />}
                  </div>
                  <p className="mt-2 truncate text-xs text-gray-700">file_{i + 1}.{i % 3 === 0 ? 'jpg' : i % 3 === 1 ? 'mp4' : 'pdf'}</p>
                  <p className="text-xs text-gray-400">{(Math.random() * 500 + 10).toFixed(0)} KB</p>
                  <div className="absolute right-2 top-2 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button className="rounded bg-white p-1 text-gray-400 shadow hover:text-blue-500"><Download className="h-3 w-3" /></button>
                    <button className="rounded bg-white p-1 text-gray-400 shadow hover:text-red-500"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-(--border-default)">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-(--border-default) bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Size</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
                </tr></thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-(--border-default) last:border-0">
                      <td className="flex items-center gap-2 px-4 py-3 text-gray-900">{i % 3 === 0 ? <Image className="h-4 w-4 text-blue-500" /> : i % 3 === 1 ? <Video className="h-4 w-4 text-purple-500" /> : <FileText className="h-4 w-4 text-gray-400" />} file_{i + 1}</td>
                      <td className="px-4 py-3 text-gray-500">{i % 3 === 0 ? 'JPEG' : i % 3 === 1 ? 'MP4' : 'PDF'}</td>
                      <td className="px-4 py-3 text-gray-500">{(Math.random() * 500 + 10).toFixed(0)} KB</td>
                      <td className="px-4 py-3 text-gray-500">2026-05-0{i + 1}</td>
                      <td className="px-4 py-3"><div className="flex gap-1">
                        <button className="rounded p-1 text-gray-400 hover:text-blue-500"><Download className="h-3.5 w-3.5" /></button>
                        <button className="rounded p-1 text-gray-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
