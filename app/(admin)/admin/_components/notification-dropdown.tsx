'use client';

import { Bell } from 'lucide-react';
import { useState } from 'react';

const notifications = [
  { id: 1, text: 'New comment awaiting moderation', time: '5 min ago', read: false },
  { id: 2, text: 'Article "Tech Trends" moved to Review', time: '1 hour ago', read: false },
  { id: 3, text: 'New subscriber: john@example.com', time: '2 hours ago', read: true },
];

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-signal-red text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-200 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`border-b border-gray-100 px-4 py-3 ${
                  notification.read ? 'opacity-60' : ''
                }`}
              >
                <p className="text-sm text-gray-900">{notification.text}</p>
                <p className="mt-1 text-xs text-gray-500">{notification.time}</p>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 text-center">
            <button className="text-sm text-ink-black hover:underline">
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
