
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";

import Layout from "@/components/Layout";
import LoadingSplash from "@/components/LoadingSplash";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Litters from "@/pages/Litters";
import PuppyDetails from "@/pages/PuppyDetails";
import Adopt from "@/pages/Adopt";
import Reviews from "@/pages/Reviews";
import Health from "@/pages/Health";
import Contact from "@/pages/Contact";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminTest from "@/pages/AdminTest";
import SystemStatus from "@/pages/SystemStatus";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import StudPage from "@/pages/StudPage";
import Checkout from "@/pages/Checkout";
import Financing from "@/pages/Financing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/NotFound";
import FAQPage from "@/pages/FAQPage";
import TermsOfServicePage from "@/pages/TermsOfServicePage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import RefundPolicyPage from "@/pages/RefundPolicyPage";
import UserDataDeletionPage from "@/pages/UserDataDeletionPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import TawkToWidget from "@/components/chat/TawkToWidget";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const initializeApp = async () => {
      // Check if this is the first load
      const hasLoadedBefore = sessionStorage.getItem('app-loaded');
      
      if (!hasLoadedBefore) {
        // Show splash screen for first-time users
        await new Promise(resolve => setTimeout(resolve, 3000));
        sessionStorage.setItem('app-loaded', 'true');
      } else {
        // Quick load for returning users
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setIsInitialLoading(false);
    };

    initializeApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AuthProvider>
            <LoadingSplash 
              isLoading={isInitialLoading} 
              onComplete={() => setIsInitialLoading(false)} 
            />
            
            {!isInitialLoading && (
              <>
                <Toaster />
                <SonnerToaster />
                <BrowserRouter>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/litters" element={<Litters />} />
                      <Route path="/puppies/:id" element={<PuppyDetails />} />
                      <Route path="/adopt" element={<Adopt />} />
                      <Route path="/reviews" element={<Reviews />} />
                      <Route path="/health" element={<Health />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/stud" element={<StudPage />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:slug" element={<BlogPost />} />
                      <Route path="/system-status" element={<SystemStatus />} />
                      <Route path="/financing" element={<Financing />} />
                      
                      {/* Protected Routes */}
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/dashboard/puppy/:id" element={
                        <ProtectedRoute>
                          <PuppyDetails />
                        </ProtectedRoute>
                      } />
                      <Route path="/admin" element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminDashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/admin-test" element={
                        <ProtectedRoute requiredRole="super-admin">
                          <AdminTest />
                        </ProtectedRoute>
                      } />
                      <Route path="/checkout" element={
                        <ProtectedRoute>
                          <Checkout />
                        </ProtectedRoute>
                      } />
                      <Route path="/faq" element={<FAQPage />} />
                      <Route path="/terms-of-service" element={<TermsOfServicePage />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                      <Route path="/refund-policy" element={<RefundPolicyPage />} />
                      <Route path="/user-data-deletion" element={<UserDataDeletionPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                  <TawkToWidget />
                </BrowserRouter>
              </>
            )}
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
