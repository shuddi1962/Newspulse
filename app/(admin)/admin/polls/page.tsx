'use client';

import { useState } from 'react';
import { Plus, Trash2, BarChart3 } from 'lucide-react';

export default function PollsPage() {
  const [polls, setPolls] = useState([
    { id: '1', question: 'What topic interests you most?', status: 'active', votes: 234, options: ['Technology', 'Sports', 'Politics', 'Business'] },
    { id: '2', question: 'How often do you read news online?', status: 'closed', votes: 89, options: ['Daily', 'Weekly', 'Monthly'] },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ question: '', options: ['', ''], status: 'active' });

  const addOption = () => setForm({ ...form, options: [...form.options, ''] });
  const removeOption = (i: number) => setForm({ ...form, options: form.options.filter((_, idx) => idx !== i) });
  const updateOption = (i: number, val: string) => {
    const opts = [...form.options];
    opts[i] = val;
    setForm({ ...form, options: opts });
  };

  const addPoll = () => {
    if (!form.question.trim() || form.options.some((o) => !o.trim())) return;
    setPolls([{ id: String(Date.now()), question: form.question, status: form.status, votes: 0, options: form.options.filter((o) => o.trim()) }, ...polls]);
    setShowAdd(false);
    setForm({ question: '', options: ['', ''], status: 'active' });
  };

  const deletePoll = (id: string) => setPolls(polls.filter((p) => p.id !== id));

  const totalVotes = polls.reduce((s, p) => s + p.votes, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Engagement</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">Polls</h1>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-4 py-2.5 text-sm font-medium text-white hover:bg-(--color-ink-dark)">
          <Plus className="h-4 w-4" /> Create Poll
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-4"><p className="text-sm text-gray-500">Total Polls</p><p className="text-2xl font-bold text-gray-900">{polls.length}</p></div>
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-4"><p className="text-sm text-gray-500">Active Polls</p><p className="text-2xl font-bold text-green-600">{polls.filter((p) => p.status === 'active').length}</p></div>
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-4"><p className="text-sm text-gray-500">Total Votes</p><p className="text-2xl font-bold text-blue-600">{totalVotes}</p></div>
      </div>

      {showAdd && (
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
          <h3 className="mb-4 font-display text-lg font-semibold">Create Poll</h3>
          <div className="space-y-4">
            <input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} placeholder="Poll question" className="field-input" />
            <div className="space-y-2">
              {form.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input value={opt} onChange={(e) => updateOption(i, e.target.value)} placeholder={`Option ${i + 1}`} className="field-input flex-1" />
                  {form.options.length > 2 && <button onClick={() => removeOption(i)} className="rounded p-1 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>}
                </div>
              ))}
              <button onClick={addOption} className="text-sm text-blue-600 hover:underline">+ Add option</button>
            </div>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="field-input w-40">
              <option value="active">Active</option>
              <option value="closed">Closed</option>
            </select>
            <div className="flex gap-2">
              <button onClick={addPoll} className="rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm text-white hover:bg-(--color-ink-dark)">Create</button>
              <button onClick={() => setShowAdd(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {polls.map((poll) => {
          const total = poll.votes;
          return (
            <div key={poll.id} className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{poll.question}</h3>
                  <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${poll.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{poll.status}</span>
                    <span><BarChart3 className="mr-1 inline h-3.5 w-3.5" />{total} votes</span>
                  </div>
                </div>
                <button onClick={() => deletePoll(poll.id)} className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
              {total > 0 && (
                <div className="mt-4 space-y-2">
                  {poll.options.map((opt) => {
                    const pct = total > 0 ? Math.round((1 / poll.options.length) * 100) : 0;
                    return (
                      <div key={opt}>
                        <div className="flex items-center justify-between text-sm"><span className="text-gray-700">{opt}</span><span className="text-gray-500">{pct}%</span></div>
                        <div className="mt-1 h-2 rounded-full bg-gray-100"><div className="h-full rounded-full bg-blue-500" style={{ width: `${pct}%` }} /></div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
