import { requireAdmin } from '@/lib/auth/session';
import { getAuthCookies } from '@/lib/auth/cookies';
import { listArticlesForAdmin } from '@/lib/db/articles';
import Link from 'next/link';

export const metadata = {
  title: 'Scheduled Posts — NewsPulse PRO',
};

export default async function SchedulePage() {
  await requireAdmin();
  const { accessToken } = await getAuthCookies();

  const result = accessToken
    ? await listArticlesForAdmin(accessToken)
    : { status: 'error' as const, message: 'No session' };

  const allArticles = result.status === 'ok' ? result.data : [];
  const scheduled = allArticles.filter((a) => a.status === 'scheduled');

  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-gray-500">
          Content
        </p>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-gray-900">
          Scheduled Posts
        </h1>
      </div>

      {scheduled.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <p className="text-gray-500">No scheduled posts.</p>
          <Link
            href="/admin/content/articles/new"
            className="mt-4 inline-block text-sm text-ink-black underline"
          >
            Create an article and schedule it
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Title
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Publish At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {scheduled.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {article.title}
                  </td>

                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {article.publish_at
                      ? new Date(article.publish_at).toLocaleString()
                      : '—'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right">
                    <Link
                      href={`/admin/content/articles/${article.id}/edit`}
                      className="text-sm text-ink-black hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
