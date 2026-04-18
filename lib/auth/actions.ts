'use server';

import { createServerInsForge } from '@/lib/insforge/server';
import { clearAuthCookies, setAuthCookies } from '@/lib/auth/cookies';
import { env } from '@/lib/env';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  verifyEmailSchema,
} from '@/lib/validation/auth';

export type ActionResult<T = undefined> =
  | { status: 'ok'; data?: T }
  | { status: 'error'; message: string };

export type SignUpResult = ActionResult<
  | { kind: 'verify'; email: string; method: 'code' | 'link' }
  | { kind: 'signed_in' }
>;

export async function signUpAction(
  input: unknown,
): Promise<SignUpResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Invalid form values.' };
  }

  const insforge = createServerInsForge();
  const redirectTo = new URL('/login', env.NEXT_PUBLIC_SITE_URL).toString();
  const { data, error } = await insforge.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    name: parsed.data.name,
    redirectTo,
  });

  if (error) {
    return { status: 'error', message: error.message ?? 'Could not create your account.' };
  }

  if (data?.requireEmailVerification) {
    const config = await insforge.auth.getPublicAuthConfig();
    const method: 'code' | 'link' = config.data?.verifyEmailMethod ?? 'code';
    return { status: 'ok', data: { kind: 'verify', email: parsed.data.email, method } };
  }

  if (data?.accessToken && data?.refreshToken) {
    await setAuthCookies(data.accessToken, data.refreshToken);
    return { status: 'ok', data: { kind: 'signed_in' } };
  }

  return { status: 'error', message: 'Unexpected signup response. Please try again.' };
}

export async function verifyEmailAction(input: unknown): Promise<ActionResult> {
  const parsed = verifyEmailSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Invalid code.' };
  }

  const insforge = createServerInsForge();
  const { data, error } = await insforge.auth.verifyEmail({
    email: parsed.data.email,
    otp: parsed.data.code,
  });

  if (error) {
    return { status: 'error', message: error.message ?? 'Invalid or expired code.' };
  }

  if (data?.accessToken && data?.refreshToken) {
    await setAuthCookies(data.accessToken, data.refreshToken);
  }

  return { status: 'ok' };
}

export async function resendVerificationAction(email: string): Promise<ActionResult> {
  const insforge = createServerInsForge();
  const redirectTo = new URL('/login', env.NEXT_PUBLIC_SITE_URL).toString();
  const { error } = await insforge.auth.resendVerificationEmail({ email, redirectTo });
  if (error) {
    return { status: 'error', message: error.message ?? 'Could not resend the code.' };
  }
  return { status: 'ok' };
}

export async function signInAction(input: unknown): Promise<ActionResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Invalid credentials.' };
  }

  const insforge = createServerInsForge();
  const { data, error } = await insforge.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (error.statusCode === 403) {
      return { status: 'error', message: 'Please verify your email before signing in.' };
    }
    return { status: 'error', message: error.message ?? 'Sign in failed.' };
  }

  if (!data?.accessToken || !data?.refreshToken) {
    return { status: 'error', message: 'Sign in failed. Please try again.' };
  }

  await setAuthCookies(data.accessToken, data.refreshToken);
  return { status: 'ok' };
}

export async function signOutAction(): Promise<ActionResult> {
  const insforge = createServerInsForge();
  const { error } = await insforge.auth.signOut();
  await clearAuthCookies();
  if (error) {
    return { status: 'error', message: error.message ?? 'Could not sign out cleanly.' };
  }
  return { status: 'ok' };
}

export async function forgotPasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Invalid email.' };
  }

  const insforge = createServerInsForge();
  const redirectTo = new URL('/reset-password', env.NEXT_PUBLIC_SITE_URL).toString();
  const { error } = await insforge.auth.sendResetPasswordEmail({
    email: parsed.data.email,
    redirectTo,
  });

  if (error) {
    return { status: 'error', message: error.message ?? 'Could not send the reset email.' };
  }
  return { status: 'ok' };
}

export async function resetPasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { status: 'error', message: parsed.error.issues[0]?.message ?? 'Check the form and try again.' };
  }

  const insforge = createServerInsForge();
  const exchange = await insforge.auth.exchangeResetPasswordToken({
    email: parsed.data.email,
    code: parsed.data.code,
  });

  if (exchange.error || !exchange.data?.token) {
    return {
      status: 'error',
      message: exchange.error?.message ?? 'Invalid or expired code.',
    };
  }

  const { error } = await insforge.auth.resetPassword({
    newPassword: parsed.data.password,
    otp: exchange.data.token,
  });

  if (error) {
    return { status: 'error', message: error.message ?? 'Could not reset your password.' };
  }
  return { status: 'ok' };
}
