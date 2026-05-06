'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { deletePage } from '../actions';
import { Trash2 } from 'lucide-react';

export function DeletePageButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [, formAction, pending] = useActionState(
    async () => {
      await deletePage(id);
      router.refresh();
    },
    {}
  );

  return (
    <form action={formAction}>
      <button
        type="submit"
        disabled={pending}
        onClick={(e) => {
          if (!confirm(`Delete "${title}"? This cannot be undone.`)) {
            e.preventDefault();
          }
        }}
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-red-600 hover:bg-red-50"
      >
        <Trash2 className="h-3 w-3" />
        Delete
      </button>
    </form>
  );
}
