import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import Badge from '../common/Badge.jsx';

export const NotificationDropdown = ({ isOpen, onClose }) => {
  const { notifications, markAllNotificationsRead, markNotificationRead } = useApp();
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white shadow-warm-lg border border-warm-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-warm-200 bg-warm-50/50">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-sm text-warm-900">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="terracotta" size="sm">
              {unreadCount} new
            </Badge>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="text-xs text-terracotta-600 hover:text-terracotta-700 font-medium flex items-center gap-1 transition-colors"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-warm-100">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`p-3.5 transition-colors cursor-pointer hover:bg-warm-100/60 flex items-start gap-3 ${
                !n.read ? 'bg-terracotta-50/30' : ''
              }`}
            >
              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-terracotta-500 opacity-90" />
              <div className="space-y-1 flex-1">
                <p className="text-xs font-semibold text-warm-900 leading-snug">
                  {n.title}
                </p>
                <p className="text-xs text-warm-500 line-clamp-2 leading-relaxed">
                  {n.message}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[10px] text-warm-400">
                  <Clock className="w-3 h-3" />
                  <span>{n.time}</span>
                  {n.link && (
                    <Link
                      to={n.link}
                      onClick={onClose}
                      className="text-terracotta-600 hover:underline inline-flex items-center gap-0.5 ml-auto font-medium"
                    >
                      <span>View</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-warm-400">
            You're all caught up! No notifications.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-warm-200 bg-warm-50/50 text-center">
        <Link
          to="/notifications"
          onClick={onClose}
          className="text-xs font-semibold text-warm-700 hover:text-terracotta-600 transition-colors"
        >
          View all notifications &rarr;
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
