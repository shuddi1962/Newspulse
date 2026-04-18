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
import { forgotPasswordAction } from '@/lib/auth/actions';
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from '@/lib/validation/auth';

export function ForgotPasswordForm() {
  const emailId = useId();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (values: ForgotPasswordValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await forgotPasswordAction(values);
      if (result.status === 'error') {
        setServerError(result.message);
        toast.error(result.message);
        return;
      }
      toast.success('Check your email for a reset code.');
      router.push(
        `/reset-password?email=${encodeURIComponent(values.email)}`,
      );
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

      {serverError ? (
        <p role="alert" className="text-sm text-(--color-signal-red)">
          {serverError}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending code…
          </>
        ) : (
          'Send reset code'
        )}
      </Button>
    </form>
  );
}
