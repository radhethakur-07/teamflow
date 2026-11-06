import React, { useState } from 'react';
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
  ChevronDown,
  Building2,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext.jsx';
import Avatar from '../common/Avatar.jsx';
import Modal from '../common/Modal.jsx';
import Input from '../common/Input.jsx';
import Button from '../common/Button.jsx';
import { cn } from '../../utils/cn.js';

export const Sidebar = ({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) => {
  const { workspace, workspaces, switchWorkspace, createWorkspace, projects, currentUser, notifications } = useApp();
  const unreadNotifs = notifications.filter((n) => !n.read).length;

  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isCreateWsOpen, setIsCreateWsOpen] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [isCreatingWs, setIsCreatingWs] = useState(false);

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

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWsName.trim()) return;

    setIsCreatingWs(true);
    try {
      await createWorkspace({
        name: newWsName.trim(),
        description: newWsDesc.trim(),
      });
      setNewWsName('');
      setNewWsDesc('');
      setIsCreateWsOpen(false);
      setIsWorkspaceMenuOpen(false);
    } catch (err) {
      // Handled in context
    } finally {
      setIsCreatingWs(false);
    }
  };

  const currentWsId = workspace?._id || workspace?.id;

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-warm-100 border-r border-warm-200 select-none">
      {/* Top Section */}
      <div className="space-y-6">
        {/* Workspace Brand / Header with Switcher */}
        <div className="p-3 border-b border-warm-200 relative">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="flex items-center gap-2.5 overflow-hidden focus:outline-none hover:bg-warm-200/60 p-1.5 rounded-xl transition-colors text-left w-full"
            >
              <div className="w-8 h-8 rounded-lg bg-terracotta-500 text-white flex items-center justify-center font-heading font-bold text-sm shadow-warm-sm flex-shrink-0">
                TF
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden flex-1">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-heading font-bold text-warm-900 truncate tracking-tight">
                      {workspace?.name || 'TeamFlow Workspace'}
                    </h2>
                    <ChevronDown className="w-3.5 h-3.5 text-warm-400 shrink-0 ml-1" />
                  </div>
                  <p className="text-[10px] text-warm-500 truncate capitalize font-medium">
                    {workspace?.plan || 'starter'} plan
                  </p>
                </div>
              )}
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="hidden md:flex text-warm-400 hover:text-warm-800 p-1 rounded-md hover:bg-warm-200/60 transition-colors shrink-0 ml-1"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Workspace Switcher Dropdown */}
          {isWorkspaceMenuOpen && !isCollapsed && (
            <div className="absolute top-full left-2 right-2 mt-1 bg-white rounded-xl shadow-warm-lg border border-warm-200 p-1.5 z-50 text-left">
              <div className="text-[10px] uppercase font-bold text-warm-400 px-2.5 py-1">
                Your Workspaces
              </div>
              <div className="max-h-48 overflow-y-auto space-y-0.5">
                {workspaces.map((wsItem) => {
                  const ws = wsItem.workspace || wsItem;
                  const id = ws._id || ws.id;
                  const isCurrent = id === currentWsId;

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        switchWorkspace(id);
                        setIsWorkspaceMenuOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left",
                        isCurrent
                          ? "bg-terracotta-50 text-terracotta-700 font-bold"
                          : "text-warm-700 hover:bg-warm-100"
                      )}
                    >
                      <span className="truncate">{ws.name}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-terracotta-600" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-warm-100 mt-1 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsWorkspaceMenuOpen(false);
                    setIsCreateWsOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-terracotta-600 hover:bg-terracotta-50 transition-colors text-left"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Workspace</span>
                </button>
              </div>
            </div>
          )}
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
              {projects.slice(0, 5).map((p) => {
                const pId = p._id || p.id;
                return (
                  <NavLink
                    key={pId}
                    to={`/projects/${pId}`}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors group truncate",
                        isActive
                          ? "bg-white text-warm-900 font-semibold shadow-warm-xs"
                          : "text-warm-600 hover:text-warm-900 hover:bg-warm-200/40"
                      )
                    }
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: p.color || '#E98269' }}
                    />
                    <span className="truncate">{p.name}</span>
                  </NavLink>
                );
              })}

              {projects.length === 0 && (
                <p className="text-[11px] text-warm-400 px-2 py-1 italic">
                  No projects yet
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Section */}
      <div className="p-3 border-t border-warm-200 space-y-2">
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
            src={currentUser?.avatarUrl || currentUser?.avatar}
            name={currentUser?.name || 'Member'}
            size="sm"
            status="online"
          />
          {!isCollapsed && (
            <div className="text-left overflow-hidden">
              <p className="text-xs font-bold text-warm-900 truncate">
                {currentUser?.name || 'Member'}
              </p>
              <p className="text-[10px] text-warm-400 truncate">
                {currentUser?.email}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Workspace Modal */}
      <Modal
        isOpen={isCreateWsOpen}
        onClose={() => setIsCreateWsOpen(false)}
        title="Create New Workspace"
        description="Set up a workspace for your company or project team."
        maxWidth="sm"
      >
        <form onSubmit={handleCreateWorkspace} className="space-y-4 text-left">
          <Input
            label="Workspace Name"
            placeholder="e.g. Acme Studio"
            value={newWsName}
            onChange={(e) => setNewWsName(e.target.value)}
            required
            autoFocus
          />

          <Input
            label="Description (Optional)"
            placeholder="e.g. Engineering & Product design hub"
            value={newWsDesc}
            onChange={(e) => setNewWsDesc(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCreateWsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isCreatingWs}
            >
              Create Workspace
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:block h-screen sticky top-0 transition-all duration-200 ease-in-out z-30",
          isCollapsed ? "w-16" : "w-60"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-warm-900/40 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-xs flex-1 h-full shadow-warm-xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
