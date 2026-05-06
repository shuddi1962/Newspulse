import { getSettings, updateSettings } from '@/lib/db/settings';
import SettingsForm from '../_components/settings-form';

export const metadata = {
  title: 'General Settings — NewsPulse PRO',
};

export default async function GeneralSettingsPage() {
  const settings = await getSettings().catch(() => null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-gray-900">General Settings</h2>
        <p className="text-sm text-gray-500">Manage your site’s basic information.</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <SettingsForm settings={settings} />
      </div>
    </div>
  );
}
