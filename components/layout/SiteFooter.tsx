import Link from 'next/link';

const socialLinks = [
  { label: 'f', href: '#', name: 'Facebook' },
  { label: 'X', href: '#', name: 'X' },
  { label: 'in', href: '#', name: 'LinkedIn' },
  { label: '\u25B6', href: '#', name: 'YouTube' },
  { label: '\u25FB', href: '#', name: 'Instagram' },
];

const footerColumns = [
  {
    heading: 'Editorial',
    links: [
      { href: '/news', label: 'News' },
      { href: '/politics', label: 'Politics' },
      { href: '/business', label: 'Business' },
      { href: '/technology', label: 'Technology' },
      { href: '/opinion', label: 'Opinion' },
      { href: '/newsletter', label: 'Newsletters' },
    ],
  },
  {
    heading: 'Community',
    links: [
      { href: '/directory', label: 'Business Directory' },
      { href: '/events', label: 'Events' },
      { href: '/marketplace', label: 'Marketplace' },
      { href: '/jobs', label: 'Jobs Board' },
      { href: '/real-estate', label: 'Real Estate' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/advertise', label: 'Advertise' },
      { href: '/contact', label: 'Contact' },
      { href: '/careers', label: 'Careers' },
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Use' },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-[#0f1419] py-12 text-white">
      <div className="px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Column 1: Logo + Description */}
          <div>
            <div className="mb-5">
              <span className="font-display text-2xl font-bold leading-none text-white">
                NewsPulse<span className="text-[#dc2626]">PRO</span>
              </span>
              <p className="mt-1.5 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                Editorial authority for the modern web
              </p>
            </div>
            <p className="mb-5 max-w-sm text-sm leading-relaxed text-gray-400">
              NewsPulse PRO combines world-class journalism with a full community super-platform: directory, jobs, marketplace, events, bookings, real estate, and self-serve advertising.
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map(({ label, href, name }) => (
                <Link
                  key={name}
                  href={href}
                  aria-label={name}
                  className="flex h-9 w-9 items-center justify-center border border-white/20 text-sm font-bold text-gray-400 transition-colors hover:border-[#dc2626] hover:bg-[#dc2626] hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Columns 2-4 */}
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-4 border-b border-white/10 pb-2.5 text-[11px] font-black uppercase tracking-widest">
                {col.heading}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 transition-all hover:pl-1 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 flex flex-col justify-between border-t border-white/10 pt-8 text-xs text-gray-500 sm:flex-row sm:items-center">
          <p>&copy; 2026 NewsPulse PRO. All rights reserved.</p>
          <div className="mt-3 flex gap-5 sm:mt-0">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
