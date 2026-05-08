'use client';

import { useState } from 'react';

export default function BreakingSetupPage() {
  const [settings, setSettings] = useState({
    bgColor: '#DC2626', textColor: '#FFFFFF', speed: 'normal', position: 'top',
    maxItems: '6', autoExpire: '24',
  });

  return (
    <div className="space-y-6">
      <div><p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Web Setup</p><h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">Breaking Post Setup</h1></div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
          <h3 className="mb-4 font-display text-lg font-semibold">Breaking News Configuration</h3>
          <div className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700">Background Color</label>
              <div className="mt-1 flex gap-2"><input type="color" value={settings.bgColor} onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })} className="h-9 w-12 rounded border border-gray-200" /><input value={settings.bgColor} onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })} className="field-input flex-1" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700">Text Color</label>
              <div className="mt-1 flex gap-2"><input type="color" value={settings.textColor} onChange={(e) => setSettings({ ...settings, textColor: e.target.value })} className="h-9 w-12 rounded border border-gray-200" /><input value={settings.textColor} onChange={(e) => setSettings({ ...settings, textColor: e.target.value })} className="field-input flex-1" /></div>
            </div>
            <div><label className="block text-sm font-medium text-gray-700">Scroll Speed</label>
              <select value={settings.speed} onChange={(e) => setSettings({ ...settings, speed: e.target.value })} className="field-input"><option value="slow">Slow</option><option value="normal">Normal</option><option value="fast">Fast</option></select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700">Position</label>
              <select value={settings.position} onChange={(e) => setSettings({ ...settings, position: e.target.value })} className="field-input"><option value="top">Below Header</option><option value="above">Above Header</option></select>
            </div>
            <div><label className="block text-sm font-medium text-gray-700">Max Breaking Items</label>
              <input type="number" value={settings.maxItems} onChange={(e) => setSettings({ ...settings, maxItems: e.target.value })} className="field-input" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Auto-Expire After (hours)</label>
              <input type="number" value={settings.autoExpire} onChange={(e) => setSettings({ ...settings, autoExpire: e.target.value })} className="field-input" /></div>
            <button className="rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm text-white hover:bg-(--color-ink-dark)">Save Settings</button>
          </div>
        </div>

        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
          <h3 className="mb-4 font-display text-lg font-semibold">Preview</h3>
          <div className="flex items-center gap-3 rounded-md px-4 py-3 text-sm" style={{ backgroundColor: settings.bgColor, color: settings.textColor }}>
            <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] font-bold">Breaking</span>
            <span className="truncate">Live preview of breaking news ticker with current styles</span>
          </div>
        </div>
      </div>
    </div>
  );
}
