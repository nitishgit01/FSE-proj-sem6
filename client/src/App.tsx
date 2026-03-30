import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SubmitPage from './pages/SubmitPage';
import DashboardPage from './pages/DashboardPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/"          element={<Navigate to="/dashboard" replace />} />
          <Route path="/submit"    element={<SubmitPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
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
      </Router>
    </QueryClientProvider>
  );
}

export default App;

