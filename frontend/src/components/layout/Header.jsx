import React, { useState } from 'react';
import { Menu, Search, Bell, Plus, Sparkles, Command } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import Avatar from '../common/Avatar.jsx';
import Button from '../common/Button.jsx';
import NotificationDropdown from './NotificationDropdown.jsx';
import ProfileDropdown from './ProfileDropdown.jsx';

export const Header = ({ onOpenMobileSidebar, onOpenSearch, onOpenNewTask }) => {
  const { notifications, currentUser } = useApp();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 bg-warm-50/90 backdrop-blur-md border-b border-warm-200 px-4 md:px-8 py-3 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Search bar */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-lg text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-colors focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Trigger */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white border border-warm-300 shadow-warm-sm text-warm-400 hover:border-warm-400 hover:text-warm-600 transition-all text-xs w-48 sm:w-64 md:w-80 text-left focus:outline-none focus:ring-2 focus:ring-terracotta-200"
        >
          <Search className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Search tasks, projects...</span>
          <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-warm-100 text-[10px] text-warm-500 font-mono border border-warm-200">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>
      </div>

      {/* Right Actions: Add Task, Notifications & Profile */}
      <div className="flex items-center gap-3">
        <Button
          variant="primary"
          size="sm"
          leftIcon={Plus}
          onClick={onOpenNewTask}
          className="hidden sm:inline-flex"
        >
          New Task
        </Button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsNotifOpen(!isNotifOpen);
              setIsProfileOpen(false);
            }}
            className="p-2 rounded-xl text-warm-600 hover:text-warm-900 hover:bg-warm-100 transition-colors relative focus:outline-none focus:ring-2 focus:ring-terracotta-200"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-terracotta-500 ring-2 ring-white" />
            )}
          </button>

          <NotificationDropdown
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
          />
        </div>

        {/* Profile Avatar Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsNotifOpen(false);
            }}
            className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-terracotta-400 ring-offset-2 ring-offset-warm-50"
            aria-label="User profile menu"
          >
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="sm"
              status="online"
            />
          </button>

          <ProfileDropdown
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
