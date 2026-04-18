'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app/global-error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 1.5rem',
          background: '#fafaf8',
          color: '#0f1419',
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <div style={{ maxWidth: 520, width: '100%' }}>
          <p
            style={{
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: '#6b7280',
              margin: 0,
            }}
          >
            Fatal error
          </p>
          <h1
            style={{
              fontSize: '1.875rem',
              fontWeight: 600,
              letterSpacing: '-0.01em',
              margin: '0.5rem 0 0.75rem',
            }}
          >
            The application crashed
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: 0 }}>
            A low-level error prevented the page from rendering.
            {error.digest ? ` Reference: ${error.digest}.` : ''}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '1.25rem',
              background: '#0f1419',
              color: '#fafaf8',
              border: 'none',
              padding: '0.625rem 1rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
