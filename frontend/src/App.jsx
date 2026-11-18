import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { store } from './app/store';

import { GuestRoute, ProtectedRoute, AdminRoute, ApprovedRoute } from './routes/Guards';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PendingPage from './pages/pending/PendingPage';
import RejectedPage from './pages/pending/RejectedPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTasksPage from './pages/admin/AdminTasksPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';
import NotificationsPage from './pages/admin/NotificationsPage';
import UserDashboard from './pages/user/UserDashboard';
import UserMessagesPage from './pages/user/UserMessagesPage';

import { useSocket } from './hooks/useSocket';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
});

// Inner component that initialises socket after auth
const AppInner = () => {
  useSocket();
  return null;
};

const App = () => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <AppInner />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#1e293b',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                fontSize: '14px',
                padding: '12px 16px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <Routes>
            {/* Guest routes */}
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Authenticated — pending */}
            <Route element={<ProtectedRoute />}>
              <Route path="/pending" element={<PendingPage />} />
              <Route path="/rejected" element={<RejectedPage />} />
            </Route>

            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminDashboard />} />
              <Route path="/admin/tasks" element={<AdminTasksPage />} />
              <Route path="/admin/messages" element={<AdminMessagesPage />} />
              <Route path="/admin/notifications" element={<NotificationsPage />} />
            </Route>

            {/* Approved user routes */}
            <Route element={<ApprovedRoute />}>
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/tasks" element={<UserDashboard />} />
              <Route path="/messages" element={<UserMessagesPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
