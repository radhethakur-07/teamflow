import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Route Protection
import AppLayout from './components/layout/AppLayout.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import PageSkeleton from './components/layout/PageSkeleton.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';

// Code-Split Public Authentication & Marketing Pages
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage.jsx'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage.jsx'));

// Code-Split Authenticated Application Shell Pages
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage.jsx'));
const ProjectDetailsPage = lazy(() => import('./pages/ProjectDetailsPage.jsx'));
const KanbanBoardPage = lazy(() => import('./pages/KanbanBoardPage.jsx'));
const MyTasksPage = lazy(() => import('./pages/MyTasksPage.jsx'));
const TeamMembersPage = lazy(() => import('./pages/TeamMembersPage.jsx'));
const CalendarPage = lazy(() => import('./pages/CalendarPage.jsx'));
const ChatPage = lazy(() => import('./pages/ChatPage.jsx'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage.jsx'));
const ProfileSettingsPage = lazy(() => import('./pages/ProfileSettingsPage.jsx'));
const WorkspaceSettingsPage = lazy(() => import('./pages/WorkspaceSettingsPage.jsx'));

// Diagnostic Page
const ConnectionTestPage = lazy(() => import('./pages/ConnectionTestPage.jsx'));

export const App = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            {/* Public Marketing & Authentication Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/onboarding" element={<OnboardingPage />} />

              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/app" element={<Navigate to="/dashboard" replace />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/projects/:id" element={<ProjectDetailsPage />} />
                <Route path="/projects/:id/board" element={<KanbanBoardPage />} />
                <Route path="/board" element={<KanbanBoardPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/my-tasks" element={<MyTasksPage />} />
                <Route path="/members" element={<TeamMembersPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings/profile" element={<ProfileSettingsPage />} />
                <Route path="/settings/workspace" element={<WorkspaceSettingsPage />} />
                <Route path="/status" element={<ConnectionTestPage />} />
              </Route>
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default App;
