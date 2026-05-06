import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SEO Settings — NewsPulse PRO',
};

export default function SEOSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-gray-900">SEO Settings</h2>
        <p className="text-sm text-gray-500">Optimize your site for search engines.</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Meta Title</label>
            <input
              type="text"
              defaultValue="NewsPulse PRO — Editorial Authority"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ink-black focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Meta Description</label>
            <textarea
              rows={3}
              defaultValue="NewsPulse PRO delivers editorial authority with modern web technology."
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ink-black focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Google Analytics ID</label>
            <input
              type="text"
              placeholder="G-XXXXXXXXXX"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ink-black focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-ink-black px-4 py-2 text-sm font-medium text-white hover:bg-ink-black/90"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
}
