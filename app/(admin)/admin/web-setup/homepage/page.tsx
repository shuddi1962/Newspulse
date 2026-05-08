'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';

const defaultSections = [
  { id: 'hero', label: 'Hero Slider', enabled: true },
  { id: 'featured', label: 'Featured Grid', enabled: true },
  { id: 'categories', label: 'Category Sections', enabled: true },
  { id: 'latest', label: 'Latest Stories Rail', enabled: true },
  { id: 'trending', label: 'Trending Section', enabled: true },
  { id: 'video', label: 'Video Section', enabled: false },
  { id: 'opinion', label: 'Opinion Section', enabled: false },
];

export default function HomepageSetupPage() {
  const [sections, setSections] = useState(defaultSections);
  const [maxPosts, setMaxPosts] = useState('6');

  const moveUp = (i: number) => {
    if (i === 0) return;
    const next = [...sections];
    const prev = next[i - 1];
    const curr = next[i];
    if (prev && curr) { next[i - 1] = curr; next[i] = prev; }
    setSections(next);
  };

  const moveDown = (i: number) => {
    if (i === sections.length - 1) return;
    const next = [...sections];
    const curr = next[i];
    const nextItem = next[i + 1];
    if (curr && nextItem) { next[i] = nextItem; next[i + 1] = curr; }
    setSections(next);
  };

  const toggle = (id: string) => {
    setSections(sections.map((s) => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  return (
    <div className="space-y-6">
      <div><p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Web Setup</p><h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">Homepage Setup</h1></div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
          <h3 className="mb-4 font-display text-lg font-semibold">Homepage Section Builder</h3>
          <div className="space-y-2">
            {sections.map((section, i) => (
              <div key={section.id} className="flex items-center gap-3 rounded-lg border border-(--border-subtle) bg-(--bg-base) px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveUp(i)} className="text-gray-400 hover:text-gray-600"><ChevronUp className="h-3 w-3" /></button>
                  <button onClick={() => moveDown(i)} className="text-gray-400 hover:text-gray-600"><ChevronDown className="h-3 w-3" /></button>
                </div>
                <span className="flex-1 text-sm font-medium text-gray-900">{section.label}</span>
                <button onClick={() => toggle(section.id)} className={`rounded-md p-1.5 ${section.enabled ? 'text-green-600 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100'}`}>
                  {section.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
            <h3 className="mb-4 font-display text-lg font-semibold">Section Settings</h3>
            <div><label className="block text-sm font-medium text-gray-700">Max posts per section</label>
              <input type="number" value={maxPosts} onChange={(e) => setMaxPosts(e.target.value)} className="field-input mt-1" /></div>
            <button className="mt-4 rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm text-white hover:bg-(--color-ink-dark)">Save Settings</button>
          </div>

          <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
            <h3 className="mb-4 font-display text-lg font-semibold">Featured Categories</h3>
            <div className="space-y-2">
              {['Technology', 'Sports', 'Business', 'Politics', 'World'].map((cat) => (
                <label key={cat} className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="rounded border-gray-300" /> {cat}</label>
              ))}
            </div>
            <button className="mt-4 rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm text-white hover:bg-(--color-ink-dark)">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
