import type { Metadata } from 'next';
import { MenuManager } from './menu-manager';

export const metadata: Metadata = {
  title: 'Menu Manager — Admin',
};

export default function AdminMenuPage() {
  return <MenuManager />;
}
