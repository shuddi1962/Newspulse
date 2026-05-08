import type { Metadata } from 'next';
import { AlertTriangle } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/session';
import { getAuthCookies } from '@/lib/auth/cookies';
import { listMedia } from '@/lib/db/media';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MediaManager } from './_components/media-manager';

export const metadata: Metadata = {
  title: 'Media — Admin',
};

export default async function AdminMediaPage() {
  await requireAdmin();
  const { accessToken } = await getAuthCookies();

  if (!accessToken) {
    return (
      <Alert variant="destructive" role="alert">
        <AlertTriangle />
        <div className="space-y-1">
          <AlertTitle>Session expired</AlertTitle>
          <AlertDescription>Sign in again to continue.</AlertDescription>
        </div>
      </Alert>
    );
  }

  const result = await listMedia(accessToken, {}, 1, 500);
  const media = result.status === 'ok' ? result.data.rows : [];

  return <MediaManager media={media} />;
}
