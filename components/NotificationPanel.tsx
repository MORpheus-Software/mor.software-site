'use client';

import { useState, useEffect } from 'react';
import { NotificationFilled as NotificationsIcon } from '@ant-design/icons';
import { markNotificationsAsRead } from '@/lib/server';

const NotificationPanel: React.FC<any> = ({ uid, initialNotifications }) => {
  const [notifications, setNotifications] = useState(
    Array.isArray(initialNotifications)
      ? initialNotifications
      : Object.values(initialNotifications),
  );
  const [showPanel, setShowPanel] = useState(false);

  // Calculate if there are unread notifications
  const hasUnread = notifications.some((notification) => !notification.isRead);

  // Function to mark all notifications as read
  const markAllAsRead = async () => {
    const updatedNotifications = notifications.map((notification) => ({
      ...notification,
      isRead: true,
    }));

    await markNotificationsAsRead(uid);
    setNotifications(updatedNotifications);
  };

  // Toggle panel visibility and mark notifications as read when opened
  const togglePanel = () => {
    setShowPanel(!showPanel);
    if (!showPanel && hasUnread) {
      markAllAsRead();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={togglePanel}
        className="relative p-2 text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        <NotificationsIcon />
        {hasUnread && (
          <span className="absolute right-0 top-0 block h-2 w-2 rounded-full bg-red-500"></span>
        )}
      </button>
      {showPanel && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Notifications</h2>
          {notifications.length ? (
            <ul>
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-2 ${notification.isRead ? 'text-gray-600' : 'bg-blue-100'}`}
                >
                  <p>{notification.message}</p>
                  <small className="text-sm text-gray-500">
                    Created at: {new Date(notification.createdAt).toLocaleString()}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No notifications available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
