'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { updateSettings } from '../actions';

const initialState: { error?: string; success?: boolean } = {};

export default function SettingsForm({ settings }: { settings?: Record<string, unknown> }) {
  const router = useRouter();
  const [, formAction, pending] = useActionState(
    async (_prevState: typeof initialState, formData: FormData) => {
      try {
        await updateSettings('general', {
          siteName: formData.get('site_name'),
          tagline: formData.get('tagline'),
          timezone: formData.get('timezone'),
        });
        router.refresh();
        return { success: true };
      } catch {
        return { error: 'Failed to save settings' };
      }
    },
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="site_name" className="block text-sm font-medium text-gray-700">
          Site Name
        </label>
        <input
          id="site_name"
          name="site_name"
          type="text"
          defaultValue={settings?.siteName as string || 'NewsPulse PRO'}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ink-black focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="tagline" className="block text-sm font-medium text-gray-700">
          Tagline
        </label>
        <input
          id="tagline"
          name="tagline"
          type="text"
          defaultValue={settings?.tagline as string || 'Editorial authority for the modern web'}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ink-black focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
          Timezone
        </label>
        <select
          id="timezone"
          name="timezone"
          defaultValue={settings?.timezone as string || 'America/New_York'}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ink-black focus:outline-none"
        >
          <option value="America/New_York">Eastern (UTC-5)</option>
          <option value="America/Chicago">Central (UTC-6)</option>
          <option value="America/Denver">Mountain (UTC-7)</option>
          <option value="America/Los_Angeles">Pacific (UTC-8)</option>
          <option value="UTC">UTC</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-ink-black px-4 py-2 text-sm font-medium text-white hover:bg-ink-black/90 disabled:opacity-50"
      >
        {pending ? 'Saving...' : 'Save Settings'}
      </button>
    </form>
  );
}
