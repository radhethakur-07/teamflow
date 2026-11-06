import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Kanban, 
  CheckSquare, 
  Users, 
  Calendar, 
  Bell, 
  Settings, 
  Activity, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import Avatar from '../common/Avatar.jsx';
import { cn } from '../../utils/cn.js';

export const Sidebar = ({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) => {
  const { workspace, projects, currentUser, notifications } = useApp();
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/projects', label: 'Projects', icon: FolderKanban },
    { to: '/board', label: 'Kanban Board', icon: Kanban },
    { to: '/my-tasks', label: 'My Tasks', icon: CheckSquare },
    { to: '/members', label: 'Team Members', icon: Users },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadNotifs > 0 ? unreadNotifs : null },
    { to: '/settings/workspace', label: 'Settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-warm-100 border-r border-warm-200 select-none">
      {/* Top Section */}
      <div className="space-y-6">
        {/* Workspace Brand / Header */}
        <div className="p-4 border-b border-warm-200 flex items-center justify-between">
          <Link
            to="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center gap-2.5 overflow-hidden focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-terracotta-500 text-white flex items-center justify-center font-heading font-bold text-sm shadow-warm-sm flex-shrink-0">
              TF
            </div>
            {!isCollapsed && (
              <div className="text-left overflow-hidden">
                <h2 className="text-sm font-heading font-bold text-warm-900 truncate tracking-tight">
                  {workspace.name}
                </h2>
                <p className="text-[10px] text-warm-500 truncate font-medium">
                  {workspace.plan}
                </p>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden md:flex text-warm-400 hover:text-warm-800 p-1 rounded-md hover:bg-warm-200/60 transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Main Nav Links */}
        <nav className="px-2 space-y-1">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group relative",
                    isActive
                      ? "bg-white text-terracotta-600 shadow-warm-sm font-bold border border-warm-200"
                      : "text-warm-600 hover:bg-warm-200/50 hover:text-warm-900"
                  )
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {!isCollapsed && item.badge && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-terracotta-100 text-terracotta-600">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Pinned Projects Section */}
        {!isCollapsed && (
          <div className="px-4 space-y-2 pt-2 text-left">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-bold text-warm-400 px-1">
              <span>Projects</span>
              <Link
                to="/projects"
                className="text-warm-400 hover:text-terracotta-600 transition-colors"
                title="Add Project"
              >
                <Plus className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-1">
              {projects.slice(0, 4).map((p) => (
                <NavLink
                  key={p.id}
                  to={`/projects/${p.id}`}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors group truncate",
                      isActive
                        ? "bg-white text-warm-900 font-semibold"
                        : "text-warm-600 hover:text-warm-900 hover:bg-warm-200/40"
                    )
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: p.color }}
                  />
                  <span className="truncate">{p.name}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-warm-200 space-y-2">
        {/* Milestone 1 Diagnostic link */}
        <Link
          to="/status"
          onClick={onCloseMobile}
          className={cn(
            "flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-warm-600 hover:bg-warm-200/50 hover:text-warm-900 transition-colors",
            isCollapsed && "justify-center"
          )}
          title="System Diagnostic"
        >
          <Activity className="w-3.5 h-3.5 text-sage-500 flex-shrink-0" />
          {!isCollapsed && <span>System Status</span>}
        </Link>

        {/* User Card */}
        <div
          className={cn(
            "flex items-center gap-2.5 p-2 rounded-xl bg-white/70 border border-warm-200/80 shadow-warm-sm",
            isCollapsed && "justify-center p-1.5"
          )}
        >
          <Avatar
            src={currentUser.avatar}
            name={currentUser.name}
            size="sm"
            status="online"
          />
          {!isCollapsed && (
            <div className="text-left overflow-hidden">
              <p className="text-xs font-bold text-warm-900 truncate">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-warm-400 truncate">
                {currentUser.roleTitle}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:block h-screen sticky top-0 transition-all duration-200 z-30",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-warm-900/40 backdrop-blur-[2px]"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-warm-100 shadow-warm-lg animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
