'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export default function OtherPagesSetup() {
  const [about, setAbout] = useState('Welcome to NewsPulse PRO, your trusted source for news and information.');
  const [privacy, setPrivacy] = useState('We value your privacy. This policy outlines how we collect and use your data.');
  const [terms, setTerms] = useState('By using NewsPulse PRO, you agree to these terms and conditions.');
  const [faqs, setFaqs] = useState([{ q: 'How do I subscribe?', a: 'Click the Subscribe button in the header.' }]);
  const [newFaq, setNewFaq] = useState({ q: '', a: '' });

  const addFaq = () => {
    if (!newFaq.q.trim() || !newFaq.a.trim()) return;
    setFaqs([...faqs, newFaq]);
    setNewFaq({ q: '', a: '' });
  };

  const deleteFaq = (i: number) => setFaqs(faqs.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6">
      <div><p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Web Setup</p><h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">Other Pages Setup</h1></div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
          <h3 className="mb-4 font-display text-lg font-semibold">About Page</h3>
          <textarea value={about} onChange={(e) => setAbout(e.target.value)} className="field-input" rows={6} />
          <button className="mt-3 rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm text-white hover:bg-(--color-ink-dark)">Save</button>
        </div>
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
          <h3 className="mb-4 font-display text-lg font-semibold">Privacy Policy</h3>
          <textarea value={privacy} onChange={(e) => setPrivacy(e.target.value)} className="field-input" rows={6} />
          <button className="mt-3 rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm text-white hover:bg-(--color-ink-dark)">Save</button>
        </div>
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
          <h3 className="mb-4 font-display text-lg font-semibold">Terms of Service</h3>
          <textarea value={terms} onChange={(e) => setTerms(e.target.value)} className="field-input" rows={6} />
          <button className="mt-3 rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm text-white hover:bg-(--color-ink-dark)">Save</button>
        </div>
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
          <h3 className="mb-4 font-display text-lg font-semibold">FAQ Management</h3>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-3">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-gray-900">{faq.q}</p>
                  <button onClick={() => deleteFaq(i)} className="rounded p-0.5 text-gray-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
                <p className="mt-1 text-xs text-gray-500">{faq.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-(--border-subtle) pt-4">
            <input value={newFaq.q} onChange={(e) => setNewFaq({ ...newFaq, q: e.target.value })} placeholder="Question" className="field-input" />
            <textarea value={newFaq.a} onChange={(e) => setNewFaq({ ...newFaq, a: e.target.value })} placeholder="Answer" className="field-input" rows={2} />
            <button onClick={addFaq} className="flex items-center gap-1 rounded-lg bg-(--color-ink-black) px-3 py-1.5 text-sm text-white hover:bg-(--color-ink-dark)"><Plus className="h-3.5 w-3.5" /> Add FAQ</button>
          </div>
        </div>
      </div>
    </div>
  );
}
