import 'server-only';
import { cache } from 'react';
import { createServerInsForge } from '@/lib/insforge/server';
import {
  clearAuthCookies,
  getAuthCookies,
  setAuthCookies,
} from '@/lib/auth/cookies';
import { getProfileById } from '@/lib/db/profiles';
import type { Profile, UserRole } from '@/lib/db/types';

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  profile: Profile | null;
};

type RawUser = {
  id: string;
  email: string;
  name?: string | null;
};

async function tryRefresh(refreshToken: string): Promise<string | null> {
  const insforge = createServerInsForge();
  const { data, error } = await insforge.auth.refreshSession({ refreshToken });
  if (error || !data?.accessToken || !data?.refreshToken) {
    return null;
  }
  await setAuthCookies(data.accessToken, data.refreshToken);
  return data.accessToken;
}

async function fetchRawUser(accessToken: string): Promise<RawUser | null> {
  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.auth.getCurrentUser();
  if (error || !data?.user) return null;
  return data.user as RawUser;
}

async function assemble(
  raw: RawUser,
  accessToken: string,
): Promise<AuthUser> {
  const profile = await getProfileById(raw.id, accessToken);
  return {
    id: raw.id,
    email: raw.email,
    name: profile?.display_name ?? raw.name ?? null,
    role: profile?.role ?? 'reader',
    profile,
  };
}

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const { accessToken, refreshToken } = await getAuthCookies();

  if (accessToken) {
    const raw = await fetchRawUser(accessToken);
    if (raw) return assemble(raw, accessToken);
  }

  if (refreshToken) {
    const refreshed = await tryRefresh(refreshToken);
    if (refreshed) {
      const raw = await fetchRawUser(refreshed);
      if (raw) return assemble(raw, refreshed);
    }
  }

  if (accessToken || refreshToken) {
    await clearAuthCookies();
  }
  return null;
});

export function hasRole(user: AuthUser | null, ...roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, 'admin');
}
