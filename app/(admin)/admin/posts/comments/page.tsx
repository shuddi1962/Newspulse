'use client';

import { useState } from 'react';
import { Check, X, Search, Trash2 } from 'lucide-react';

export default function CommentsPage() {
  const [comments, setComments] = useState([
    { id: '1', author: 'JohnDoe', content: 'Great article! Very informative.', article: 'The Future of AI', status: 'approved', date: '2026-05-06' },
    { id: '2', author: 'SpamBot99', content: 'Click here for free money!!!', article: 'Business Trends', status: 'spam', date: '2026-05-05' },
    { id: '3', author: 'CuriousReader', content: 'I have a question about this topic.', article: 'Tech Innovations', status: 'pending', date: '2026-05-04' },
  ]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = comments
    .filter((c) => filter === 'all' || c.status === filter)
    .filter((c) => c.author.toLowerCase().includes(search.toLowerCase()) || c.content.toLowerCase().includes(search.toLowerCase()));

  const updateStatus = (id: string, status: string) => setComments(comments.map((c) => c.id === id ? { ...c, status } : c));
  const deleteComment = (id: string) => setComments(comments.filter((c) => c.id !== id));

  const counts = { all: comments.length, pending: comments.filter((c) => c.status === 'pending').length, approved: comments.filter((c) => c.status === 'approved').length, spam: comments.filter((c) => c.status === 'spam').length };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Engagement</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">Post Comments</h1>
      </div>

      <div className="flex gap-4">
        {Object.entries(counts).map(([key, count]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${filter === key ? 'bg-(--color-ink-black) text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {key.charAt(0).toUpperCase() + key.slice(1)} ({count})
          </button>
        ))}
      </div>

      <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search comments..." className="field-input pl-9" />
      </div>

      <div className="space-y-3">
        {filtered.map((comment) => (
          <div key={comment.id} className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-4">
            <div className="flex items-start justify-between">
              <div><p className="text-sm font-medium text-gray-900">{comment.author}</p>
                <p className="text-xs text-gray-400">on &quot;{comment.article}&quot; · {comment.date}</p>
              </div>
              <div className="flex items-center gap-1">
                {comment.status !== 'approved' && <button onClick={() => updateStatus(comment.id, 'approved')} className="rounded p-1.5 text-gray-400 hover:bg-green-50 hover:text-green-600"><Check className="h-4 w-4" /></button>}
                {comment.status !== 'spam' && <button onClick={() => updateStatus(comment.id, 'spam')} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"><X className="h-4 w-4" /></button>}
                <button onClick={() => deleteComment(comment.id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">{comment.content}</p>
            <span className={`mt-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              comment.status === 'approved' ? 'bg-green-100 text-green-700' :
              comment.status === 'spam' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{comment.status}</span>
          </div>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-sm text-gray-400">No comments found.</p>}
      </div>
    </div>
  );
}
