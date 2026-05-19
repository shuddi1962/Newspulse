'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';

interface SiteHeaderProps {
  activeNav?: string;
}

export function SiteHeader({ activeNav = 'home' }: SiteHeaderProps) {
  const navLinks = ['Home', 'News', 'Video', 'Directory', 'Jobs', 'Markets', 'Events', 'Advertise'];
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

  function isActiveNav(label: string) {
    if (label === 'Home' && activeNav === 'home') return true;
    if (label === 'News' && activeNav === 'news') return true;
    return false;
  }

  return (
    <header>
      {/* Layer 1: Top Bar */}
      <div className="border-b border-white/5 bg-[#111820] py-1.5">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5">
          <div className="flex items-center gap-4 text-[11px] text-gray-400">
            <span>{dateStr}</span>
            <span className="hidden sm:inline">Lagos, Nigeria</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            <span className="text-white/20">|</span>
            <Link href="/signup" className="hover:text-white transition-colors">Register</Link>
            <span className="text-white/20 hidden sm:inline">|</span>
            <Link href="#" className="hover:text-white transition-colors hidden sm:inline">EN</Link>
            <span className="text-white/20 hidden sm:inline">|</span>
            <Link href="#" className="hover:text-white transition-colors hidden sm:inline">FR</Link>
            <Link
              href="/subscribe"
              className="bg-[#e63946] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#c1121f]"
            >
              Subscribe
            </Link>
          </div>
        </div>
      </div>

      {/* Layer 2: Main Nav */}
      <div className="bg-[#0f1419]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5" style={{ height: '58px' }}>
          <div className="flex items-center gap-6">
            <Link href="/" className="flex flex-col">
              <span className="font-display text-[22px] font-bold leading-none text-white">
                NewsPulse<span className="text-[#e63946]">PRO</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                Editorial authority for the modern web
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-5 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link}
                href={link === 'Home' ? '/' : `/${link.toLowerCase()}`}
                className={`text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  isActiveNav(link)
                    ? 'text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
                style={{
                  borderBottom: isActiveNav(link) ? '2px solid #e63946' : '2px solid transparent',
                  paddingBottom: '2px',
                }}
              >
                {link}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-[11px] font-bold uppercase tracking-wider text-gray-300 hover:text-white transition-colors sm:inline">
              Sign in
            </Link>
            <button
              className="flex h-[32px] w-[32px] items-center justify-center border border-white/20 text-gray-400 transition-colors hover:border-[#e63946] hover:text-[#e63946]"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Layer 3: Category Bar */}
      <div className="bg-[#e63946]">
        <div className="mx-auto flex max-w-[1200px] overflow-x-auto px-5">
          {catLinks.map((cat) => (
            <Link
              key={cat}
              href={`/${cat.toLowerCase()}`}
              className="whitespace-nowrap border-r border-white/15 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white/85 transition-colors hover:bg-black/15 hover:text-white"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Layer 4: Breaking News Ticker */}
      <div className="border-b border-white/8 bg-[#0f1419] py-[7px]">
        <div className="mx-auto flex max-w-[1200px] items-center gap-4 overflow-hidden px-5">
          <span className="shrink-0 bg-[#e63946] px-2 py-1 text-[10px] font-black uppercase tracking-widest text-white">
            Breaking
          </span>
          <div className="relative flex-1 overflow-hidden">
            <div className="animate-ticker whitespace-nowrap">
              {breakingItems.map((item) => (
                <span key={item} className="mr-8 inline-block text-[12px] text-gray-200">
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
