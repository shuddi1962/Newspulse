'use client';

import { useState, useTransition } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { LOCALES, type Locale, LOCALE_COOKIE } from '@/lib/i18n';

type Props = {
  currentLocale: Locale;
};

export function LocaleSelector({ currentLocale }: Props) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  function selectLocale(code: Locale) {
    startTransition(() => {
      document.cookie = `${LOCALE_COOKIE}=${code};path=/;max-age=31536000`;
      window.location.reload();
    });
  }

  const current = LOCALES.find((l) => l.code === currentLocale);
  if (!current) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-(--fg-muted) transition-colors hover:text-(--fg-default)"
        aria-label="Change language"
        aria-expanded={open}
      >
        <Globe className="h-4 w-4" aria-hidden />
        <span className="hidden text-xs font-medium sm:inline">{current.nativeName}</span>
        <ChevronDown className="h-3 w-3" aria-hidden />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 z-50 mt-2 w-44 rounded-lg border border-(--border-subtle) bg-(--bg-surface) p-1 shadow-lg">
            {LOCALES.map((locale) => (
              <button
                key={locale.code}
                type="button"
                onClick={() => {
                  setOpen(false);
                  selectLocale(locale.code);
                }}
                className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors hover:bg-(--bg-surface-subtle) ${
                  locale.code === currentLocale
                    ? 'font-medium text-(--fg-default)'
                    : 'text-(--fg-muted)'
                }`}
              >
                <span>{locale.nativeName}</span>
                <span className="ml-auto text-xs text-(--fg-subtle)">{locale.code.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
