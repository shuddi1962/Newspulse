import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Settings — Admin',
};

export default function SettingsPage() {
  redirect('/admin/settings/theme');
}
