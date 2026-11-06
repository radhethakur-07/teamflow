import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, ShieldCheck, Activity, LogOut, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Avatar from '../common/Avatar.jsx';
import Badge from '../common/Badge.jsx';

export const ProfileDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { currentUser, workspace } = useApp();

  if (!isOpen) return null;

  const handleLogout = () => {
    toast.info('Simulated logout. Redirecting to login page...');
    onClose();
    setTimeout(() => {
      navigate('/login');
    }, 600);
  };

  return (
    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-warm-lg border border-warm-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
      {/* Profile Header */}
      <div className="p-4 border-b border-warm-200 bg-warm-50/50 flex items-center gap-3">
        <Avatar
          src={currentUser.avatar}
          name={currentUser.name}
          size="md"
          status="online"
        />
        <div className="overflow-hidden">
          <p className="text-xs font-heading font-bold text-warm-900 truncate">
            {currentUser.name}
          </p>
          <p className="text-[11px] text-warm-500 truncate">{currentUser.email}</p>
          <Badge variant="terracotta" size="sm" className="mt-1">
            {currentUser.roleTitle}
          </Badge>
        </div>
      </div>

      {/* Links */}
      <div className="p-1.5 space-y-0.5 text-xs text-warm-700">
        <Link
          to="/settings/profile"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-warm-100 transition-colors"
        >
          <User className="w-4 h-4 text-warm-400" />
          <span>Profile Settings</span>
        </Link>

        <Link
          to="/settings/workspace"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-warm-100 transition-colors"
        >
          <Settings className="w-4 h-4 text-warm-400" />
          <span>Workspace Settings</span>
        </Link>

        <Link
          to="/status"
          onClick={onClose}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-warm-100 transition-colors"
        >
          <Activity className="w-4 h-4 text-sage-500" />
          <span>Infrastructure Status</span>
        </Link>
      </div>

      {/* Logout */}
      <div className="p-1.5 border-t border-warm-200">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-terracotta-600 hover:bg-terracotta-50 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
