'use client';

import { useState } from 'react';
import { Settings, BookOpen, MessageSquare, Image, Link } from 'lucide-react';

export default function OptionsPage() {
  const [general, setGeneral] = useState({ title: 'NewsPulse PRO', tagline: 'Your Trusted News Source', description: '' });
  const [reading, setReading] = useState({ postsPerPage: '12', searchIndexing: true });
  const [discussion, setDiscussion] = useState({ moderateComments: true, allowComments: true });
  const [media, setMedia] = useState({ large: '1024', medium: '768', thumbnail: '320', compression: '80' });
  const [permalink, setPermalink] = useState('%category%/%slug%');

  const sections = [
    { id: 'general', icon: Settings, title: 'General Options', desc: 'Site title, tagline, and description', state: general, set: setGeneral as (s: Record<string, string | boolean>) => void, fields: [
      { key: 'title', label: 'Site Title', type: 'text' }, { key: 'tagline', label: 'Tagline', type: 'text' }, { key: 'description', label: 'Description', type: 'textarea' },
    ]},
    { id: 'reading', icon: BookOpen, title: 'Reading Options', desc: 'Posts per page, search settings', state: reading, set: setReading as (s: Record<string, string | boolean>) => void, fields: [
      { key: 'postsPerPage', label: 'Posts per page', type: 'text' },
    ]},
    { id: 'discussion', icon: MessageSquare, title: 'Discussion Options', desc: 'Comment and moderation settings', state: discussion, set: setDiscussion as (s: Record<string, string | boolean>) => void, fields: [
      { key: 'moderateComments', label: 'Comment moderation', type: 'checkbox' }, { key: 'allowComments', label: 'Allow comments', type: 'checkbox' },
    ]},
    { id: 'media', icon: Image, title: 'Media Options', desc: 'Image sizes and compression', state: media, set: setMedia as (s: Record<string, string | boolean>) => void, fields: [
      { key: 'large', label: 'Large size (px)', type: 'text' }, { key: 'medium', label: 'Medium size (px)', type: 'text' }, { key: 'thumbnail', label: 'Thumbnail size (px)', type: 'text' },
    ]},
    { id: 'permalink', icon: Link, title: 'Permalink Options', desc: 'URL structure for articles', state: { structure: permalink }, set: (s: Record<string, string | boolean>) => setPermalink(s.structure as string), fields: [
      { key: 'structure', label: 'URL structure', type: 'select', options: ['%category%/%slug%', '%slug%', '%year%/%month%/%slug%'] },
    ]},
  ];

  const updateField = (sectionId: string, key: string, val: string | boolean) => {
    const section = sections.find((s) => s.id === sectionId);
    if (section) section.set({ ...section.state, [key]: val });
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Configuration</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">Options</h1>
      </div>

      {sections.map((section) => (
        <div key={section.id} className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
          <div className="flex items-start gap-3">
            <section.icon className="mt-1 h-5 w-5 text-gray-400" />
            <div className="flex-1">
              <h3 className="font-display text-lg font-semibold text-gray-900">{section.title}</h3>
              <p className="text-sm text-gray-500">{section.desc}</p>
              <div className="mt-4 space-y-3">
                {section.fields.map((field: { key: string; label: string; type: string; options?: string[] }) => {
                  const val = (section.state as Record<string, string | boolean>)[field.key];
                  return (
                    <div key={field.key}>
                      <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                      {field.type === 'checkbox' ? (
                        <label className="mt-1 flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={!!val} onChange={(e) => updateField(section.id, field.key, e.target.checked)} className="rounded border-gray-300" />
                          Enable
                        </label>
                      ) : field.type === 'select' ? (
                        <select value={String(val)} onChange={(e) => updateField(section.id, field.key, e.target.value)} className="field-input mt-1">
                          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea value={String(val)} onChange={(e) => updateField(section.id, field.key, e.target.value)} className="field-input mt-1" rows={3} />
                      ) : (
                        <input type="text" value={String(val)} onChange={(e) => updateField(section.id, field.key, e.target.value)} className="field-input mt-1" />
                      )}
                    </div>
                  );
                })}
              </div>
              <button className="mt-4 rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm text-white hover:bg-(--color-ink-dark)">Save Changes</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
