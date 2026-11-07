import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, Activity, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import Avatar from '../common/Avatar.jsx';
import Badge from '../common/Badge.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';

export const ProfileDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, logout, currentWorkspace } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  if (!isOpen && !showLogoutConfirm) return null;

  const displayName = user?.name || 'Workspace Member';
  const displayEmail = user?.email || 'user@teamflow.app';
  const displayRole = currentWorkspace?.name || 'Owner';

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Signed out successfully.');
      setShowLogoutConfirm(false);
      onClose();
      navigate('/login');
    } catch (err) {
      toast.error('Error signing out. Redirecting to login...');
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-warm-lg border border-warm-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-left">
          {/* Profile Header */}
          <div className="p-4 border-b border-warm-200 bg-warm-50/50 flex items-center gap-3">
            <Avatar
              src={user?.avatarUrl}
              name={displayName}
              size="md"
              status="online"
            />
            <div className="overflow-hidden">
              <p className="text-xs font-heading font-bold text-warm-900 truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-warm-500 truncate">{displayEmail}</p>
              <Badge variant="terracotta" size="sm" className="mt-1">
                {displayRole}
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
              onClick={() => {
                setShowLogoutConfirm(true);
                onClose && onClose();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-terracotta-600 hover:bg-terracotta-50 transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out of TeamFlow?"
        message="Are you sure you want to end your current session? You will need to sign in again to access your boards and workspaces."
        confirmText="Sign Out"
        cancelText="Stay Signed In"
        variant="warning"
        isLoading={isLoggingOut}
      />
    </>
  );
};

export default ProfileDropdown;
