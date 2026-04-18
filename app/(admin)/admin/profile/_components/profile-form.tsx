'use client';

import { useId, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FieldError } from '@/components/ui/field-error';
import { updateProfileAction } from '@/lib/auth/profile-actions';
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from '@/lib/validation/profile';
import type { Profile } from '@/lib/db/types';

interface ProfileFormProps {
  profile: Profile;
}

function toFormValues(profile: Profile): UpdateProfileInput {
  return {
    display_name: profile.display_name,
    username: profile.username ?? '',
    bio: profile.bio ?? '',
    website_url: profile.website_url ?? '',
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const nameId = useId();
  const userId = useId();
  const bioId = useId();
  const siteId = useId();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: toFormValues(profile),
  });

  const onSubmit = (values: UpdateProfileInput) => {
    setServerError(null);
    startTransition(async () => {
      const result = await updateProfileAction(values);
      if (result.status === 'error') {
        setServerError(result.message);
        toast.error(result.message);
        return;
      }
      if (result.data) {
        reset(toFormValues(result.data));
      }
      toast.success('Profile saved.');
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={nameId}>Display name</Label>
          <Input
            id={nameId}
            autoComplete="name"
            aria-invalid={errors.display_name ? true : undefined}
            aria-describedby={errors.display_name ? `${nameId}-error` : undefined}
            disabled={isPending}
            {...register('display_name')}
          />
          <FieldError id={`${nameId}-error`}>{errors.display_name?.message}</FieldError>
        </div>

        <div className="space-y-2">
          <Label htmlFor={userId}>Username</Label>
          <Input
            id={userId}
            autoComplete="username"
            placeholder="jane_doe"
            aria-invalid={errors.username ? true : undefined}
            aria-describedby={errors.username ? `${userId}-error` : undefined}
            disabled={isPending}
            {...register('username')}
          />
          <FieldError id={`${userId}-error`}>{errors.username?.message}</FieldError>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={siteId}>Website</Label>
        <Input
          id={siteId}
          type="url"
          autoComplete="url"
          placeholder="https://example.com"
          aria-invalid={errors.website_url ? true : undefined}
          aria-describedby={errors.website_url ? `${siteId}-error` : undefined}
          disabled={isPending}
          {...register('website_url')}
        />
        <FieldError id={`${siteId}-error`}>{errors.website_url?.message}</FieldError>
      </div>

      <div className="space-y-2">
        <Label htmlFor={bioId}>Bio</Label>
        <Textarea
          id={bioId}
          rows={4}
          placeholder="A short introduction shown on your public profile."
          aria-invalid={errors.bio ? true : undefined}
          aria-describedby={errors.bio ? `${bioId}-error` : undefined}
          disabled={isPending}
          {...register('bio')}
        />
        <FieldError id={`${bioId}-error`}>{errors.bio?.message}</FieldError>
      </div>

      {serverError ? (
        <p role="alert" className="text-sm text-(--color-signal-red)">
          {serverError}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending || !isDirty}>
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Save profile'
          )}
        </Button>
        {isDirty ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => reset(toFormValues(profile))}
            disabled={isPending}
          >
            Discard
          </Button>
        ) : null}
      </div>
    </form>
  );
}
