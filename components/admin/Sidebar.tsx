'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  LayoutDashboard, FileText, Image, Menu, ChevronDown,
  Newspaper, Tags, UserPlus, Mail,
  Video, FilePlus, Globe, BookOpen,
  Megaphone, Hammer, LogOut, PanelRightClose,
  PanelRightOpen, Radio, TrendingUp, Vote,
  PenSquare, List, Upload, AlertCircle, MessageSquare,
  FolderOpen, Settings, Server,
  BarChart3, Users,
  Rss, Archive, Eye, Search,
  Monitor, Palette, Languages, Database,
  Shield, Cookie, Bot, UserCheck,
  Zap,   Sparkles, Share2, CalendarDays,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { signOutAction } from '@/lib/auth/actions';
import type { AuthUser } from '@/lib/auth/session';

interface NavItem {
  label: string;
  href?: string;
  icon: typeof LayoutDashboard;
  children?: { label: string; href: string; icon?: typeof LayoutDashboard }[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard', icon: LayoutDashboard,
    children: [
      { label: 'Overview', href: '/admin/dashboard', icon: BarChart3 },
      { label: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
    ],
  },
  {
    label: 'Post', icon: FileText,
    children: [
      { label: 'Add Post', href: '/admin/posts/add', icon: PenSquare },
      { label: 'Post List', href: '/admin/posts', icon: List },
      { label: 'Bulk Upload', href: '/admin/posts/bulk-upload', icon: Upload },
      { label: 'Breaking News', href: '/admin/posts/breaking-news', icon: AlertCircle },
      { label: 'Story Manage', href: '/admin/posts/stories', icon: Zap },
      { label: 'Post Comments', href: '/admin/posts/comments', icon: MessageSquare },
    ],
  },
  {
    label: 'Media', icon: Image,
    children: [
      { label: 'Photo Upload', href: '/admin/media/upload', icon: Upload },
      { label: 'Photo List', href: '/admin/media', icon: Image },
      { label: 'File Manager', href: '/admin/media/files', icon: FolderOpen },
    ],
  },
  {
    label: 'Menu', icon: Menu,
    children: [
      { label: 'Menu List', href: '/admin/menu', icon: List },
    ],
  },
  {
    label: 'AI / Video', icon: Sparkles,
    children: [
      { label: 'AI Settings', href: '/admin/ai', icon: Bot },
      { label: 'AI Writer', href: '/admin/ai/writer', icon: PenSquare },
      { label: 'AI Image', href: '/admin/ai/image', icon: Image },
      { label: 'Video Post', href: '/admin/video-post', icon: Video },
    ],
  },
  {
    label: 'Categories', icon: Newspaper,
    children: [
      { label: 'Category List', href: '/admin/categories', icon: List },
    ],
  },
  {
    label: 'Archive', icon: Archive,
    children: [
      { label: 'Archive Settings', href: '/admin/archive', icon: Settings },
    ],
  },
  {
    label: 'RSS Feeds', icon: Rss,
    children: [
      { label: 'RSS Links', href: '/admin/rss', icon: Rss },
      { label: 'External Feeds', href: '/admin/rss/external', icon: Share2 },
    ],
  },
  {
    label: 'Reporter', icon: UserPlus,
    children: [
      { label: 'Reporter List', href: '/admin/reporters', icon: Users },
    ],
  },
  {
    label: 'Opinion', icon: Eye,
    children: [
      { label: 'Opinion List', href: '/admin/opinion', icon: List },
    ],
  },
  {
    label: 'Polls', icon: Vote,
    children: [
      { label: 'Poll List', href: '/admin/polls', icon: List },
    ],
  },
  {
    label: 'Advertisement', icon: Megaphone,
    children: [
      { label: 'Ad Manager', href: '/admin/advertisement', icon: Settings },
      { label: 'Ad Review', href: '/admin/ads', icon: Eye },
    ],
  },
  {
    label: 'Page', icon: FilePlus,
    children: [
      { label: 'Add New Page', href: '/admin/pages/new', icon: PenSquare },
      { label: 'Page List', href: '/admin/pages', icon: List },
    ],
  },
  {
    label: 'SEO', icon: Search,
    children: [
      { label: 'Meta Settings', href: '/admin/settings/seo', icon: Settings },
      { label: 'Sitemap', href: '/admin/settings/seo', icon: Share2 },
      { label: 'Social Links', href: '/admin/settings/social', icon: Share2 },
      { label: 'Custom Code', href: '/admin/settings/custom-code', icon: Monitor },
      { label: 'Advanced SEO', href: '/admin/settings/advanced-seo', icon: Zap },
    ],
  },
  {
    label: 'Auto Settings', icon: Radio,
    children: [
      { label: 'Social Auto Post', href: '/admin/auto-post', icon: Share2 },
    ],
  },
  {
    label: 'Web Setup', icon: Globe,
    children: [
      { label: 'Breaking Setup', href: '/admin/web-setup/breaking', icon: AlertCircle },
      { label: 'Homepage Setup', href: '/admin/web-setup/homepage', icon: Monitor },
      { label: 'Contact Page', href: '/admin/web-setup/contact', icon: FilePlus },
      { label: 'Other Pages', href: '/admin/web-setup/pages', icon: FileText },
    ],
  },
  {
    label: 'Settings', icon: Settings,
    children: [
      { label: 'Software Setup', href: '/admin/settings', icon: Server },
      { label: 'Application', href: '/admin/settings/application', icon: Settings },
      { label: 'Social API', href: '/admin/settings/social-api', icon: Share2 },
      { label: 'Mail Setup', href: '/admin/settings/mail', icon: Mail },
      { label: 'Space Credentials', href: '/admin/settings/space', icon: Database },
      { label: 'Font Settings', href: '/admin/settings/font', icon: Palette },
      { label: 'Language Setup', href: '/admin/settings/language', icon: Languages },
    ],
  },
  {
    label: 'Users', icon: Users,
    children: [
      { label: 'Role List', href: '/admin/users/roles', icon: Shield },
      { label: 'User List', href: '/admin/users', icon: Users },
    ],
  },
  {
    label: 'Backup / Reset', icon: Database,
    children: [
      { label: 'Backup', href: '/admin/backup', icon: Database },
    ],
  },
  {
    label: 'Access Log', icon: Shield,
    children: [
      { label: 'Activity Log', href: '/admin/access-log', icon: Monitor },
    ],
  },
  {
    label: 'Privacy', icon: Cookie,
    children: [
      { label: 'Cookie Consent', href: '/admin/cookie', icon: Cookie },
      { label: 'reCAPTCHA', href: '/admin/recaptcha', icon: Shield },
    ],
  },
  {
    label: 'Subscribers', icon: UserCheck,
    children: [
      { label: 'Subscriber List', href: '/admin/newsletter', icon: Users },
    ],
  },
  {
    label: 'Newsletter', icon: Mail,
    children: [
      { label: 'Campaigns', href: '/admin/newsletter', icon: Mail },
    ],
  },
  { label: 'Tags', href: '/admin/tags', icon: Tags },
  { label: 'Options', href: '/admin/options', icon: Hammer },
  { label: 'Schedule', href: '/admin/schedule', icon: CalendarDays },
  { label: 'Quick Guide', href: '/admin/guideline', icon: BookOpen },
  { label: 'Update Guides', href: '/admin/update-guides', icon: TrendingUp },
];

interface SidebarProps {
  user: AuthUser;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved === 'true') setCollapsed(true);
    const active = navItems.find((item) =>
      item.href === pathname || item.children?.some((c) => c.href === pathname),
    );
    if (active?.children) {
      setExpandedGroups((prev) => ({ ...prev, [active.label]: true }));
    }
  }, [pathname]);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      localStorage.setItem('admin-sidebar-collapsed', String(!prev));
      return !prev;
    });
  }, []);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href?: string) => href === pathname;
  const isChildActive = (children?: { href: string }[]) =>
    children?.some((c) => c.href === pathname);

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[var(--color-navy)]">
      <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
        {!collapsed && (
          <Link href="/admin/dashboard" className="font-display text-lg font-bold tracking-tight text-gray-900">
            N<span className="text-[var(--color-crimson)]">365</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/admin/dashboard" className="mx-auto text-lg font-bold text-gray-900">
            N<span className="text-[var(--color-crimson)]">3</span>
          </Link>
        )}
        <button
          onClick={toggleCollapse}
          className="hidden rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 md:block"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelRightOpen className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300">
        {navItems.map((item) => {
          const active = isActive(item.href) || isChildActive(item.children);
          const open = expandedGroups[item.label] ?? active;

          if (item.children) {
            return (
              <div key={item.label} className="mb-0.5">
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    active
                      ? 'border-l-2 border-[var(--color-crimson)] bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left text-xs font-medium uppercase tracking-wider">{item.label}</span>
                      <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
                    </>
                  )}
                </button>
                {open && !collapsed && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l border-gray-200 pl-2">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                          isActive(child.href)
                            ? 'border-l-2 border-[var(--color-crimson)] bg-gray-100 text-gray-900'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                        )}
                      >
                        {child.icon && <child.icon className="h-3.5 w-3.5 shrink-0" />}
                        <span>{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href!}
              className={cn(
                'mb-0.5 flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'border-l-2 border-[var(--color-crimson)] bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="text-xs font-medium uppercase tracking-wider">{item.label}</span>}
            </Link>
          );
        })}
      </div>

      <div className="border-t border-gray-200 p-4">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-crimson)] text-xs font-bold text-white">
              {user.name?.charAt(0)?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{user.name ?? 'Admin'}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            <button
              onClick={() => {
                startTransition(async () => {
                  const result = await signOutAction();
                  if (result.status === 'error') {
                    toast.error(result.message);
                    return;
                  }
                  router.replace('/login');
                  router.refresh();
                });
              }}
              disabled={isPending}
              className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-crimson)] text-xs font-bold text-white">
              {user.name?.charAt(0)?.toUpperCase() ?? 'A'}
            </div>
            <button
              onClick={() => {
                startTransition(async () => {
                  const result = await signOutAction();
                  if (result.status === 'error') {
                    toast.error(result.message);
                    return;
                  }
                  router.replace('/login');
                  router.refresh();
                });
              }}
              disabled={isPending}
              className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 z-30 h-screen transition-all duration-200',
          collapsed ? 'w-[70px]' : 'w-[260px]',
        )}
      >
        <div className="hidden h-full md:block">{sidebarContent}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative h-full w-[260px]">{sidebarContent}</aside>
        </div>
      )}

      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-20 rounded-md border border-gray-200 bg-white p-2 text-gray-700 md:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  );
}
