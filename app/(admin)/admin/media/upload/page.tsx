'use client';

import { useState, useRef } from 'react';
import { Upload, File, X, Loader2 } from 'lucide-react';

export default function MediaUploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  };

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (i: number) => setFiles(files.filter((_, idx) => idx !== i));

  const uploadAll = () => {
    setUploading(true);
    setTimeout(() => { setUploading(false); setFiles([]); }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Media</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">Upload Media</h1>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-(--border-default) bg-(--bg-surface) py-16 transition-colors hover:border-gray-300 hover:bg-gray-50"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="h-12 w-12 text-gray-300" />
        <p className="mt-4 text-lg font-medium text-gray-700">Drop files here or click to upload</p>
        <p className="mt-1 text-sm text-gray-400">Supports: JPG, PNG, GIF, WebP, SVG, MP4, PDF, DOC</p>
        <input ref={inputRef} type="file" multiple accept="image/*,video/*,.pdf,.doc,.docx" className="hidden" onChange={addFiles} />
      </div>

      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">{files.length} file(s) selected</p>
            <button onClick={uploadAll} disabled={uploading} className="flex items-center gap-2 rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm text-white hover:bg-(--color-ink-dark) disabled:opacity-50">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? 'Uploading...' : 'Upload All'}
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {files.map((file, i) => (
              <div key={i} className="group relative rounded-lg border border-(--border-default) bg-(--bg-surface) p-3">
                <div className="flex h-24 items-center justify-center rounded-md bg-gray-50">
                  {file.type.startsWith('image/') ? (
                    <img src={URL.createObjectURL(file)} alt="" className="h-full w-full rounded-md object-cover" />
                  ) : (
                    <File className="h-8 w-8 text-gray-300" />
                  )}
                </div>
                <p className="mt-2 truncate text-xs text-gray-600">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                <button onClick={() => removeFile(i)} className="absolute right-2 top-2 rounded-full bg-white p-1 text-gray-400 opacity-0 shadow transition-opacity group-hover:opacity-100 hover:text-red-500"><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
