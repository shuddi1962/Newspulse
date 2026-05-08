'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Image,
  Film,
  FileText,
  Upload,
  Trash2,
  Grid3X3,
  List,
  X,
  Download,
  Calendar,

} from 'lucide-react';
import { toast } from 'sonner';
import { DataTable, type ColumnDef } from '@/components/admin/DataTable';
import {
  uploadMediaAction,
  deleteMediaAction,
  updateMediaAltAction,
} from '../actions';
import type { MediaAsset } from '@/lib/db/types';

type MediaFilter = 'all' | 'images' | 'videos' | 'documents';

function getFilterValue(mime: string | null): MediaFilter {
  if (!mime) return 'all';
  if (mime.startsWith('image/')) return 'images';
  if (mime.startsWith('video/')) return 'videos';
  return 'documents';
}

function formatSize(bytes: number | null): string {
  if (!bytes) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function isImage(mime: string | null): boolean {
  return !!mime && mime.startsWith('image/');
}

function isVideo(mime: string | null): boolean {
  return !!mime && mime.startsWith('video/');
}

function isDocument(mime: string | null): boolean {
  return !!mime && !mime.startsWith('image/') && !mime.startsWith('video/');
}

function FileIcon({ mime }: { mime: string | null }) {
  if (isImage(mime)) return <Image className="h-8 w-8 text-blue-500" />;
  if (isVideo(mime)) return <Film className="h-8 w-8 text-purple-500" />;
  return <FileText className="h-8 w-8 text-amber-500" />;
}

interface MediaManagerProps {
  media: MediaAsset[];
}

export function MediaManager({ media }: MediaManagerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<MediaFilter>('all');
  const [uploading, setUploading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [altText, setAltText] = useState('');

  const filtered = useMemo(() => {
    if (filter === 'all') return media;
    return media.filter((a) => getFilterValue(a.mime_type) === filter);
  }, [media, filter]);

  const filterCounts = useMemo(() => {
    const all = media.length;
    const images = media.filter((a) => isImage(a.mime_type)).length;
    const videos = media.filter((a) => isVideo(a.mime_type)).length;
    const documents = media.filter((a) => isDocument(a.mime_type)).length;
    return { all, images, videos, documents };
  }, [media]);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);

      const result = await uploadMediaAction(fd);

      if (fileInputRef.current) fileInputRef.current.value = '';

      setUploading(false);

      if (result.status === 'error') {
        toast.error(result.message);
      } else {
        toast.success('File uploaded.');
        router.refresh();
      }
    },
    [router],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const asset = media.find((a) => a.id === id);
      const confirmed = window.confirm(
        `Delete "${asset?.alt_text || asset?.object_key || id}"? This cannot be undone.`,
      );
      if (!confirmed) return;

      const result = await deleteMediaAction(id);
      if (result.status === 'error') {
        toast.error(result.message);
      } else {
        toast.success('File deleted.');
        if (selectedAsset?.id === id) setSelectedAsset(null);
        router.refresh();
      }
    },
    [media, selectedAsset, router],
  );

  const handleUpdateAlt = useCallback(async () => {
    if (!selectedAsset) return;
    const result = await updateMediaAltAction(selectedAsset.id, altText);
    if (result.status === 'error') {
      toast.error(result.message);
    } else {
      toast.success('Alt text updated.');
      setSelectedAsset((prev) => (prev ? { ...prev, alt_text: altText } : null));
      router.refresh();
    }
  }, [selectedAsset, altText, router]);

  const openDetail = useCallback(
    (asset: MediaAsset) => {
      setSelectedAsset(asset);
      setAltText(asset.alt_text ?? '');
    },
    [],
  );

  const dataWithIndex = useMemo(
    () => filtered.map((a, i) => ({ ...a, _row_num: i + 1 })),
    [filtered],
  );

  const listColumns: ColumnDef<Record<string, unknown>>[] = [
    {
      key: '_row_num',
      header: '#',
      className: 'w-12 text-center text-[var(--color-admin-text-muted)]',
      sortable: false,
    },
    {
      key: 'url',
      header: 'Preview',
      className: 'w-16',
      sortable: false,
      render: (row) => {
        const mime = row.mime_type as string | null;
        const url = row.url as string;
        return (
          <div className="flex h-[45px] w-[60px] items-center justify-center overflow-hidden rounded bg-gray-100">
            {isImage(mime) ? (
              <img src={url} alt="" className="h-full w-full object-cover" />
            ) : (
              <FileIcon mime={mime} />
            )}
          </div>
        );
      },
    },
    {
      key: 'alt_text',
      header: 'Alt text',
      render: (row) => (
        <span className="text-sm text-[var(--color-admin-text)]">
          {(row.alt_text as string) || <span className="italic text-gray-400">No alt text</span>}
        </span>
      ),
    },
    {
      key: 'mime_type',
      header: 'Type',
      render: (row) => (
        <span className="text-sm text-[var(--color-admin-text-muted)]">
          {(row.mime_type as string)?.split('/').pop()?.toUpperCase() ?? '—'}
        </span>
      ),
    },
    {
      key: 'size_bytes',
      header: 'Size',
      render: (row) => (
        <span className="text-sm text-[var(--color-admin-text-muted)]">
          {formatSize(row.size_bytes as number | null)}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Uploaded',
      render: (row) => (
        <span className="text-sm text-[var(--color-admin-text-muted)]">
          {formatDate(row.created_at as string)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'w-24 text-right',
      sortable: false,
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => openDetail(media.find((a) => a.id === (row.id as string))!)}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
            aria-label="View details"
          >
            <Image className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id as string)}
            className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
            aria-label="Delete media"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[var(--color-admin-text)]">
            Media Library
          </h1>
          <p className="mt-1 text-sm text-[var(--color-admin-text-muted)]">
            Upload and manage images, videos, and documents.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,application/pdf"
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload file"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--color-crimson)] px-4 py-2 text-sm font-medium text-white hover:brightness-110 disabled:opacity-60"
          >
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          <div className="flex overflow-hidden rounded-md border border-[var(--color-admin-border)]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-[var(--color-admin-text)]' : 'text-gray-400 hover:bg-gray-50'}`}
              aria-label="Grid view"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-[var(--color-admin-text)]' : 'text-gray-400 hover:bg-gray-50'}`}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="mb-4 flex items-center gap-2">
        {(
          [
            { key: 'all', label: 'All', count: filterCounts.all },
            { key: 'images', label: 'Images', count: filterCounts.images },
            { key: 'videos', label: 'Videos', count: filterCounts.videos },
            { key: 'documents', label: 'Documents', count: filterCounts.documents },
          ] as { key: MediaFilter; label: string; count: number }[]
        ).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-[var(--color-crimson)] text-white'
                : 'bg-gray-100 text-[var(--color-admin-text-muted)] hover:bg-gray-200'
            }`}
          >
            {f.key === 'all' && <FileText className="h-3.5 w-3.5" />}
            {f.key === 'images' && <Image className="h-3.5 w-3.5" />}
            {f.key === 'videos' && <Film className="h-3.5 w-3.5" />}
            {f.key === 'documents' && <FileText className="h-3.5 w-3.5" />}
            {f.label}
            <span className="ml-0.5 text-xs opacity-70">({f.count})</span>
          </button>
        ))}
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((asset) => (
            <button
              key={asset.id}
              onClick={() => openDetail(asset)}
              className={`group relative overflow-hidden rounded-lg border text-left transition-all ${
                selectedAsset?.id === asset.id
                  ? 'border-[var(--color-crimson)] ring-1 ring-[var(--color-crimson)]'
                  : 'border-[var(--color-admin-border)] hover:border-gray-300'
              }`}
            >
              <div className="aspect-square overflow-hidden bg-gray-100">
                {isImage(asset.mime_type) ? (
                  <img
                    src={asset.url}
                    alt={asset.alt_text ?? ''}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <FileIcon mime={asset.mime_type} />
                  </div>
                )}
              </div>
              <div className="border-t border-[var(--color-admin-border)] p-2">
                <p className="truncate text-xs text-[var(--color-admin-text)]">
                  {asset.alt_text || asset.object_key.split('/').pop() || 'Untitled'}
                </p>
                <p className="text-[10px] text-[var(--color-admin-text-muted)]">
                  {formatSize(asset.size_bytes)}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(asset.id);
                }}
                className="absolute right-1.5 top-1.5 rounded bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-sm text-[var(--color-admin-text-muted)]">
              No {filter !== 'all' ? filter : 'media'} found.
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-[var(--color-admin-border)] bg-[var(--color-admin-card)]">
          <div className="p-5 pb-0">
            <p className="text-sm text-[var(--color-admin-text-muted)]">
              {filtered.length} file{filtered.length === 1 ? '' : 's'}
            </p>
          </div>
          <div className="p-5">
            <DataTable
              columns={listColumns}
              data={dataWithIndex as unknown as Record<string, unknown>[]}
              searchable
              pagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              onRowClick={(row) => openDetail(media.find((a) => a.id === (row.id as string))!)}
            />
          </div>
        </div>
      )}

      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-12">
          <div className="relative w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <button
              onClick={() => setSelectedAsset(null)}
              className="absolute right-4 top-4 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close detail panel"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[var(--color-admin-text)]">
                Media details
              </h2>
            </div>

            <div className="mb-6 overflow-hidden rounded-lg bg-gray-100">
              {isImage(selectedAsset.mime_type) ? (
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.alt_text ?? ''}
                  className="max-h-[400px] w-full object-contain"
                />
              ) : (
                <div className="flex h-48 items-center justify-center">
                  <FileIcon mime={selectedAsset.mime_type} />
                </div>
              )}
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-admin-text-muted)]">
                  Type
                </span>
                <p className="mt-0.5 text-[var(--color-admin-text)]">
                  {selectedAsset.mime_type || 'Unknown'}
                </p>
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-admin-text-muted)]">
                  Size
                </span>
                <p className="mt-0.5 text-[var(--color-admin-text)]">
                  {formatSize(selectedAsset.size_bytes)}
                </p>
              </div>
              {selectedAsset.width && selectedAsset.height && (
                <div>
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-admin-text-muted)]">
                    Dimensions
                  </span>
                  <p className="mt-0.5 text-[var(--color-admin-text)]">
                    {selectedAsset.width} &times; {selectedAsset.height}px
                  </p>
                </div>
              )}
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-admin-text-muted)]">
                  <Calendar className="mr-1 inline h-3 w-3" />
                  Uploaded
                </span>
                <p className="mt-0.5 text-[var(--color-admin-text)]">
                  {formatDate(selectedAsset.created_at)}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-[var(--color-admin-text)]">
                Alt text
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe this image..."
                  className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm text-[var(--color-admin-text)] placeholder:text-gray-400 focus:border-[var(--color-crimson)] focus:outline-none"
                />
                <button
                  onClick={handleUpdateAlt}
                  className="rounded-md bg-[var(--color-crimson)] px-4 text-sm font-medium text-white hover:brightness-110"
                >
                  Save
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-[var(--color-admin-border)] pt-4">
              <a
                href={selectedAsset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-[var(--color-admin-text)] hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Open
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedAsset.url);
                  toast.success('URL copied to clipboard.');
                }}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm text-[var(--color-admin-text)] hover:bg-gray-50"
              >
                Copy URL
              </button>
              <button
                onClick={() => handleDelete(selectedAsset.id)}
                className="ml-auto inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
