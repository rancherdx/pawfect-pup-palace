import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProtectedRoute from "@/components/ProtectedRoute";
import Setup from "./pages/Setup";
import CorsConfig from "@/components/CorsConfig";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const Puppies = lazy(() => import("./pages/Puppies"));
const PuppyDetails = lazy(() => import("./pages/PuppyDetails"));
const Litters = lazy(() => import("./pages/Litters"));
const LitterDetails = lazy(() => import("./pages/LitterDetails"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Adopt = lazy(() => import("./pages/Adopt"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Health = lazy(() => import("./pages/Health"));
const Financing = lazy(() => import("./pages/Financing"));
const Reviews = lazy(() => import("./pages/Reviews"));
const StudService = lazy(() => import("./pages/StudService"));
const StudPage = lazy(() => import("./pages/StudPage"));
const FAQPage = lazy(() => import("./pages/FAQPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const RefundPolicyPage = lazy(() => import("./pages/RefundPolicyPage"));
const SystemStatus = lazy(() => import("./pages/SystemStatus"));
const ApiDocs = lazy(() => import("./pages/ApiDocs"));
const TestPage = lazy(() => import("./pages/TestPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Create QueryClient outside component to prevent recreation
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="gds-theme">
        <Toaster />
        <Sonner />
        <CorsConfig />
        <ErrorBoundary>
          <BrowserRouter>
            <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Routes>
                {/* Setup route (no navbar/footer) */}
                <Route 
                  path="/setup" 
                  element={<Setup />} 
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
                            <Route path="/puppy/:slug" element={<PuppyDetails />} />
                            <Route path="/litter/:slug" element={<LitterDetails />} />
                            <Route path="/litters" element={<Litters />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/adopt" element={<Adopt />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/blog" element={<Blog />} />
                            <Route path="/blog/:slug" element={<BlogPost />} />
                            <Route path="/health" element={<Health />} />
                            <Route path="/financing" element={<Financing />} />
                            <Route path="/reviews" element={<Reviews />} />
                            <Route path="/stud-service" element={<StudService />} />
                            <Route path="/stud" element={<StudPage />} />
                            <Route path="/faq" element={<FAQPage />} />
                            <Route path="/privacy" element={<PrivacyPolicyPage />} />
                            <Route path="/terms" element={<TermsOfServicePage />} />
                            <Route path="/refund" element={<RefundPolicyPage />} />
                            <Route path="/system-status" element={<SystemStatus />} />
                            <Route path="/api-docs" element={<ApiDocs />} />
                            <Route path="/test" element={<TestPage />} />
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
                            <Route path="*" element={<NotFound />} />
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
        </ErrorBoundary>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;