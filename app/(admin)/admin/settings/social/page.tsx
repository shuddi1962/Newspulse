import type { Metadata } from 'next';
import { Globe, Share2, MessageCircle, Play } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Social Media — NewsPulse PRO',
};

export default function SocialSettingsPage() {
  const platforms = [
    { name: 'Facebook', icon: Globe, placeholder: 'https://facebook.com/...' },
    { name: 'X (Twitter)', icon: Share2, placeholder: 'https://x.com/...' },
    { name: 'Instagram', icon: MessageCircle, placeholder: 'https://instagram.com/...' },
    { name: 'YouTube', icon: Play, placeholder: 'https://youtube.com/...' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-gray-900">Social Media</h2>
        <p className="text-sm text-gray-500">Connect your social media accounts.</p>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="space-y-4">
          {platforms.map((platform) => (
            <div key={platform.name} className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                <platform.icon className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700">{platform.name}</label>
                <input
                  type="url"
                  placeholder={platform.placeholder}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-ink-black focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-6 rounded-lg bg-ink-black px-4 py-2 text-sm font-medium text-white hover:bg-ink-black/90"
        >
          Save Links
        </button>
      </div>
    </div>
  );
}
