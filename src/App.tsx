import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import './App.css';

// Import ProtectedRoute
import ProtectedRoute from '@/components/ProtectedRoute';
// Assuming AuthProvider is in main.tsx, otherwise it would be imported and used here.

import Index from '@/pages/Index';
import Puppies from '@/pages/Puppies';
import PuppyDetails from '@/pages/PuppyDetails';
import Litters from '@/pages/Litters';
import StudPage from '@/pages/StudPage';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import AdminDashboard from '@/pages/AdminDashboard';
import PrivacyPolicyPage from '@/pages/PrivacyPolicyPage';
import TermsOfServicePage from '@/pages/TermsOfServicePage';
import SystemStatus from '@/pages/SystemStatus';
import AdminTest from '@/pages/AdminTest';
import { HolidayThemeProvider } from "@/contexts/HolidayThemeContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <HolidayThemeProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="gds-theme">
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/puppies" element={<Puppies />} />
                <Route path="/puppies/:id" element={<PuppyDetails />} />
                <Route path="/litters" element={<Litters />} />
                <Route path="/stud-dogs" element={<StudPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} /> {/* Public dashboard route */}

                {/* Protected Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin-test"
                  element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminTest />
                    </ProtectedRoute>
                  }
                />

                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                <Route path="/status" element={<SystemStatus />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </HolidayThemeProvider>
  );
}

export default App;
