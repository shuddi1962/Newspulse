import Link from 'next/link';

export const metadata = {
  title: 'Settings — NewsPulse PRO',
};

const settingsNav = [
  { href: '/admin/settings', label: 'Theme', description: 'Customize colors and branding' },
  { href: '/admin/settings/general', label: 'General', description: 'Site name, tagline, timezone' },
  { href: '/admin/settings/seo', label: 'SEO', description: 'Meta tags, social sharing' },
  { href: '/admin/settings/social', label: 'Social Media', description: 'Connect social accounts' },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-gray-500">
          Settings
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-gray-900">
          Settings
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <aside className="space-y-1">
          {settingsNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg border border-gray-200 p-3 text-sm transition-colors hover:bg-gray-50"
            >
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="text-xs text-gray-500">{item.description}</p>
            </Link>
          ))}
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">{children}</div>
      </div>
    </div>
  );
}
