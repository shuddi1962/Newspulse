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
import {
  resendVerificationAction,
  signUpAction,
  verifyEmailAction,
} from '@/lib/auth/actions';
import {
  signUpSchema,
  verifyEmailSchema,
  type SignUpValues,
  type VerifyEmailValues,
} from '@/lib/validation/auth';

type Stage =
  | { kind: 'details' }
  | { kind: 'verify-code'; email: string }
  | { kind: 'verify-link'; email: string };

function SignUpDetailsForm({
  onVerify,
  onSignedIn,
}: {
  onVerify: (email: string, method: 'code' | 'link') => void;
  onSignedIn: () => void;
}) {
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = (values: SignUpValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await signUpAction(values);
      if (result.status === 'error') {
        setServerError(result.message);
        toast.error(result.message);
        return;
      }
      if (result.data?.kind === 'verify') {
        toast.success('Check your email for your verification code.');
        onVerify(result.data.email, result.data.method);
        return;
      }
      toast.success('Welcome to NewsPulse PRO.');
      onSignedIn();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label htmlFor={nameId}>Full name</Label>
        <Input
          id={nameId}
          autoComplete="name"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
          disabled={isPending}
          {...register('name')}
        />
        <FieldError id={`${nameId}-error`}>{errors.name?.message}</FieldError>
      </div>

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
          autoComplete="new-password"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? `${passwordId}-error` : undefined}
          disabled={isPending}
          {...register('password')}
        />
        <FieldError id={`${passwordId}-error`}>{errors.password?.message}</FieldError>
        <p className="text-xs text-(--fg-subtle)">At least 8 characters.</p>
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
            Creating account…
          </>
        ) : (
          'Create account'
        )}
      </Button>
    </form>
  );
}

function VerifyCodeForm({ email, onVerified }: { email: string; onVerified: () => void }) {
  const codeId = useId();
  const [isPending, startTransition] = useTransition();
  const [isResending, startResend] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email, code: '' },
  });

  const onSubmit = (values: VerifyEmailValues) => {
    setServerError(null);
    startTransition(async () => {
      const result = await verifyEmailAction(values);
      if (result.status === 'error') {
        setServerError(result.message);
        toast.error(result.message);
        return;
      }
      toast.success('Email verified. You are signed in.');
      onVerified();
    });
  };

  const onResend = () => {
    startResend(async () => {
      const result = await resendVerificationAction(email);
      if (result.status === 'error') {
        toast.error(result.message);
        return;
      }
      toast.success('Verification code resent.');
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <input type="hidden" {...register('email')} value={email} readOnly />

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
        <p className="text-xs text-(--fg-subtle)">
          We sent a code to <span className="text-(--fg-default)">{email}</span>.
        </p>
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
            Verifying…
          </>
        ) : (
          'Verify email'
        )}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={onResend}
        disabled={isResending}
      >
        {isResending ? 'Sending…' : "Didn't get a code? Resend"}
      </Button>
    </form>
  );
}

function VerifyLinkNotice({ email }: { email: string }) {
  return (
    <div className="space-y-4 border border-(--border-subtle) bg-(--bg-surface) p-6 text-sm text-(--fg-muted)">
      <p className="text-(--fg-default)">Check your email.</p>
      <p>
        We sent a verification link to{' '}
        <span className="text-(--fg-default)">{email}</span>. Click it, then come
        back to sign in.
      </p>
    </div>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>({ kind: 'details' });

  const goToAdmin = () => {
    router.replace('/admin');
    router.refresh();
  };

  if (stage.kind === 'verify-code') {
    return <VerifyCodeForm email={stage.email} onVerified={goToAdmin} />;
  }

  if (stage.kind === 'verify-link') {
    return <VerifyLinkNotice email={stage.email} />;
  }

  return (
    <SignUpDetailsForm
      onSignedIn={goToAdmin}
      onVerify={(email, method) =>
        setStage(
          method === 'code'
            ? { kind: 'verify-code', email }
            : { kind: 'verify-link', email },
        )
      }
    />
  );
}
