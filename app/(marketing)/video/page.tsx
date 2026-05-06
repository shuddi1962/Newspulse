import type { Metadata } from 'next';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { env } from '@/lib/env';
import { listPublishedVideos, formatDuration, type PublicVideo } from '@/lib/db/videos';

export const revalidate = 60;

export function generateMetadata(): Metadata {
  return {
    title: `Video — ${env.NEXT_PUBLIC_SITE_NAME}`,
    description: 'Watch the latest video coverage from our editorial team.',
  };
}

export default async function VideoPage() {
  const res = await listPublishedVideos(30);
  const videos = res.status === 'ok' ? res.data : [];

  return (
    <main className="mx-auto w-full max-w-screen-2xl px-6 py-10">
      <header className="mb-10 border-b border-(--border-subtle) pb-6">
        <nav className="mb-3 text-xs text-(--fg-subtle)" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-(--fg-muted)">
            Home
          </Link>
          <span className="mx-1">/</span>
          <span className="text-(--fg-muted)">Video</span>
        </nav>
        <h1 className="text-3xl font-semibold tracking-tight">Video</h1>
        <p className="mt-1 text-sm text-(--fg-muted)">
          Watch the latest coverage from our editorial team
        </p>
      </header>

      {videos.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <VideoGrid videos={videos} />
        </>
      )}
    </main>
  );
}

function VideoGrid({ videos }: { videos: PublicVideo[] }) {
  const featured = videos.find((v) => v.is_featured);
  const rest = featured ? videos.filter((v) => v.id !== featured.id) : videos;

  return (
    <section aria-label="Videos">
      {featured && (
        <Link
          href={`https://www.youtube.com/watch?v=${extractYouTubeId(featured.video_url) ?? ''}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group mb-10 block"
        >
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-surface-subtle)">
            {featured.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featured.thumbnail_url}
                alt=""
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-(--ink-black)">
                <Play className="h-16 w-16 text-(--pure-white) opacity-60" aria-hidden />
              </div>
            )}
            <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-(--pure-white)/90 transition-transform group-hover:scale-110">
                <Play className="h-7 w-7 text-(--ink-black)" fill="currentColor" aria-hidden />
              </div>
            </div>
            {featured.duration_seconds && (
              <span className="absolute bottom-3 right-3 rounded bg-(--ink-black)/80 px-2 py-0.5 text-xs font-mono text-(--pure-white)">
                {formatDuration(featured.duration_seconds)}
              </span>
            )}
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-(--fg-default) group-hover:underline">
            {featured.title}
          </h2>
          {featured.description && (
            <p className="mt-1 text-sm text-(--fg-muted) line-clamp-2">
              {featured.description}
            </p>
          )}
          <MetaRow video={featured} />
        </Link>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>
    </section>
  );
}

function VideoCard({ video }: { video: PublicVideo }) {
  const youtubeId = extractYouTubeId(video.video_url);

  return (
    <Link
      href={youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : video.video_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group"
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-(--border-subtle) bg-(--bg-surface-subtle)">
        {video.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnail_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-(--ink-dark)">
            <Play className="h-10 w-10 text-(--pure-white) opacity-40" aria-hidden />
          </div>
        )}
        <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-black/20" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-(--pure-white)/90">
            <Play className="h-5 w-5 text-(--ink-black)" fill="currentColor" aria-hidden />
          </div>
        </div>
        {video.duration_seconds && (
          <span className="absolute bottom-2 right-2 rounded bg-(--ink-black)/80 px-1.5 py-0.5 text-xs font-mono text-(--pure-white)">
            {formatDuration(video.duration_seconds)}
          </span>
        )}
      </div>
      <h3 className="mt-3 text-base font-semibold leading-snug tracking-tight text-(--fg-default) group-hover:underline">
        {video.title}
      </h3>
      <MetaRow video={video} />
    </Link>
  );
}

function MetaRow({ video }: { video: PublicVideo }) {
  const date = new Date(video.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return (
    <div className="mt-2 flex items-center gap-2 text-xs text-(--fg-subtle)">
      {video.category_name && (
        <span className="font-mono uppercase tracking-wider">{video.category_name}</span>
      )}
      <span aria-hidden>&middot;</span>
      <time dateTime={video.created_at}>{date}</time>
      {video.view_count > 0 && (
        <>
          <span aria-hidden>&middot;</span>
          <span>{video.view_count.toLocaleString()} views</span>
        </>
      )}
    </div>
  );
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match?.[1] ?? null;
}

function EmptyState() {
  return (
    <section className="py-20 text-center">
      <Play className="mx-auto h-12 w-12 text-(--fg-subtle)" strokeWidth={1} aria-hidden />
      <h2 className="mt-4 text-xl font-semibold text-(--fg-default)">
        No videos yet
      </h2>
      <p className="mt-2 text-sm text-(--fg-muted)">
        Our video team is preparing the first stories. Check back soon.
      </p>
      <Link
        href="/"
        className="mt-4 inline-block text-sm text-(--ocean-blue) underline underline-offset-2 hover:text-(--fg-default)"
      >
        Return to homepage
      </Link>
    </section>
  );
}
