import { format as dateFnsFormat } from 'date-fns';
import type { Locale } from '@/lib/i18n';
import { getLocale } from '@/lib/i18n';

export function formatDate(date: Date | string, locale: Locale = 'en'): string {
  const lc = getLocale(typeof locale === 'string' ? locale : undefined);
  const d = typeof date === 'string' ? new Date(date) : date;
  return dateFnsFormat(d, lc.dateFormat);
}
