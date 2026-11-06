import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  ExternalLink, 
  UserPlus, 
  MessageSquare, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import Tabs from '../components/common/Tabs.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

export const NotificationsPage = () => {
  const { notifications, markAllNotificationsRead, markNotificationRead } = useApp();
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'assigned') return n.type === 'ASSIGNED';
    if (activeTab === 'system') return n.type === 'SYSTEM';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ASSIGNED': return CheckCircle2;
      case 'COMMENT': return MessageSquare;
      case 'DUE': return Calendar;
      default: return Bell;
    }
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-warm-900 tracking-tight">
            Notification Center
          </h1>
          <p className="text-xs text-warm-500">
            Real-time mentions, task assignments, and workspace announcements.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={CheckCheck}
            onClick={markAllNotificationsRead}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'all', label: 'All', badge: notifications.length },
          { id: 'unread', label: 'Unread', badge: unreadCount },
          { id: 'assigned', label: 'Assignments' },
          { id: 'system', label: 'System' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pill"
      />

      {/* Notification List */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-warm-sm divide-y divide-warm-100 overflow-hidden">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((n) => {
            const Icon = getTypeIcon(n.type);
            const notifId = n._id || n.id;
            const notifTime = n.time || (n.createdAt ? new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent');

            return (
              <div
                key={notifId}
                onClick={() => markNotificationRead(notifId)}
                className={`p-4 flex items-start gap-3.5 hover:bg-warm-50/70 transition-colors cursor-pointer group ${
                  !n.read ? 'bg-terracotta-50/20' : ''
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                    !n.read
                      ? 'bg-terracotta-100 text-terracotta-600 border-terracotta-200'
                      : 'bg-warm-100 text-warm-600 border-warm-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-heading font-bold text-warm-900">
                      {n.title}
                    </p>
                    <span className="text-[10px] text-warm-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {notifTime}
                    </span>
                  </div>

                  <p className="text-xs text-warm-500 leading-relaxed">
                    {n.message}
                  </p>

                  {n.link && (
                    <div className="pt-1">
                      <Link
                        to={n.link}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-terracotta-600 hover:underline"
                      >
                        <span>View resource</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>

                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-terracotta-500 flex-shrink-0 mt-2" />
                )}
              </div>
            );
          })
        ) : (
          <div className="p-10">
            <EmptyState
              icon={Bell}
              title="No notifications"
              description="You have no notifications in this category."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
