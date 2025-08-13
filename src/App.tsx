
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const Puppies = lazy(() => import("./pages/Puppies"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Adopt = lazy(() => import("./pages/Adopt"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const SquareOAuthCallback = lazy(() => import("./pages/SquareOAuthCallback"));
const Setup = lazy(() => import("./pages/Setup"));

function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider defaultTheme="system" storageKey="gds-theme">
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                <Routes>
                  {/* Setup route (no navbar/footer) */}
                  <Route 
                    path="/setup" 
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <Setup />
                      </Suspense>
                    } 
                  />
                  
                  {/* All other routes with navbar/footer */}
                  <Route 
                    path="/*" 
                    element={
                      <>
                        <Navbar />
                        <main className="flex-1">
                          <Suspense fallback={<div>Loading...</div>}>
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/puppies" element={<Puppies />} />
                              <Route path="/about" element={<About />} />
                              <Route path="/contact" element={<Contact />} />
                              <Route path="/adopt" element={<Adopt />} />
                              <Route path="/checkout" element={<Checkout />} />
                              <Route path="/login" element={<Login />} />
                              <Route path="/register" element={<Register />} />
                              <Route 
                                path="/dashboard" 
                                element={
                                  <ProtectedRoute>
                                    <Dashboard />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route 
                                path="/admin/*" 
                                element={
                                  <ProtectedRoute requiredRole="admin">
                                    <AdminDashboard />
                                  </ProtectedRoute>
                                } 
                              />
                              <Route path="/square/oauth/callback" element={<SquareOAuthCallback />} />
                            </Routes>
                          </Suspense>
                        </main>
                        <Footer />
                      </>
                    } 
                  />
                </Routes>
              </div>
            </AuthProvider>
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
