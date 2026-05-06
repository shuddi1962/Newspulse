'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setVisible(true);
    }
  }, [mounted]);

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem('cookie_consent', 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-(--border-subtle) bg-(--bg-base) p-4 shadow-lg sm:inset-x-4 sm:bottom-4 sm:rounded-lg">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <p className="text-sm text-(--fg-default)">
            We use cookies to enhance your experience, analyze traffic, and serve personalized content.
            By continuing, you consent to our use of cookies.
          </p>
          <p className="mt-1 text-xs text-(--fg-muted)">
            Read our{' '}
            <a href="/pages/privacy" className="text-(--color-ocean-blue) hover:underline">
              Privacy Policy
            </a>{' '}
            for details.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={decline}>
            Decline
          </Button>
          <Button variant="primary" size="sm" onClick={accept}>
            Accept all
          </Button>
        </div>
        <button
          type="button"
          onClick={decline}
          className="absolute right-4 top-4 text-(--fg-muted) hover:text-(--fg-default)"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
