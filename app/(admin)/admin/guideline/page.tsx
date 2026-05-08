export default function GuidelinePage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Reference</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">Quick Guide</h1>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: 'Getting Started', desc: 'Learn the basics of managing content on NewsPulse PRO.', icon: '01' },
          { title: 'Writing Articles', desc: 'Best practices for creating engaging news articles.', icon: '02' },
          { title: 'Media Guidelines', desc: 'Image sizes, formats, and optimization tips.', icon: '03' },
          { title: 'SEO Best Practices', desc: 'Optimize your content for search engines.', icon: '04' },
          { title: 'Editorial Workflow', desc: 'Understanding the draft → review → publish pipeline.', icon: '05' },
          { title: 'Ad Placement', desc: 'How to manage and optimize ad placements.', icon: '06' },
        ].map((guide) => (
          <div key={guide.icon} className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5 transition-shadow hover:shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">{guide.icon}</div>
            <h3 className="mt-4 font-display text-lg font-semibold text-gray-900">{guide.title}</h3>
            <p className="mt-2 text-sm text-gray-500">{guide.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
