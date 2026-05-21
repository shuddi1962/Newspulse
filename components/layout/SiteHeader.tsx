'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface SiteHeaderProps {
  activeNav?: string;
}

export function SiteHeader({ activeNav = 'home' }: SiteHeaderProps) {
  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'News', href: '/news' },
    { label: 'Video', href: '/video' },
    { label: 'Directory', href: '/directory' },
    { label: 'Jobs', href: '/jobs' },
    { label: 'Marketplace', href: '/marketplace' },
    { label: 'Events', href: '/events' },
    { label: 'Real Estate', href: '/real-estate' },
    { label: 'Advertise', href: '/advertise' },
  ];

  const catLinks = ['Politics', 'Business', 'Technology', 'Sports', 'Entertainment', 'Health', 'Africa', 'World', 'Opinion'];

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  function isActive(label: string) {
    if (label === 'Home' && activeNav === 'home') return true;
    if (label === 'News' && activeNav === 'news') return true;
    return false;
  }

  return (
    <header>
      {/* Top Bar */}
      <div className="border-b py-2" style={{ backgroundColor: 'var(--bg-header)', borderColor: 'var(--border-header)' }}>
        <div className="flex items-center justify-between px-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--fg-header-muted)' }}>
            <span>{dateStr}</span>
            <span className="hidden sm:inline">Lagos, Nigeria</span>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--fg-header-muted)' }}>
            <Link href="/login" className="transition-colors" style={{ color: 'var(--fg-header-muted)' }}>Login</Link>
            <span style={{ color: 'var(--border-header)' }}>|</span>
            <Link href="/signup" className="transition-colors" style={{ color: 'var(--fg-header-muted)' }}>Register</Link>
            <span className="hidden sm:inline" style={{ color: 'var(--border-header)' }}>|</span>
            <Link href="#" className="transition-colors hidden sm:inline" style={{ color: 'var(--fg-header-muted)' }}>EN</Link>
            <span className="hidden sm:inline" style={{ color: 'var(--border-header)' }}>|</span>
            <Link href="#" className="transition-colors hidden sm:inline" style={{ color: 'var(--fg-header-muted)' }}>FR</Link>
            <ThemeToggle />
            <Link
              href="/subscribe"
              className="bg-[#dc2626] px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-[#c1121f]"
              style={{ color: '#ffffff' }}
            >
              Subscribe
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky Main Nav + Category Bar */}
      <div className="sticky top-0 z-50">
        {/* Main Nav */}
        <div style={{ backgroundColor: 'var(--bg-header-surface)' }}>
          <div className="px-4 md:px-8 lg:px-12">
            <div className="flex items-center justify-between" style={{ minHeight: '64px' }}>
              <Link href="/" className="flex flex-col shrink-0 mr-4">
                <span className="font-display text-2xl font-bold leading-none" style={{ color: 'var(--fg-header)' }}>
                  NewsPulse<span className="text-[#dc2626]">PRO</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--fg-header-muted)' }}>
                  Editorial authority for the modern web
                </span>
              </Link>

              <nav className="flex items-center gap-5 flex-wrap">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-xs font-bold uppercase tracking-wider transition-colors whitespace-nowrap shrink-0"
                    style={{
                      color: 'var(--fg-header)',
                      borderBottom: isActive(link.label) ? '2px solid #dc2626' : '2px solid transparent',
                      paddingBottom: '2px',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center shrink-0 ml-3">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Search news, topics, categories..."
                    className="w-[200px] md:w-[260px] lg:w-[320px] h-9 pl-9 pr-3 text-xs outline-none transition-all focus:w-[260px] md:focus:w-[340px] header-search-input"
                    style={{
                      backgroundColor: 'var(--bg-header)',
                      border: '1px solid var(--border-header)',
                      color: 'var(--fg-header)',
                    }}
                  />
                  <Search className="absolute left-2.5 h-4 w-4" style={{ color: 'var(--fg-header-muted)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Bar */}
        <div className="bg-[#dc2626]">
          <div className="flex overflow-x-auto px-4 md:px-8 lg:px-12">
            {catLinks.map((cat) => (
              <Link
                key={cat}
                href={`/${cat.toLowerCase()}`}
                className="whitespace-nowrap border-r border-white/15 px-4 py-2.5 text-xs font-bold transition-colors hover:bg-black/15"
                style={{ color: '#ffffff' }}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
