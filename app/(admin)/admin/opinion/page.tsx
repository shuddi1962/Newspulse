'use client';

import { useState } from 'react';
import { Plus, Star, Pencil, Trash2 } from 'lucide-react';

export default function OpinionPage() {
  type ArticleStatus = 'published' | 'draft' | 'pending';
  const [articles, setArticles] = useState<{ id: string; title: string; author: string; status: ArticleStatus; date: string; featured: boolean }[]>([
    { id: '1', title: 'The Future of Digital Journalism', author: 'Jane Doe', status: 'published', date: '2026-05-01', featured: true },
    { id: '2', title: 'Why Local News Matters More Than Ever', author: 'John Smith', status: 'draft', date: '2026-04-28', featured: false },
    { id: '3', title: 'A New Era for Press Freedom', author: 'Guest Writer', status: 'pending', date: '2026-04-25', featured: false },
  ]);
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', content: '', featured: false });

  const filtered = filter === 'all' ? articles : articles.filter((a) => a.status === filter);

  const addArticle = () => {
    if (!form.title.trim()) return;
    const authorName = form.author || 'Staff';
    const today = new Date().toISOString().slice(0, 10);
    setArticles([{ id: String(Date.now()), title: form.title, author: authorName, status: 'draft', date: today, featured: form.featured }, ...articles]);
    setShowAdd(false);
    setForm({ title: '', author: '', content: '', featured: false });
  };

  const toggleFeatured = (id: string) => {
    setArticles(articles.map((a) => a.id === id ? { ...a, featured: !a.featured } : a));
  };

  const deleteArticle = (id: string) => {
    setArticles(articles.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Editorial</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">Opinion</h1>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-4 py-2.5 text-sm font-medium text-white hover:bg-(--color-ink-dark)">
          <Plus className="h-4 w-4" /> New Opinion Piece
        </button>
      </div>

      {showAdd && (
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
          <h3 className="mb-4 font-display text-lg font-semibold">Create Opinion Piece</h3>
          <div className="space-y-4">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="field-input" />
            <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="Author name" className="field-input" />
            <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Article content..." className="field-input" rows={6} />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded border-gray-300" /> Feature this opinion</label>
            <div className="flex gap-2">
              <button onClick={addArticle} className="rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm text-white hover:bg-(--color-ink-dark)">Save</button>
              <button onClick={() => setShowAdd(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {['all', 'published', 'draft', 'pending'].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${filter === s ? 'bg-(--color-ink-black) text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-(--border-default)">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-(--border-default) bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-500">Title</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Author</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Featured</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-b border-(--border-default) last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900">{a.title}</td>
                <td className="px-4 py-3 text-gray-600">{a.author}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    a.status === 'published' ? 'bg-green-100 text-green-700' :
                    a.status === 'draft' ? 'bg-gray-100 text-gray-600' : 'bg-yellow-100 text-yellow-700'}`}>{a.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{a.date}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleFeatured(a.id)} className={`${a.featured ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500`}>
                    <Star className="h-4 w-4" />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button className="rounded p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => deleteArticle(a.id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
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
