import 'server-only';
import { cookies, headers } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, type Locale } from '@/lib/i18n';

export async function detectLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const stored = cookieStore.get(LOCALE_COOKIE)?.value;
  if (stored && LOCALES.some((l) => l.code === stored)) return stored as Locale;

  const headersList = await headers();
  const acceptLang = headersList.get('accept-language') ?? '';
  const first = acceptLang.split(',')[0]?.split('-')[0]?.toLowerCase();
  if (first && LOCALES.some((l) => l.code === first)) return first as Locale;

  return DEFAULT_LOCALE;
}
