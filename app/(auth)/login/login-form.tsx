'use client';

import { useRouter } from 'next/navigation';
import { useId, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/ui/field-error';
import { signInAction } from '@/lib/auth/actions';
import { signInSchema, type SignInValues } from '@/lib/validation/auth';

interface LoginFormProps {
  redirectPath: string;
}

export function LoginForm({ redirectPath }: LoginFormProps) {
  const emailId = useId();
  const passwordId = useId();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (values: SignInValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await signInAction(values);
      if (result.status === 'error') {
        setServerError(result.message);
        toast.error(result.message);
        return;
      }
      toast.success('Welcome back.');
      router.replace(redirectPath);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor={emailId}>Email</Label>
        <Input
          id={emailId}
          type="email"
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${emailId}-error` : undefined}
          disabled={isPending}
          {...register('email')}
        />
        <FieldError id={`${emailId}-error`}>{errors.email?.message}</FieldError>
      </div>

      <div className="space-y-2">
        <Label htmlFor={passwordId}>Password</Label>
        <Input
          id={passwordId}
          type="password"
          autoComplete="current-password"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? `${passwordId}-error` : undefined}
          disabled={isPending}
          {...register('password')}
        />
        <FieldError id={`${passwordId}-error`}>{errors.password?.message}</FieldError>
      </div>

      {serverError ? (
        <p role="alert" className="text-sm text-(--color-signal-red)">
          {serverError}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in…
          </>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  );
}
