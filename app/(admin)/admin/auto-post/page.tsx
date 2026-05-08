'use client';

import { useState } from 'react';
import { Globe, Share2, MessageCircle, Users, Video, Play, CheckCircle, XCircle } from 'lucide-react';

const platforms = [
  { id: 'facebook', name: 'Facebook', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'twitter', name: 'Twitter / X', icon: MessageCircle, color: 'text-sky-500', bg: 'bg-sky-50' },
  { id: 'instagram', name: 'Instagram', icon: Share2, color: 'text-pink-600', bg: 'bg-pink-50' },
  { id: 'linkedin', name: 'LinkedIn', icon: Users, color: 'text-blue-700', bg: 'bg-blue-50' },
  { id: 'tiktok', name: 'TikTok', icon: Play, color: 'text-gray-900', bg: 'bg-gray-100' },
  { id: 'youtube', name: 'YouTube', icon: Video, color: 'text-red-600', bg: 'bg-red-50' },
];

export default function AutoPostPage() {
  const [connections] = useState<Record<string, boolean>>({ facebook: true, twitter: true });
  const [enableAuto, setEnableAuto] = useState<Record<string, boolean>>({ facebook: true, twitter: false });
  const [logs] = useState([
    { platform: 'facebook', content: 'Check out our latest article on AI...', status: 'posted', time: '2026-05-07 10:30' },
    { platform: 'twitter', content: 'New: The future of journalism in 2026', status: 'scheduled', time: '2026-05-08 08:00' },
  ]);

  const platformIcon = (id: string) => {
    const p = platforms.find((pl) => pl.id === id);
    return p ? <p.icon className="h-4 w-4" /> : null;
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Automation</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">Auto Post — Social Media</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((p) => {
          const connected = connections[p.id];
          return (
            <div key={p.id} className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${p.bg}`}>
                  <p.icon className={`h-5 w-5 ${p.color}`} />
                </div>
                {connected ? <CheckCircle className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-gray-300" />}
              </div>
              <p className="mt-3 font-medium text-gray-900">{p.name}</p>
              <p className="mt-0.5 text-xs text-gray-500">{connected ? 'Connected' : 'Not connected'}</p>
              <button className={`mt-3 w-full rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${connected ? 'border border-red-200 text-red-600 hover:bg-red-50' : 'bg-(--color-ink-black) text-white hover:bg-(--color-ink-dark)'}`}>
                {connected ? 'Disconnect' : 'Connect'}
              </button>
              {connected && (
                <label className="mt-3 flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={enableAuto[p.id] ?? false} onChange={() => setEnableAuto({ ...enableAuto, [p.id]: !enableAuto[p.id] })} className="rounded border-gray-300" />
                  Auto-publish
                </label>
              )}
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
          <h3 className="mb-4 font-display text-lg font-semibold">Schedule Settings</h3>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700">Posting frequency</label>
              <select className="field-input mt-1"><option>Daily</option><option>Weekly</option><option>Hourly</option></select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700">Posting time</label>
              <input type="time" defaultValue="09:00" className="field-input mt-1" />
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded border-gray-300" /> Auto-generate hashtags</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded border-gray-300" defaultChecked /> AI caption generation</label>
            <button className="rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm text-white hover:bg-(--color-ink-dark)">Save Schedule</button>
          </div>
        </div>

        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
          <h3 className="mb-4 font-display text-lg font-semibold">Recent Activity</h3>
          {logs.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No recent auto-posts.</p>
          ) : (
            <div className="space-y-3">
              {logs.map((log, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-(--border-subtle) p-3">
                  <div className="mt-0.5">{platformIcon(log.platform)}</div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{log.content}</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                      <span>{log.platform}</span>
                      <span>·</span>
                      <span className={log.status === 'posted' ? 'text-green-600' : 'text-blue-600'}>{log.status}</span>
                      <span>·</span>
                      <span>{log.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
