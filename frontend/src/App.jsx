import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Route Protection
import AppLayout from './components/layout/AppLayout.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

// Public Authentication Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';

// Authenticated Application Shell Pages
import DashboardPage from './pages/DashboardPage.jsx';
import ProjectsPage from './pages/ProjectsPage.jsx';
import ProjectDetailsPage from './pages/ProjectDetailsPage.jsx';
import KanbanBoardPage from './pages/KanbanBoardPage.jsx';
import MyTasksPage from './pages/MyTasksPage.jsx';
import TeamMembersPage from './pages/TeamMembersPage.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import ProfileSettingsPage from './pages/ProfileSettingsPage.jsx';
import WorkspaceSettingsPage from './pages/WorkspaceSettingsPage.jsx';

// Infrastructure Diagnostic (Milestone 1)
import ConnectionTestPage from './pages/ConnectionTestPage.jsx';

export const App = () => {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
};

export default App;
