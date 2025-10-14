import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AdminErrorBoundary } from "@/components/ErrorBoundary/AdminErrorBoundary";
import { CheckoutErrorBoundary } from "@/components/ErrorBoundary/CheckoutErrorBoundary";
import AnimatedLayout from "@/components/AnimatedLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Setup from "./pages/Setup";
import CorsConfig from "@/components/CorsConfig";
import { ParallaxProvider } from "@/components/ParallaxProvider";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const Puppies = lazy(() => import("./pages/PuppiesRedesigned"));
const PuppyDetails = lazy(() => import("./pages/PuppyDetails"));
const Litters = lazy(() => import("./pages/Litters"));
const LitterDetails = lazy(() => import("./pages/LitterDetails"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Adopt = lazy(() => import("./pages/Adopt"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const RedesignedDashboard = lazy(() => import("./pages/RedesignedDashboard"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const DashboardOverview = lazy(() => import("./pages/admin/DashboardOverview"));
const PuppyManagerOverview = lazy(() => import("./pages/admin/PuppyManagerOverview"));
const MarketingOverview = lazy(() => import("./pages/admin/MarketingOverview"));
const OrdersOverview = lazy(() => import("./pages/admin/OrdersOverview"));
const FinancialOverview = lazy(() => import("./pages/admin/FinancialOverview"));
const MessagesOverview = lazy(() => import("./pages/admin/MessagesOverview"));
const SettingsOverview = lazy(() => import("./pages/admin/SettingsOverview"));
const SecurityOverview = lazy(() => import("./pages/admin/SecurityOverview"));
const ParentManagement = lazy(() => import("./components/admin/ParentManagement"));
const LitterManagement = lazy(() => import("./components/admin/LitterManagement"));
const PuppyManagement = lazy(() => import("./components/admin/PuppyManagement"));
const SEOManagement = lazy(() => import("./components/admin/SEOManagement"));
const BlogManager = lazy(() => import("./components/admin/BlogManager"));
const EnhancedTestimonialManagement = lazy(() => import("./components/admin/EnhancedTestimonialManagement"));
const AdoptionsOverview = lazy(() => import("./components/admin/AdoptionsOverview"));
const TransactionSettings = lazy(() => import("./components/admin/TransactionSettings"));
const PaymentMethodsManager = lazy(() => import("./components/admin/PaymentMethodsManager"));
const NotificationCenter = lazy(() => import("./components/admin/NotificationCenter"));
const EmailTemplatesManager = lazy(() => import("./components/admin/EmailTemplatesManager"));
const EmailIntegrationsPanel = lazy(() => import("./components/admin/EmailIntegrationsPanel"));
const SettingsHub = lazy(() => import("./components/admin/SettingsHub"));
const AdvancedSecurityFeatures = lazy(() => import("./components/admin/AdvancedSecurityFeatures"));
const AdminUserManagementEnhanced = lazy(() => import("./components/admin/AdminUserManagementEnhanced"));
const DataDeletionRequestsManager = lazy(() => import("./components/admin/DataDeletionRequestsManager"));
const SwaggerDoc = lazy(() => import("./components/admin/SwaggerUI"));
const ReDocDoc = lazy(() => import("./components/admin/ReDocUI"));
const LiveChatManager = lazy(() => import("./components/admin/LiveChatManager"));
const BrandAssetManager = lazy(() => import("./components/admin/BrandAssetManager"));
const HolidayThemeManager = lazy(() => import("./components/admin/HolidayThemeManager"));
const MaintenanceModeToggle = lazy(() => import("./components/admin/MaintenanceModeToggle"));
const PWAConfiguration = lazy(() => import("./components/admin/PWAConfiguration").then(m => ({ default: m.PWAConfiguration })));
const NotificationSettings = lazy(() => import("./components/admin/NotificationSettings").then(m => ({ default: m.NotificationSettings })));
const ContactInfoManager = lazy(() => import("./components/admin/ContactInfoManager").then(m => ({ default: m.ContactInfoManager })));
const AnalyticsManager = lazy(() => import("./components/admin/AnalyticsManager").then(m => ({ default: m.AnalyticsManager })));
const ComprehensiveSEOManager = lazy(() => import("./components/admin/ComprehensiveSEOManager").then(m => ({ default: m.ComprehensiveSEOManager })));
const SiteSettingsManager = lazy(() => import("./components/admin/SiteSettingsManager").then(m => ({ default: m.SiteSettingsManager })));
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
  useSmoothScroll();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ParallaxProvider>
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider>
              <Toaster />
              <Sonner />
              <CorsConfig />
              <AnalyticsScripts />
              <ErrorBoundary>
            <div className="min-h-screen flex flex-col">
              <Routes>
                {/* Setup route (no layout) */}
                <Route 
                  path="/setup" 
                  element={<Setup />} 
                />
                
                {/* All other routes with animated layout */}
                <Route 
                  path="/*" 
                  element={
                    <AnimatedLayout>
                      <Suspense fallback={
                        <div className="flex items-center justify-center min-h-screen">
                          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                        </div>
                      }>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/puppies" element={<Puppies />} />
                          <Route path="/puppy/:slug" element={<PuppyDetails />} />
                          <Route path="/litter/:slug" element={<LitterDetails />} />
                          <Route path="/litters" element={<Litters />} />
                          <Route path="/about" element={<About />} />
                          <Route path="/contact" element={<Contact />} />
                          <Route path="/adopt" element={<Adopt />} />
                          <Route 
                            path="/checkout" 
                            element={
                              <CheckoutErrorBoundary>
                                <Checkout />
                              </CheckoutErrorBoundary>
                            } 
                          />
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
                                <RedesignedDashboard />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/admin/*" 
                             element={
                              <ProtectedRoute requiredRole="admin">
                                <AdminErrorBoundary>
                                  <AdminLayout />
                                </AdminErrorBoundary>
                              </ProtectedRoute>
                            }
                          >
                            <Route index element={<DashboardOverview />} />
                            
                            {/* Puppy Manager */}
                            <Route path="puppy-manager" element={<PuppyManagerOverview />} />
                            <Route path="puppy-manager/parents" element={<ParentManagement />} />
                            <Route path="puppy-manager/litters" element={<LitterManagement />} />
                            <Route path="puppy-manager/puppies" element={<PuppyManagement />} />
                            
                            {/* Marketing & SEO */}
                            <Route path="marketing" element={<MarketingOverview />} />
                            <Route path="marketing/analytics" element={<div>Analytics Coming Soon</div>} />
                            <Route path="marketing/seo" element={<ComprehensiveSEOManager />} />
                            <Route path="marketing/blog" element={<BlogManager />} />
                            <Route path="marketing/testimonials" element={<EnhancedTestimonialManagement />} />
                            
                            {/* Adoptions/Orders */}
                            <Route path="orders" element={<OrdersOverview />} />
                            <Route path="orders/adoptions" element={<AdoptionsOverview />} />
                            <Route path="orders/products" element={<div>Products Coming Soon</div>} />
                            <Route path="orders/all" element={<AdoptionsOverview />} />
                            
                            {/* Financial */}
                            <Route path="financial" element={<FinancialOverview />} />
                            <Route path="financial/transactions" element={<TransactionSettings />} />
                            <Route path="financial/payment-methods" element={<PaymentMethodsManager />} />
                            
                            {/* Messages/Email */}
                            <Route path="messages" element={<MessagesOverview />} />
                            <Route path="messages/chat" element={<LiveChatManager />} />
                            <Route path="messages/notifications" element={<NotificationCenter />} />
                            <Route path="messages/templates" element={<EmailTemplatesManager />} />
                            <Route path="messages/integration" element={<EmailIntegrationsPanel />} />
                            
                            {/* General Settings */}
                            <Route path="settings" element={<SettingsOverview />} />
                            <Route path="settings/branding" element={<BrandAssetManager />} />
                            <Route path="settings/contact" element={<ContactInfoManager />} />
                            <Route path="settings/holiday-themes" element={<HolidayThemeManager />} />
                            <Route path="settings/pwa" element={<PWAConfiguration />} />
                            <Route path="settings/notifications" element={<NotificationSettings />} />
                            <Route path="settings/analytics" element={<AnalyticsManager />} />
                            <Route path="settings/system" element={<MaintenanceModeToggle />} />
                            <Route path="settings/site-settings" element={<SiteSettingsManager />} />
                    <Route path="settings/site-settings" element={<SiteSettingsManager />} />
                            
                            {/* Security */}
                            <Route path="security" element={<SecurityOverview />} />
                            <Route path="security/api-keys" element={<AdvancedSecurityFeatures />} />
                            <Route path="security/logs" element={<AdvancedSecurityFeatures />} />
                            <Route path="security/roles" element={<AdminUserManagementEnhanced />} />
                            <Route path="security/data-deletion" element={<DataDeletionRequestsManager />} />
                            
                            {/* Developer Tools */}
                            <Route path="developer/swagger" element={<SwaggerDoc />} />
                            <Route path="developer/redoc" element={<ReDocDoc />} />
                          </Route>
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </Suspense>
                    </AnimatedLayout>
                  } 
                />
              </Routes>
            </div>
              </ErrorBoundary>
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
      </ParallaxProvider>
    </QueryClientProvider>
  );
};

export default App;