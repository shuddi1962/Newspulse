'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { updateUserRoleAction } from '@/lib/auth/admin-actions';
import { USER_ROLE_VALUES } from '@/lib/validation/admin';
import type { UserRole } from '@/lib/db/types';

interface RoleSelectProps {
  userId: string;
  current: UserRole;
  label: string;
  disabled?: boolean;
  disabledReason?: string;
}

export function RoleSelect({
  userId,
  current,
  label,
  disabled = false,
  disabledReason,
}: RoleSelectProps) {
  const router = useRouter();
  const [value, setValue] = useState<UserRole>(current);
  const [isPending, startTransition] = useTransition();

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value as UserRole;
    if (next === value) return;

    const previous = value;
    setValue(next);
    startTransition(async () => {
      const result = await updateUserRoleAction({ userId, role: next });
      if (result.status === 'error') {
        setValue(previous);
        toast.error(result.message);
        return;
      }
      toast.success(`Updated ${label} to ${next}.`);
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <select
        aria-label={`Role for ${label}`}
        value={value}
        onChange={onChange}
        disabled={disabled || isPending}
        title={disabled ? disabledReason : undefined}
        className={cn(
          'h-8 border border-(--border-default) bg-(--bg-surface) px-2 text-xs text-(--fg-default)',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-ink-medium) focus-visible:ring-offset-2 focus-visible:ring-offset-(--bg-base)',
          'disabled:cursor-not-allowed disabled:opacity-60',
        )}
      >
        {USER_ROLE_VALUES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-(--fg-muted)" aria-hidden />
      ) : null}
    </div>
  );
}
