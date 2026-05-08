import { TrendingUp } from 'lucide-react';

export default function UpdateGuidesPage() {
  const updates = [
    { version: '2.0.0', date: '2026-05-01', title: 'AI Writer Integration', desc: 'Integrated OpenRouter AI for article generation, rewriting, and SEO optimization.' },
    { version: '1.9.0', date: '2026-04-15', title: 'Ad Platform Launch', desc: 'Self-serve advertising platform with campaign wizard, analytics, and serving engine.' },
    { version: '1.8.0', date: '2026-04-01', title: 'Multi-Language Support', desc: 'Added locale definitions for EN, ES, FR, AR, SW with RTL support and locale selector.' },
    { version: '1.7.0', date: '2026-03-15', title: 'Marketplace Modules', desc: 'Business directory, job board, marketplace, events, real estate, classifieds.' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Changelog</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">Update Guides</h1>
      </div>

      <div className="space-y-4">
        {updates.map((update) => (
          <div key={update.version} className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <div>
                  <h3 className="font-display text-lg font-semibold text-gray-900">{update.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{update.desc}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">v{update.version}</span>
                <p className="mt-1 text-xs text-gray-400">{update.date}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
