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
import { resetPasswordAction } from '@/lib/auth/actions';
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from '@/lib/validation/auth';

interface ResetPasswordFormProps {
  defaultEmail?: string;
}

export function ResetPasswordForm({ defaultEmail = '' }: ResetPasswordFormProps) {
  const emailId = useId();
  const codeId = useId();
  const passwordId = useId();
  const confirmId = useId();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: defaultEmail,
      code: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (values: ResetPasswordValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await resetPasswordAction(values);
      if (result.status === 'error') {
        setServerError(result.message);
        toast.error(result.message);
        return;
      }
      toast.success('Password updated. Please sign in.');
      router.replace('/login');
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
        <Label htmlFor={codeId}>6-digit code</Label>
        <Input
          id={codeId}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          aria-invalid={errors.code ? true : undefined}
          aria-describedby={errors.code ? `${codeId}-error` : undefined}
          disabled={isPending}
          {...register('code')}
        />
        <FieldError id={`${codeId}-error`}>{errors.code?.message}</FieldError>
      </div>

      <div className="space-y-2">
        <Label htmlFor={passwordId}>New password</Label>
        <Input
          id={passwordId}
          type="password"
          autoComplete="new-password"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? `${passwordId}-error` : undefined}
          disabled={isPending}
          {...register('password')}
        />
        <FieldError id={`${passwordId}-error`}>{errors.password?.message}</FieldError>
      </div>

      <div className="space-y-2">
        <Label htmlFor={confirmId}>Confirm new password</Label>
        <Input
          id={confirmId}
          type="password"
          autoComplete="new-password"
          aria-invalid={errors.confirmPassword ? true : undefined}
          aria-describedby={
            errors.confirmPassword ? `${confirmId}-error` : undefined
          }
          disabled={isPending}
          {...register('confirmPassword')}
        />
        <FieldError id={`${confirmId}-error`}>
          {errors.confirmPassword?.message}
        </FieldError>
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
            Updating password…
          </>
        ) : (
          'Update password'
        )}
      </Button>
    </form>
  );
}
