import Link from 'next/link';

const socialLinks = [
  { label: 'f', href: '#', name: 'Facebook' },
  { label: 'X', href: '#', name: 'X' },
  { label: 'in', href: '#', name: 'LinkedIn' },
  { label: '▶', href: '#', name: 'YouTube' },
  { label: '◻', href: '#', name: 'Instagram' },
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
    <footer className="bg-[#0f1419] py-10 text-white">
      <div className="mx-auto max-w-[1200px] px-5">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Column 1: Logo + Description */}
          <div>
            <div className="mb-4">
              <span className="font-display text-[22px] font-bold leading-none text-white">
                NewsPulse<span className="text-[#e63946]">PRO</span>
              </span>
              <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-gray-500">
                Editorial authority for the modern web
              </p>
            </div>
            <p className="mb-4 max-w-sm text-[13px] leading-relaxed text-gray-400">
              NewsPulse PRO combines world-class journalism with a full community super-platform: directory, jobs, marketplace, events, bookings, real estate, and self-serve advertising.
            </p>
            <div className="flex items-center gap-2">
              {socialLinks.map(({ label, href, name }) => (
                <Link
                  key={name}
                  href={href}
                  aria-label={name}
                  className="flex h-8 w-8 items-center justify-center border border-white/20 text-[12px] font-bold text-gray-400 transition-colors hover:border-[#e63946] hover:bg-[#e63946] hover:text-white"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Columns 2-4 */}
          {footerColumns.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-3 border-b border-white/10 pb-2 text-[11px] font-black uppercase tracking-widest">
                {col.heading}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-gray-400 transition-all hover:pl-1 hover:text-white"
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
        <div className="mt-10 flex flex-col justify-between border-t border-white/10 pt-6 text-xs text-gray-500 sm:flex-row sm:items-center">
          <p>&copy; 2026 NewsPulse PRO. All rights reserved.</p>
          <div className="mt-2 flex gap-4 sm:mt-0">
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
