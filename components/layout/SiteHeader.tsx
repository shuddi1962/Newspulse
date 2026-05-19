'use client';

import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface SiteHeaderProps {
  activeNav?: string;
}

export function SiteHeader({ activeNav = 'home' }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <div className="flex items-center gap-4 text-xs text-gray-300">
            <span>{dateStr}</span>
            <span className="hidden sm:inline">Lagos, Nigeria</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-300">
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <span className="text-white/20">|</span>
            <Link href="/signup" className="hover:text-white transition-colors">Register</Link>
            <span className="text-white/20 hidden sm:inline">|</span>
            <Link href="#" className="hover:text-white transition-colors hidden sm:inline">EN</Link>
            <span className="text-white/20 hidden sm:inline">|</span>
            <Link href="#" className="hover:text-white transition-colors hidden sm:inline">FR</Link>
            <Link
              href="/subscribe"
              className="bg-[#e63946] px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#c1121f]"
            >
              Subscribe
            </Link>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="bg-[#0f1419]">
        <div className="px-4 md:px-8 lg:px-12">
          <div className="flex items-center justify-between" style={{ minHeight: '64px' }}>
            <Link href="/" className="flex flex-col shrink-0 mr-4">
              <span className="font-display text-2xl font-bold leading-none text-white">
                NewsPulse<span className="text-[#e63946]">PRO</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">
                Editorial authority for the modern web
              </span>
            </Link>

            <nav className="flex items-center gap-5 flex-wrap">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-xs font-bold uppercase tracking-wider text-gray-200 hover:text-white transition-colors whitespace-nowrap shrink-0"
                  style={{
                    borderBottom: isActive(link.label) ? '2px solid #e63946' : '2px solid transparent',
                    paddingBottom: '2px',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-3 shrink-0 ml-3">
              <Link
                href="/login"
                className="hidden md:inline text-xs font-bold uppercase tracking-wider text-gray-200 hover:text-white transition-colors"
              >
                Sign in
              </Link>
              <button
                className="flex h-9 w-9 items-center justify-center border border-white/20 text-gray-300 transition-colors hover:border-[#e63946] hover:text-[#e63946] shrink-0"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
              <button
                className="flex h-9 w-9 items-center justify-center text-gray-300 hover:text-white shrink-0"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {mobileOpen && (
            <nav className="border-t border-white/10 pb-3">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2.5 text-sm font-bold uppercase tracking-wider text-gray-200 hover:text-white border-b border-white/5"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* Category Bar */}
      <div className="bg-[#e63946]">
        <div className="flex overflow-x-auto px-4 md:px-8 lg:px-12">
          {catLinks.map((cat) => (
            <Link
              key={cat}
              href={`/${cat.toLowerCase()}`}
              className="whitespace-nowrap border-r border-white/15 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white/85 transition-colors hover:bg-black/15 hover:text-white"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Breaking News Ticker */}
      <div className="border-b border-white/8 bg-[#0f1419] py-2">
        <div className="flex items-center gap-4 overflow-hidden px-4 md:px-8 lg:px-12">
          <span className="shrink-0 bg-[#e63946] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white">
            Breaking
          </span>
          <div className="relative flex-1 overflow-hidden">
            <div className="animate-ticker whitespace-nowrap">
              {breakingItems.map((item) => (
                <span key={item} className="mr-8 inline-block text-xs text-gray-200">
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
