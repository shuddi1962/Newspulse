import Link from 'next/link';
import { env } from '@/lib/env';

type FooterSection = {
  heading: string;
  links: Array<{ href: string; label: string }>;
};

const sections: FooterSection[] = [
  {
    heading: 'Editorial',
    links: [
      { href: '/news', label: 'News' },
      { href: '/opinion', label: 'Opinion' },
      { href: '/newsletters', label: 'Newsletters' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { href: '/directory', label: 'Business directory' },
      { href: '/events', label: 'Events' },
      { href: '/marketplace', label: 'Marketplace' },
    ],
  },
  {
    heading: 'Platform',
    links: [
      { href: '/jobs', label: 'Jobs' },
      { href: '/real-estate', label: 'Real estate' },
      { href: '/advertise', label: 'Advertise' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
      { href: '/legal/privacy', label: 'Privacy' },
      { href: '/legal/terms', label: 'Terms' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-(--border-subtle) bg-(--bg-base)">
      <div className="mx-auto w-full max-w-screen-2xl px-6 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {sections.map((section) => (
            <div key={section.heading}>
              <h3 className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">
                {section.heading}
              </h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-(--fg-muted) transition-colors hover:text-(--fg-default)"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-(--border-subtle) pt-8 text-xs text-(--fg-subtle) sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {env.NEXT_PUBLIC_SITE_NAME}. All rights reserved.
          </p>
          <p>Editorial authority for the modern web.</p>
        </div>
      </div>
    </footer>
  );
}
