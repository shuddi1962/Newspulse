import { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Theme Settings — Admin',
  description: 'Customize the appearance and branding of your publication.',
};

const DEFAULT_THEMES = [
  { id: 'editorial', name: 'Editorial', description: 'Classic newsroom aesthetic with serif headlines.', colors: { primary: '#0F1419', accent: '#2563EB', bg: '#FAFAF8' } },
  { id: 'modern', name: 'Modern', description: 'Clean, minimal layout with bold typography.', colors: { primary: '#111827', accent: '#7C3AED', bg: '#FFFFFF' } },
  { id: 'bold', name: 'Bold', description: 'High-contrast design for maximum impact.', colors: { primary: '#000000', accent: '#DC2626', bg: '#F9FAFB' } },
  { id: 'warm', name: 'Warm', description: 'Inviting tones for community-focused publications.', colors: { primary: '#1C1917', accent: '#D97706', bg: '#FFFBEB' } },
];

const COLOR_PRESETS = {
  category: [
    { name: 'Politics', key: 'cat-politics', default: '#7C3AED' },
    { name: 'Business', key: 'cat-business', default: '#2563EB' },
    { name: 'Technology', key: 'cat-tech', default: '#0891B2' },
    { name: 'Sports', key: 'cat-sports', default: '#059669' },
    { name: 'Lifestyle', key: 'cat-lifestyle', default: '#D97706' },
    { name: 'World', key: 'cat-world', default: '#DC2626' },
  ],
};

export default async function ThemeSettingsPage() {
  await requireAdmin();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-(--fg-default)">Theme</h1>
        <p className="mt-1 text-sm text-(--fg-muted)">
          Customize the appearance and branding of your publication.
        </p>
      </div>

      <div className="space-y-8">
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Active theme</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DEFAULT_THEMES.map((theme) => (
              <ThemeCard key={theme.id} theme={theme} active={theme.id === 'editorial'} />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Branding</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Site name</label>
              <input
                type="text"
                defaultValue="NewsPulse PRO"
                className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Tagline</label>
              <input
                type="text"
                defaultValue="Editorial authority for the modern web"
                className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Primary color</label>
              <div className="flex items-center gap-2">
                <input type="color" defaultValue="#0F1419" className="h-8 w-8 rounded border border-(--border-subtle)" />
                <input
                  type="text"
                  defaultValue="#0F1419"
                  className="flex-1 rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Accent color</label>
              <div className="flex items-center gap-2">
                <input type="color" defaultValue="#2563EB" className="h-8 w-8 rounded border border-(--border-subtle)" />
                <input
                  type="text"
                  defaultValue="#2563EB"
                  className="flex-1 rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Category colors</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COLOR_PRESETS.category.map((cat) => (
              <div key={cat.key} className="flex items-center gap-3">
                <input type="color" defaultValue={cat.default} className="h-8 w-8 rounded border border-(--border-subtle)" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-(--fg-default)">{cat.name}</p>
                  <p className="text-xs font-mono text-(--fg-muted)">{cat.default}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Typography</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Headline font</label>
              <select className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                <option>Fraunces (Current)</option>
                <option>Playfair Display</option>
                <option>Merriweather</option>
                <option>Georgia (System)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Body font</label>
              <select className="w-full rounded-md border border-(--border-subtle) bg-(--bg-base) px-3 py-2 text-sm text-(--fg-default)">
                <option>Instrument Sans (Current)</option>
                <option>Inter</option>
                <option>Source Sans 3</option>
                <option>System Sans</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button className="rounded-lg border border-(--border-subtle) bg-(--bg-base) px-5 py-2.5 text-sm font-medium text-(--fg-default) transition-colors hover:bg-(--bg-muted)">
            Reset to defaults
          </button>
          <button className="rounded-lg bg-(--color-ink-black) px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark)">
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function ThemeCard({ theme, active }: { theme: typeof DEFAULT_THEMES[number]; active: boolean }) {
  return (
    <button
      type="button"
      className={`relative rounded-lg border p-4 text-left transition-colors ${
        active
          ? 'border-(--color-ink-black) bg-(--bg-surface-subtle)'
          : 'border-(--border-subtle) bg-(--bg-base) hover:border-(--border-default)'
      }`}
    >
      {active && (
        <span className="absolute right-3 top-3 rounded-md bg-(--color-forest-green) px-2 py-0.5 text-xs font-medium text-white">
          Active
        </span>
      )}
      <div className="mb-3 flex gap-1.5">
        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: theme.colors.accent }} />
        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: theme.colors.bg, border: '1px solid var(--border-subtle)' }} />
      </div>
      <h3 className="text-sm font-semibold text-(--fg-default)">{theme.name}</h3>
      <p className="mt-1 text-xs text-(--fg-muted)">{theme.description}</p>
    </button>
  );
}
