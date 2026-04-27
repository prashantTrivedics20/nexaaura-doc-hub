import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, GlobalStyles } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';

import theme from './theme/theme';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Layout from './components/Layout/Layout';

// Pages
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Premium from './pages/Premium';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import DocumentManagement from './pages/Admin/DocumentManagement';
import UserManagement from './pages/Admin/UserManagement';
import Analytics from './pages/Admin/Analytics';
import CategoryManagement from './pages/Admin/CategoryManagement';
import SystemSettings from './pages/Admin/SystemSettings';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Global styles to remove drawer borders
const globalStyles = (
  <GlobalStyles
    styles={{
      '.MuiDrawer-paper': {
        border: 'none !important',
        borderRight: 'none !important',
      },
      '.MuiDrawer-paperAnchorLeft': {
        borderRight: 'none !important',
      },
      '.MuiDrawer-paperAnchorDockedLeft': {
        borderRight: 'none !important',
      },
      '.MuiDrawer-root': {
        border: 'none !important',
      },
    }}
  />
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {globalStyles}
        <SnackbarProvider 
          maxSnack={3}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          autoHideDuration={3000}
        >
          <AuthProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route
                  path="/signin"
                  element={
                    <PublicRoute>
                      <SignIn />
                    </PublicRoute>
                  }
                />

                {/* Protected Routes with Layout */}
                <Route
                  path="/app"
                  element={
                    <ProtectedRoute>
                      <Layout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/app/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="premium" element={<Premium />} />

                  {/* Admin Routes */}
                  <Route
                    path="admin"
                    element={
                      <ProtectedRoute adminOnly>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/settings"
                    element={
                      <ProtectedRoute adminOnly>
                        <SystemSettings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/documents"
                    element={
                      <ProtectedRoute adminOnly>
                        <DocumentManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/users"
                    element={
                      <ProtectedRoute adminOnly>
                        <UserManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/analytics"
                    element={
                      <ProtectedRoute adminOnly>
                        <Analytics />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin/categories"
                    element={
                      <ProtectedRoute adminOnly>
                        <CategoryManagement />
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </AuthProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;