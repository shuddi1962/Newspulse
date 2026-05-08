'use client';

import { useState } from 'react';

export default function ContactPageSetup() {
  const [info, setInfo] = useState({
    address: '123 News Street, Media City', phone: '+1 (555) 123-4567',
    email: 'contact@newspulse.com', hours: 'Mon-Fri 9:00 AM - 6:00 PM',
    mapApiKey: '', mapLat: '40.7128', mapLng: '-74.0060',
  });

  const [fields, setFields] = useState({ name: true, email: true, subject: true, message: true });

  return (
    <div className="space-y-6">
      <div><p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-(--fg-subtle)">Web Setup</p><h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-(--fg-default)">Contact Page Setup</h1></div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
          <h3 className="mb-4 font-display text-lg font-semibold">Contact Information</h3>
          <div className="space-y-3">
            <div><label className="block text-sm font-medium text-gray-700">Address</label><input value={info.address} onChange={(e) => setInfo({...info, address: e.target.value})} className="field-input mt-1" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Phone</label><input value={info.phone} onChange={(e) => setInfo({...info, phone: e.target.value})} className="field-input mt-1" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Email</label><input value={info.email} onChange={(e) => setInfo({...info, email: e.target.value})} className="field-input mt-1" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Business Hours</label><input value={info.hours} onChange={(e) => setInfo({...info, hours: e.target.value})} className="field-input mt-1" /></div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
            <h3 className="mb-4 font-display text-lg font-semibold">Form Fields</h3>
            {Object.entries(fields).map(([key, val]) => (
              <label key={key} className="flex items-center gap-2 text-sm capitalize"><input type="checkbox" checked={val} onChange={() => setFields({...fields, [key]: !val})} className="rounded border-gray-300" /> Show {key} field</label>
            ))}
          </div>

          <div className="rounded-lg border border-(--border-default) bg-(--bg-surface) p-5">
            <h3 className="mb-4 font-display text-lg font-semibold">Google Maps</h3>
            <div className="space-y-3">
              <div><label className="block text-sm font-medium text-gray-700">API Key</label><input value={info.mapApiKey} onChange={(e) => setInfo({...info, mapApiKey: e.target.value})} className="field-input mt-1" placeholder="Enter Google Maps API key" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-gray-700">Latitude</label><input value={info.mapLat} onChange={(e) => setInfo({...info, mapLat: e.target.value})} className="field-input mt-1" /></div>
                <div><label className="block text-sm font-medium text-gray-700">Longitude</label><input value={info.mapLng} onChange={(e) => setInfo({...info, mapLng: e.target.value})} className="field-input mt-1" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button className="rounded-lg bg-(--color-ink-black) px-4 py-2 text-sm text-white hover:bg-(--color-ink-dark)">Save Settings</button>
    </div>
  );
}
