import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  PawPrint, Dog, Receipt, Settings, CreditCard, Layers, FileText, Globe, Users, PlugZap, 
  Mail, ShieldCheck, MessageSquare, Bell, Heart, Code, Sparkles, ChevronRight
} from "lucide-react";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from "@/components/ui/animated-card";
import { Button } from "@/components/ui/button";
import UnifiedManagementHub from "@/components/admin/UnifiedManagementHub";
import TransactionHistory from "@/components/admin/TransactionHistory";
import SquareIntegration from "@/components/admin/SquareIntegration";
import SettingsPanel from "@/components/admin/SettingsPanel";
import BreedTemplateManager from "@/components/admin/BreedTemplateManager";
import BlogManager from "@/components/admin/BlogManager";
import AffiliateManager from "@/components/admin/AffiliateManager";
import SEOManager from "@/components/admin/SEOManager";
import ThirdPartyIntegrationsManager from "@/components/admin/ThirdPartyIntegrationsManager";
import EmailTemplatesManager from "@/components/admin/EmailTemplatesManager";
import AdminUserManager from "@/components/admin/AdminUserManager";
import AdminStudDogManager from "@/components/admin/AdminStudDogManager";
import AdvancedSecurityFeatures from "@/components/admin/AdvancedSecurityFeatures";
import DataDeletionRequestsManager from "@/components/admin/DataDeletionRequestsManager";
import EnhancedTestimonialManagement from '@/components/admin/EnhancedTestimonialManagement';
import SEOManagement from '@/components/admin/SEOManagement';
import NotificationCenter from '@/components/admin/NotificationCenter';
import SettingsHub from '@/components/admin/SettingsHub';
import SwaggerDoc from "@/components/admin/SwaggerUI";
import ReDocDoc from "@/components/admin/ReDocUI";
import ParentManagement from '@/components/admin/ParentManagement';

const adminSections = [
  {
    title: "Core Management",
    items: [
      { value: "hub", label: "Management Hub", icon: PawPrint, component: <UnifiedManagementHub />, gradient: "from-purple-500 to-pink-600" },
      { value: "parents", label: "Parents", icon: Heart, component: <ParentManagement />, gradient: "from-red-500 to-pink-600" },
    ]
  },
  {
    title: "Content & Marketing",
    items: [
      { value: "blog", label: "Blog", icon: FileText, component: <BlogManager />, gradient: "from-blue-500 to-cyan-600" },
      { value: "seo", label: "SEO", icon: Globe, component: <SEOManagement />, gradient: "from-green-500 to-emerald-600" },
      { value: "testimonials", label: "Testimonials", icon: MessageSquare, component: <EnhancedTestimonialManagement />, gradient: "from-yellow-500 to-orange-600" },
      { value: "marketing", label: "Marketing", icon: Users, component: <AffiliateManager />, gradient: "from-indigo-500 to-purple-600" },
    ]
  },
  {
    title: "Business Operations",
    items: [
      { value: "transactions", label: "Transactions", icon: Receipt, component: <TransactionHistory />, gradient: "from-emerald-500 to-teal-600" },
      { value: "square", label: "Square", icon: CreditCard, component: <SquareIntegration />, gradient: "from-blue-600 to-indigo-600" },
    ]
  },
  {
    title: "System & Settings",
    items: [
      { value: "notifications", label: "Notifications", icon: Bell, component: <NotificationCenter />, gradient: "from-orange-500 to-red-600" },
      { value: "settings", label: "Settings", icon: Settings, component: <SettingsHub />, gradient: "from-gray-600 to-gray-800" },
    ]
  },
  {
    title: "Developer Tools",
    items: [
      { value: "swagger", label: "Swagger UI", icon: Code, component: <SwaggerDoc />, gradient: "from-slate-600 to-slate-800" },
      { value: "redoc", label: "ReDoc", icon: Code, component: <ReDocDoc />, gradient: "from-zinc-600 to-zinc-800" },
    ]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 200
    }
  }
};

/**
 * @component RedesignedAdminDashboard
 * @description A modern, animated admin dashboard with organized sections and smooth transitions
 */
const RedesignedAdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "hub";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Find active tab data
  const activeTabData = adminSections
    .flatMap(section => section.items)
    .find(item => item.value === activeTab);

  useEffect(() => {
    const currentTab = searchParams.get("tab");
    if (currentTab && currentTab !== activeTab) {
      setActiveTab(currentTab);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
    setSelectedSection(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-heading bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent mb-4">
            Admin Dashboard
          </h1>
          <p className="text-xl text-muted-foreground font-body max-w-2xl mx-auto">
            Manage your business operations, content, and system settings
          </p>
        </motion.div>

        {/* Dashboard Sections */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12 mb-12"
        >
          {adminSections.map((section, sectionIndex) => (
            <motion.div key={section.title} variants={itemVariants}>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-display font-semibold text-foreground">
                  {section.title}
                </h2>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                </motion.div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {section.items.map((item, index) => (
                  <motion.div
                    key={item.value}
                    variants={itemVariants}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <AnimatedCard 
                      delay={(sectionIndex * 0.2) + (index * 0.1)}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-2xl bg-gradient-to-br ${item.gradient} text-white border-0 group ${activeTab === item.value ? 'ring-4 ring-primary/50 scale-105' : ''}`}
                      onClick={() => handleTabChange(item.value)}
                    >
                      <AnimatedCardHeader className="text-center p-6">
                        <motion.div
                          className="mx-auto mb-4 p-4 bg-white/20 rounded-2xl backdrop-blur-sm"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <item.icon className="h-8 w-8" />
                        </motion.div>
                        <AnimatedCardTitle className="text-white group-hover:text-white/90 text-lg">
                          {item.label}
                        </AnimatedCardTitle>
                        <motion.div
                          className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                          initial={{ x: -10 }}
                          whileHover={{ x: 0 }}
                        >
                          <ChevronRight className="h-5 w-5 mx-auto" />
                        </motion.div>
                      </AnimatedCardHeader>
                    </AnimatedCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Active Tab Content */}
        <AnimatePresence mode="wait">
          {activeTabData && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatedCard className="overflow-hidden">
                <AnimatedCardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/20 rounded-2xl">
                      <activeTabData.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <AnimatedCardTitle className="text-2xl">
                        {activeTabData.label}
                      </AnimatedCardTitle>
                      <p className="text-muted-foreground font-body">
                        Manage your {activeTabData.label.toLowerCase()} settings and data
                      </p>
                    </div>
                    <motion.div
                      className="ml-auto"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="h-6 w-6 text-accent" />
                    </motion.div>
                  </div>
                </AnimatedCardHeader>
                
                <AnimatedCardContent className="p-8">
                  {activeTabData.component}
                </AnimatedCardContent>
              </AnimatedCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12"
        >
          <AnimatedCard className="text-center bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-200">
            <AnimatedCardContent className="p-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Dog className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-display font-bold text-blue-700">45</h3>
              <p className="text-blue-600 font-body">Active Puppies</p>
            </AnimatedCardContent>
          </AnimatedCard>

          <AnimatedCard className="text-center bg-gradient-to-br from-green-100 to-emerald-100 border-green-200">
            <AnimatedCardContent className="p-6">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Receipt className="h-12 w-12 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-display font-bold text-green-700">$12,450</h3>
              <p className="text-green-600 font-body">Monthly Sales</p>
            </AnimatedCardContent>
          </AnimatedCard>

          <AnimatedCard className="text-center bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200">
            <AnimatedCardContent className="p-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Users className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-display font-bold text-purple-700">127</h3>
              <p className="text-purple-600 font-body">Happy Customers</p>
            </AnimatedCardContent>
          </AnimatedCard>

          <AnimatedCard className="text-center bg-gradient-to-br from-orange-100 to-red-100 border-orange-200">
            <AnimatedCardContent className="p-6">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Bell className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-display font-bold text-orange-700">3</h3>
              <p className="text-orange-600 font-body">New Notifications</p>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>
      </div>
    </div>
  );
};

export default RedesignedAdminDashboard;