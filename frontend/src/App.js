import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/AppLayout';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import Toast from './components/Toast';
import ConfirmDialog from './components/ConfirmDialog';
import PrivateRoute from './components/PrivateRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Dashboard from './pages/Dashboard';
import CustomLists from './pages/CustomLists';
import Algorithms from './pages/Algorithms';
import Notifications from './pages/Notifications';
import AdminNotifications from './pages/AdminNotifications';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import OAuthCallback from './pages/OAuthCallback';
import TestAuth from './pages/TestAuth';
import Labs from './labs/Labs';
import TestDashboard from './testing/TestDashboard';
import Admin from './components/Admin';
import UserManagement from './pages/UserManagement';
import './index.css';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <Toast />
          <ConfirmDialog />
          <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />
          <Route path="/test-auth" element={<TestAuth />} />
          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/home" element={<TestDashboard />} />
              <Route path="/lists" element={<CustomLists />} />
              <Route path="/notes" element={<Navigate to="/algorithms" replace />} />
              <Route path="/algorithms" element={<Algorithms />} />
              <Route path="/algorithms/:algorithmSlug" element={<Algorithms />} />
              <Route path="/labs" element={<Labs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
          </Route>
        </Routes>
      </Router>
      </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
