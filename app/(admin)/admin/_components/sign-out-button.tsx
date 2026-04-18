'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOutAction } from '@/lib/auth/actions';

export function SignOutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onClick = () => {
    startTransition(async () => {
      const result = await signOutAction();
      if (result.status === 'error') {
        toast.error(result.message);
        return;
      }
      toast.success('Signed out.');
      router.replace('/login');
      router.refresh();
    });
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      disabled={isPending}
    >
      <LogOut className="h-4 w-4" />
      {isPending ? 'Signing out…' : 'Sign out'}
    </Button>
  );
}
