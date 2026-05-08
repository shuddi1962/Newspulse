'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';

export function LiveSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<
    { id: string; title: string; slug: string; category?: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.articles ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = (slug: string) => {
    setOpen(false);
    setQuery('');
    router.push(`/article/${slug}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md p-2 text-(--fg-muted) transition-colors hover:bg-(--bg-muted) hover:text-(--fg-default)"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-24 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-(--border-default) bg-(--bg-base) shadow-2xl">
            <form onSubmit={handleSubmit} className="flex items-center gap-3 border-b border-(--border-subtle) px-5 py-4">
              <Search className="h-5 w-5 shrink-0 text-(--fg-muted)" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles..."
                className="flex-1 bg-transparent text-lg text-(--fg-default) outline-none placeholder:text-(--fg-subtle)"
              />
              {loading && <Loader2 className="h-5 w-5 animate-spin text-(--fg-muted)" />}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-(--fg-muted) hover:bg-(--bg-muted)"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </form>
            {results.length > 0 && (
              <div className="max-h-80 overflow-y-auto p-2">
                {results.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.slug)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-(--bg-muted)"
                  >
                    <Search className="h-4 w-4 shrink-0 text-(--fg-subtle)" />
                    <div>
                      <p className="text-sm font-medium text-(--fg-default)">{item.title}</p>
                      {item.category && (
                        <p className="text-xs text-(--fg-subtle)">{item.category}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {query.trim() && !loading && results.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-(--fg-subtle)">
                No articles found for &quot;{query}&quot;
              </div>
            )}
            {!query.trim() && (
              <div className="px-5 py-8 text-center text-sm text-(--fg-subtle)">
                Type to search articles...
              </div>
            )}
            {query.trim() && (
              <div className="border-t border-(--border-subtle) px-5 py-3">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="text-sm font-medium text-(--color-ocean-blue) hover:underline"
                >
                  View all results for &quot;{query}&quot;
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
