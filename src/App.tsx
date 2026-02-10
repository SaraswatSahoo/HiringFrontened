import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Dashboard
import { DashboardPage } from './pages/dashboard/DashboardPage';

// JD Pages
import { JDListPage } from './pages/jd/JDListPage';
import { CreateJDPage } from './pages/jd/CreateJDPage';
import { JDDetailPage } from './pages/jd/JDDetailPage';

// Candidate Pages
import { CandidateListPage } from './pages/candidates/CandidateListPage';
import { CandidateDetailPage } from './pages/candidates/CandidateDetailPage';

// Bulk Upload Pages
import { BulkUploadPage } from './pages/bulk/BulkUploadPage';
import { UploadHistoryPage } from './pages/bulk/UploadHistoryPage';

// Email Pages ✅ NEW
import SendEmailPage from './pages/email/SendEmailPage';
import EmailHistoryPage from './pages/email/EmailHistoryPage';
import TemplateListPage from './pages/email/TemplateListPage';

// ✅ React Query client (create once)
const queryClient = new QueryClient();

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-slate-800 rounded-lg p-8 border border-slate-700">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
              <p className="text-slate-400">An unexpected error occurred</p>
            </div>

            {this.state.error && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-slate-300 mb-2">Error Details:</h2>
                <div className="bg-slate-900 rounded-lg p-4 border border-red-500/20">
                  <p className="text-red-400 text-sm font-mono break-all">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-4">
                      <summary className="text-slate-400 text-sm cursor-pointer hover:text-white">
                        Stack trace
                      </summary>
                      <pre className="text-xs text-slate-500 mt-2 overflow-auto max-h-64">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              <button
                onClick={() => (window.location.href = '/dashboard')}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <DashboardPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />

      {/* JD Routes */}
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <JDListPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/create"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <CreateJDPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/:id"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <JDDetailPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs/:id/edit"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <CreateJDPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />

      {/* Candidate Routes */}
      <Route
        path="/candidates"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <CandidateListPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidates/:id"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <CandidateDetailPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />

      {/* Bulk Upload Routes */}
      <Route
        path="/bulk-upload"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <BulkUploadPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/bulk-upload/history"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <UploadHistoryPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />

      {/* Email Routes ✅ NEW */}
      <Route
        path="/emails"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <EmailHistoryPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />
      <Route
        path="/emails/send"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <SendEmailPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />

      {/* Template Routes ✅ NEW */}
      <Route
        path="/templates"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <TemplateListPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />

      {/* Analytics - Redirects to Dashboard for now */}
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <ErrorBoundary>
              <DashboardPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
