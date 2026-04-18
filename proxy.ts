import { NextResponse, type NextRequest } from 'next/server';

const ACCESS_COOKIE = 'insforge_access_token';
const REFRESH_COOKIE = 'insforge_refresh_token';

const AUTH_ROUTES = new Set(['/login', '/signup', '/forgot-password']);

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasSession =
    req.cookies.has(ACCESS_COOKIE) || req.cookies.has(REFRESH_COOKIE);

  if (pathname.startsWith('/admin') && !hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (AUTH_ROUTES.has(pathname) && hasSession) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/signup', '/forgot-password'],
};
