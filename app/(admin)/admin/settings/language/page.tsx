import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/auth/session';
import { Plus, Download, Upload, RotateCw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Language Settings — NewsPulse PRO',
};

const installedLanguages = [
  { code: 'en', name: 'English', rtl: false, enabled: true },
  { code: 'es', name: 'Spanish', rtl: false, enabled: true },
  { code: 'fr', name: 'French', rtl: false, enabled: false },
  { code: 'ar', name: 'Arabic', rtl: true, enabled: false },
  { code: 'sw', name: 'Swahili', rtl: false, enabled: true },
];

const commonLanguages = ['English', 'Spanish', 'French', 'Arabic', 'Swahili', 'German', 'Portuguese', 'Chinese', 'Japanese', 'Russian'];

const sampleTranslations = [
  { key: 'site.title', en: 'NewsPulse PRO', es: 'NewsPulse PRO', sw: 'NewsPulse PRO' },
  { key: 'nav.home', en: 'Home', es: 'Inicio', sw: 'Nyumbani' },
  { key: 'nav.articles', en: 'Articles', es: 'Artículos', sw: 'Makala' },
  { key: 'nav.categories', en: 'Categories', es: 'Categorías', sw: 'Kategoria' },
  { key: 'common.search', en: 'Search', es: 'Buscar', sw: 'Tafuta' },
  { key: 'common.read_more', en: 'Read More', es: 'Leer Más', sw: 'Soma Zaidi' },
  { key: 'common.subscribe', en: 'Subscribe', es: 'Suscribirse', sw: 'Jisajili' },
];

export default async function LanguageSettingsPage() {
  await requireAdmin();
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-(--fg-default)">Language</h1>
        <p className="mt-1 text-sm text-(--fg-muted)">Manage multi-language support and translations.</p>
      </div>
      <div className="space-y-8">
        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-(--fg-default)">Installed Languages</h2>
            <div className="flex items-center gap-2">
              <select className="field-input text-sm">
                <option value="" disabled selected>Add language...</option>
                {commonLanguages.map((lang) => <option key={lang}>{lang}</option>)}
              </select>
              <button className="flex items-center gap-1 rounded-lg bg-(--color-ink-black) px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark)">
                <Plus className="h-4 w-4" /> Add
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--border-subtle) text-left text-xs uppercase tracking-wider text-(--fg-muted)">
                  <th className="pb-2 pr-4 font-medium">Language</th>
                  <th className="pb-2 pr-4 font-medium">Code</th>
                  <th className="pb-2 pr-4 font-medium">RTL</th>
                  <th className="pb-2 pr-4 font-medium">Enabled</th>
                  <th className="pb-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {installedLanguages.map((lang) => (
                  <tr key={lang.code} className="border-b border-(--border-subtle) last:border-0">
                    <td className="py-3 pr-4 text-(--fg-default)">{lang.name}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-(--fg-muted)">{lang.code}</td>
                    <td className="py-3 pr-4">{lang.rtl ? <span className="rounded bg-(--bg-muted) px-2 py-0.5 text-xs">Yes</span> : <span className="text-(--fg-muted)">No</span>}</td>
                    <td className="py-3 pr-4"><span className={`rounded px-2 py-0.5 text-xs font-medium ${lang.enabled ? 'bg-(--color-forest-green)/10 text-(--color-forest-green)' : 'bg-(--bg-muted) text-(--fg-muted)'}`}>{lang.enabled ? 'Enabled' : 'Disabled'}</span></td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button className="rounded border border-(--border-subtle) px-2 py-1 text-xs text-(--fg-muted) transition-colors hover:text-(--fg-default)">Edit</button>
                        <button className="rounded border border-(--border-subtle) px-2 py-1 text-xs text-(--color-signal-red) transition-colors hover:bg-(--color-signal-red)/10">Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-(--fg-default)">Translation Manager</h2>
            <select className="field-input text-sm w-40">
              <option>English (en)</option>
              <option>Spanish (es)</option>
              <option>Swahili (sw)</option>
            </select>
          </div>
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-(--border-subtle) text-left text-xs uppercase tracking-wider text-(--fg-muted)">
                  <th className="pb-2 pr-4 font-medium">Key</th>
                  <th className="pb-2 font-medium">Translation</th>
                </tr>
              </thead>
              <tbody>
                {sampleTranslations.map((t) => (
                  <tr key={t.key} className="border-b border-(--border-subtle) last:border-0">
                    <td className="w-1/3 py-2 pr-4 font-mono text-xs text-(--fg-muted)">{t.key}</td>
                    <td className="py-2"><input type="text" defaultValue={t.en} className="field-input w-full" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-(--color-ink-dark)">Save Translations</button>
          </div>
        </div>

        <div className="rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <h2 className="mb-4 text-base font-semibold text-(--fg-default)">Language Switcher</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-(--fg-default)">Show in header</label>
              <button type="button" role="switch" aria-checked="true" className="relative h-5 w-9 rounded-full bg-(--color-ink-black) transition-colors">
                <span className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm" />
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--fg-default)">Default language</label>
              <select className="field-input">
                <option>English</option>
                <option>Spanish</option>
                <option>Swahili</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-(--border-subtle) bg-(--bg-base) p-6">
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-lg border border-(--border-subtle) bg-(--bg-base) px-4 py-2 text-sm font-medium text-(--fg-default) transition-colors hover:bg-(--bg-muted)">
              <RotateCw className="h-4 w-4" /> Sync translations
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-(--border-subtle) bg-(--bg-base) px-4 py-2 text-sm font-medium text-(--fg-default) transition-colors hover:bg-(--bg-muted)">
              <Download className="h-4 w-4" /> Export
            </button>
            <button className="flex items-center gap-2 rounded-lg border border-(--border-subtle) bg-(--bg-base) px-4 py-2 text-sm font-medium text-(--fg-default) transition-colors hover:bg-(--bg-muted)">
              <Upload className="h-4 w-4" /> Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
