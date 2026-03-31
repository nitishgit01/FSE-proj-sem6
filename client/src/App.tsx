import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './hooks/useAuth';
import Navbar from './components/layout/Navbar';
import SubmitPage from './pages/SubmitPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />

            <main className="flex-1">
              <Routes>
                {/* Auth */}
                <Route path="/login"         element={<LoginPage />} />
                <Route path="/register"      element={<RegisterPage />} />
                <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

                {/* App */}
                <Route path="/submit"    element={<SubmitPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />

                {/* Redirects */}
                <Route path="/"   element={<Navigate to="/dashboard" replace />} />
                <Route path="/stats" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>

          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                borderRadius: '12px',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '14px',
              },
            }}
          />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
