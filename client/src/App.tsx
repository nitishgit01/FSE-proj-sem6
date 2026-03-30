import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <h1 className="text-4xl font-bold text-primary">
            WageGlass Scaffold Loaded
          </h1>
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
          </Routes>
        </div>
        <Toaster position="bottom-right" />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
