import type { Metadata } from 'next';
import { AlertTriangle } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/session';
import { getAuthCookies } from '@/lib/auth/cookies';
import { listTags } from '@/lib/db/tags';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { TagManager } from './_components/tag-manager';

export const metadata: Metadata = {
  title: 'Tags — Admin',
};

export default async function AdminTagsPage() {
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

  const result = await listTags(accessToken);
  const tags = result.status === 'ok' ? result.data : [];

  return <TagManager tags={tags} />;
}
