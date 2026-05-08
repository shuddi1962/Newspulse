import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { Type, Trash2, Upload, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Font Settings — NewsPulse PRO',
};

const installedFonts = [
  { name: 'Fraunces', type: 'Serif', weight: '300–900', active: true },
  { name: 'Instrument Sans', type: 'Sans-serif', weight: '400–700', active: true },
  { name: 'JetBrains Mono', type: 'Monospace', weight: '400–700', active: false },
  { name: 'Playfair Display', type: 'Serif', weight: '400–900', active: false },
];

export default async function FontSettingsPage() {
  await requireAdmin();
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-(--fg-default)">Fonts</h1>
        <p className="mt-1 text-sm text-(--fg-muted)">Manage typography and font settings.</p>
      </div>
      <div className="space-y-8">
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Installed Fonts</h2>
          <div className="space-y-3">
            {installedFonts.map((f) => (
              <div key={f.name} className="flex items-center justify-between rounded-lg border border-(--border-subtle) p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--bg-muted)">
                    <Type className="h-5 w-5 text-(--fg-muted)" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-(--fg-default)">{f.name}</p>
                    <p className="text-xs text-(--fg-muted)">{f.type} &middot; {f.weight}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {f.active && <span className="rounded-md bg-(--color-forest-green) px-2 py-0.5 text-xs font-medium text-white">Active</span>}
                  <button className="rounded-lg border border-(--border-subtle) p-2 text-(--fg-muted) transition-colors hover:border-(--color-signal-red) hover:text-(--color-signal-red)">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 flex items-center gap-2 rounded-lg border border-(--border-subtle) bg-(--bg-base) px-4 py-2 text-sm font-medium text-(--fg-default) transition-colors hover:bg-(--bg-muted)">
            <Upload className="h-4 w-4" /> Upload Font
          </button>
        </div>

        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Google Fonts</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--fg-muted)" />
            <input type="text" placeholder="Search Google Fonts..." className="field-input w-full pl-9" />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {['Inter', 'Roboto', 'Open Sans', 'Lora', 'Merriweather', 'Source Sans 3'].map((name) => (
              <div key={name} className="flex items-center justify-between rounded-lg border border-(--border-subtle) p-3">
                <p className="text-sm font-medium text-(--fg-default)">{name}</p>
                <button className="rounded-md bg-(--color-ocean-blue) px-3 py-1 text-xs font-medium text-white">Import</button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Font Setup</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Header Font</label>
              <select className="field-input">
                <option>Fraunces</option>
                <option>Playfair Display</option>
                <option>Merriweather</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Body Font</label>
              <select className="field-input">
                <option>Instrument Sans</option>
                <option>Inter</option>
                <option>Source Sans 3</option>
              </select>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <SliderField label="Heading 1 (px)" defaultValue={48} />
            <SliderField label="Heading 2 (px)" defaultValue={36} />
            <SliderField label="Heading 3 (px)" defaultValue={24} />
            <SliderField label="Body (px)" defaultValue={16} />
            <SliderField label="Small (px)" defaultValue={14} />
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Line height</label>
              <select className="field-input">
                <option>Tight (1.15)</option>
                <option selected>Normal (1.5)</option>
                <option>Relaxed (1.75)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Letter spacing</label>
              <select className="field-input">
                <option>Tight (-0.02em)</option>
                <option selected>Normal (0)</option>
                <option>Wide (0.05em)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Live Preview</h2>
          <div className="rounded-lg bg-(--bg-muted) p-6">
            <p className="text-xl" style={{ fontFamily: 'Fraunces, serif' }}>The quick brown fox jumps over the lazy dog</p>
            <p className="mt-2 text-sm" style={{ fontFamily: 'Instrument Sans, sans-serif' }}>The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.</p>
            <p className="mt-1 text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>The quick brown fox jumps over the lazy dog — 0123456789</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button className="rounded-lg border border-(--border-subtle) bg-(--bg-base) px-5 py-2.5 text-sm font-medium text-(--fg-default) transition-colors hover:bg-(--bg-muted)">Reset to defaults</button>
          <button className="rounded-lg bg-(--color-ink-black) px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark)">Save changes</button>
        </div>
      </div>
    </div>
  );
}

function SliderField({ label, defaultValue }: { label: string; defaultValue: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-(--fg-default)">{label}</label>
        <span className="text-xs text-(--fg-muted)">{defaultValue}px</span>
      </div>
      <input type="range" min="10" max="72" defaultValue={defaultValue} className="w-full accent-(--color-ink-black)" />
    </div>
  );
}
