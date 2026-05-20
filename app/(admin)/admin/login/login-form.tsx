'use client';

import { useRouter } from 'next/navigation';
import { useId, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/components/ui/field-error';
import { signInAction } from '@/lib/auth/actions';
import { signInSchema, type SignInValues } from '@/lib/validation/auth';

export function AdminLoginForm() {
  const emailId = useId();
  const passwordId = useId();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
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
      router.replace('/admin/dashboard');
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-(--fg-default) lg:text-3xl">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Welcome back. Enter your credentials to continue.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={emailId}>Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            id={emailId}
            type="email"
            autoComplete="email"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? `${emailId}-error` : undefined}
            disabled={isPending}
            className="pl-10"
            placeholder="you@example.com"
            {...register('email')}
          />
        </div>
        <FieldError id={`${emailId}-error`}>{errors.email?.message}</FieldError>
      </div>

      <div className="space-y-2">
        <Label htmlFor={passwordId}>Password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            id={passwordId}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? `${passwordId}-error` : undefined}
            disabled={isPending}
            className="pl-10 pr-10"
            placeholder="Enter your password"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <FieldError id={`${passwordId}-error`}>
          {errors.password?.message}
        </FieldError>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-[#dc2626] accent-[#dc2626] focus:ring-[#dc2626]"
          />
          Remember me
        </label>
        <Link
          href="/forgot-password"
          className="text-sm font-medium text-[#dc2626] hover:text-[#c1121f]"
        >
          Forgot password?
        </Link>
      </div>

      {serverError ? (
        <p role="alert" className="text-sm text-(--color-signal-red)">
          {serverError}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className={cn(
          buttonVariants({ variant: 'primary', size: 'lg' }),
          'w-full bg-[#dc2626] text-white hover:bg-[#c1121f]',
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in…
          </>
        ) : (
          'Sign in'
        )}
      </button>
    </form>
  );
}
