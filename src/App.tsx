
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { trackCurrentPageVisit } from '@/utils/visitTracker';
import { ThemeProvider } from '@/components/ThemeProvider';
import './App.css';
import VisitorChatWidget from '@/components/chat/VisitorChatWidget'; // Import VisitorChatWidget

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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Component to handle route changes and initial visit tracking
const PageVisitTracker = () => {
  const location = useLocation();

  // Track initial visit
  useEffect(() => {
    console.log("Initial page visit tracking triggered.");
    trackCurrentPageVisit();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Track route changes
  useEffect(() => {
    console.log(`Route changed to: ${location.pathname}${location.search}, tracking visit.`);
    trackCurrentPageVisit();
  }, [location.pathname, location.search]); // Track changes to pathname and search params

  return null; // This component does not render anything
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="gds-theme">
        <Router>
          <PageVisitTracker /> {/* Add the tracker component here */}
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
            <Toaster richColors position="top-right" /> {/* Ensure Toaster is available */}
            <VisitorChatWidget /> {/* Add VisitorChatWidget here */}
          </div>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
