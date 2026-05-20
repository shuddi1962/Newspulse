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
  const breakingItems = [
    "Nigeria's inflation dips to 28.5% as CBN holds rates steady",
    "NNPC announces major oil discovery in deep offshore block OPL-320",
    "Dangote Refinery begins export of refined petroleum to West Africa",
    "Lagos-Ibadan Expressway expansion reaches 80% completion",
    "Tech startups raise record $2.4B in Q1 2026 across Africa",
  ];

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
      <div className="border-b border-white/5 bg-[#111820] py-2">
        <div className="flex items-center justify-between px-4 md:px-8 lg:px-12">
          <div className="flex items-center gap-4 text-xs" style={{ color: '#9ca3af' }}>
            <span>{dateStr}</span>
            <span className="hidden sm:inline">Lagos, Nigeria</span>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: '#9ca3af' }}>
            <Link href="/login" className="transition-colors" style={{ color: '#9ca3af' }}>Login</Link>
            <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <Link href="/signup" className="transition-colors" style={{ color: '#9ca3af' }}>Register</Link>
            <span className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <Link href="#" className="transition-colors hidden sm:inline" style={{ color: '#9ca3af' }}>EN</Link>
            <span className="hidden sm:inline" style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
            <Link href="#" className="transition-colors hidden sm:inline" style={{ color: '#9ca3af' }}>FR</Link>
            <ThemeToggle />
            <Link
              href="/subscribe"
              className="bg-[#e63946] px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors hover:bg-[#c1121f]"
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
        <div className="bg-[#0f1419]">
          <div className="px-4 md:px-8 lg:px-12">
            <div className="flex items-center justify-between" style={{ minHeight: '64px' }}>
              <Link href="/" className="flex flex-col shrink-0 mr-4">
                <span className="font-display text-2xl font-bold leading-none text-white">
                  NewsPulse<span className="text-[#e63946]">PRO</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>
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
                      color: '#ffffff',
                      borderBottom: isActive(link.label) ? '2px solid #e63946' : '2px solid transparent',
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
                    className="w-[200px] md:w-[260px] lg:w-[320px] h-9 bg-white/10 border border-white/20 pl-9 pr-3 text-xs text-white placeholder-white/40 outline-none transition-all focus:w-[260px] md:focus:w-[340px] focus:border-white/40 focus:bg-white/15"
                  />
                  <Search className="absolute left-2.5 h-4 w-4" style={{ color: '#9ca3af' }} />
                </div>
              </div>
              </div>
            </div>
          </div>

        {/* Category Bar - stays red regardless of theme */}
        <div className="bg-[#e63946]">
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

      {/* Breaking News Ticker */}
      <div className="border-b border-white/8 bg-[#0f1419] py-2">
        <div className="flex items-center gap-4 overflow-hidden px-4 md:px-8 lg:px-12">
          <span className="shrink-0 bg-[#e63946] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest" style={{ color: '#ffffff' }}>
            Breaking
          </span>
          <div className="relative flex-1 overflow-hidden">
            <div className="animate-ticker whitespace-nowrap">
              {breakingItems.map((item) => (
                <span key={item} className="mr-8 inline-block text-xs" style={{ color: '#d1d5db' }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
