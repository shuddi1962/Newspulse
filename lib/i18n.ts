export type Locale = 'en' | 'es' | 'fr' | 'ar' | 'sw';

export type LocaleConfig = {
  code: Locale;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
};

export const LOCALES: LocaleConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', dateFormat: 'MMM d, yyyy' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', dateFormat: 'd MMM yyyy' },
  { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', dateFormat: 'd MMM yyyy' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', dateFormat: 'd MMM yyyy' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', direction: 'ltr', dateFormat: 'd MMM yyyy' },
];

export const DEFAULT_LOCALE: Locale = 'en';

export function getLocale(code: string | undefined): LocaleConfig {
  return LOCALES.find((l) => l.code === code) ?? LOCALES.find((l) => l.code === DEFAULT_LOCALE)!;
}

export function getSupportedLocale(acceptLanguage: string | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const preferred = acceptLanguage.split(',').map((lang) => lang.trim().split(';')[0]).filter(Boolean);
  for (const lang of preferred) {
    if (!lang) continue;
    const code = lang.toLowerCase().split('-')[0] as Locale;
    if (LOCALES.some((l) => l.code === code)) return code;
  }
  return DEFAULT_LOCALE;
}

export const LOCALE_COOKIE = 'newspulse_locale';
