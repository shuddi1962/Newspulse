'use client';

import dynamic from 'next/dynamic';

const ServiceWorkerRegistration = dynamic(
  () => import('@/components/service-worker').then((mod) => mod.ServiceWorkerRegistration),
  { ssr: false }
);

const CookieConsent = dynamic(
  () => import('@/components/cookie-consent').then((mod) => mod.CookieConsent),
  { ssr: false }
);

export default function ClientProviders() {
  return (
    <>
      <ServiceWorkerRegistration />
      <CookieConsent />
    </>
  );
}
