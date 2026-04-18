import 'server-only';
import { cache } from 'react';
import { createServerInsForge } from '@/lib/insforge/server';
import {
  clearAuthCookies,
  getAuthCookies,
  setAuthCookies,
} from '@/lib/auth/cookies';

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  role?: string | null;
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

async function fetchUser(accessToken: string): Promise<AuthUser | null> {
  const insforge = createServerInsForge(accessToken);
  const { data, error } = await insforge.auth.getCurrentUser();
  if (error || !data?.user) return null;
  const user = data.user as AuthUser;
  return user;
}

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const { accessToken, refreshToken } = await getAuthCookies();

  if (accessToken) {
    const user = await fetchUser(accessToken);
    if (user) return user;
  }

  if (refreshToken) {
    const refreshed = await tryRefresh(refreshToken);
    if (refreshed) {
      const user = await fetchUser(refreshed);
      if (user) return user;
    }
  }

  if (accessToken || refreshToken) {
    await clearAuthCookies();
  }
  return null;
});
