import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Header from './Header.jsx';
import SearchModal from './SearchModal.jsx';
import NewTaskModal from '../domain/NewTaskModal.jsx';
import Badge from '../common/Badge.jsx';
import ErrorBoundary from '../common/ErrorBoundary.jsx';
import { Sparkles } from 'lucide-react';

export const AppLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

  return (
    <div className="min-h-screen bg-warm-50 text-warm-900 flex">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Milestone 2 Preview Banner */}
        <div className="bg-mustard-50 border-b border-mustard-200/80 px-4 py-1.5 flex items-center justify-between text-xs text-warm-700">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-mustard-500 animate-pulse" />
            <span className="font-semibold text-warm-800">Milestone 2 Visual Foundation</span>
            <span className="hidden sm:inline text-warm-500">&bull; Warm Editorial Design System Preview</span>
          </div>
          <span className="text-[11px] font-mono text-warm-500">All controls interactive</span>
        </div>

        {/* Global Sticky Header */}
        <Header
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNewTask={() => setIsNewTaskOpen(true)}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          <ErrorBoundary>
            <Outlet context={{ onOpenNewTask: () => setIsNewTaskOpen(true) }} />
          </ErrorBoundary>
        </main>
      </div>

      {/* Global Modals */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <NewTaskModal
        isOpen={isNewTaskOpen}
        onClose={() => setIsNewTaskOpen(false)}
      />
    </div>
  );
};

export default AppLayout;
