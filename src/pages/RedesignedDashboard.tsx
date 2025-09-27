import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, Receipt, MessageSquare, Dog, Cat, Bell, Heart, Sparkles } from "lucide-react";
import { AnimatedCard, AnimatedCardContent, AnimatedCardHeader, AnimatedCardTitle } from "@/components/ui/animated-card";
import UserProfile from "@/components/dashboard/UserProfile";
import PuppyProfile from "@/components/dashboard/PuppyProfile";
import Receipts from "@/components/dashboard/Receipts";
import ChatHistory from "@/components/dashboard/ChatHistory";
import CreatureProfiles from "@/components/dashboard/CreatureProfiles";
import NotificationCenter from "@/components/admin/NotificationCenter";

const dashboardTabs = [
  { 
    value: "profile", 
    label: "Profile", 
    icon: UserCircle, 
    component: UserProfile,
    gradient: "from-blue-500 to-purple-600",
    description: "Manage your personal information"
  },
  { 
    value: "puppy-profiles", 
    label: "Puppy Profiles", 
    icon: Dog, 
    component: PuppyProfile,
    gradient: "from-orange-500 to-pink-600",
    description: "Track your puppies' growth and health"
  },
  { 
    value: "kitten-profiles", 
    label: "Kitten Profiles", 
    icon: Cat, 
    component: CreatureProfiles,
    gradient: "from-purple-500 to-indigo-600",
    description: "Monitor your kittens' development"
  },
  { 
    value: "receipts", 
    label: "Receipts", 
    icon: Receipt, 
    component: Receipts,
    gradient: "from-green-500 to-teal-600",
    description: "View purchase history and invoices"
  },
  { 
    value: "messages", 
    label: "Messages", 
    icon: MessageSquare, 
    component: ChatHistory,
    gradient: "from-cyan-500 to-blue-600",
    description: "Chat history and support tickets"
  },
  { 
    value: "notifications", 
    label: "Notifications", 
    icon: Bell, 
    component: NotificationCenter,
    gradient: "from-yellow-500 to-orange-600",
    description: "Stay updated with important alerts"
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
 * @component RedesignedDashboard
 * @description A modern, animated dashboard with cards, smooth transitions and playful design
 */
const RedesignedDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const activeTabData = dashboardTabs.find(tab => tab.value === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-heading bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent mb-4">
            Welcome to Your Dashboard
          </h1>
          <p className="text-xl text-muted-foreground font-body max-w-2xl mx-auto">
            Manage your puppies, track their health, and stay connected with our community
          </p>
        </motion.div>

        {/* Dashboard Cards Overview */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {dashboardTabs.map((tab, index) => (
            <motion.div
              key={tab.value}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <AnimatedCard 
                delay={index * 0.1}
                className={`cursor-pointer transition-all duration-300 hover:shadow-2xl bg-gradient-to-br ${tab.gradient} text-white border-0 group ${activeTab === tab.value ? 'ring-4 ring-primary/50' : ''}`}
                onClick={() => setActiveTab(tab.value)}
              >
                <AnimatedCardHeader className="text-center">
                  <motion.div
                    className="mx-auto mb-4 p-4 bg-white/20 rounded-2xl backdrop-blur-sm"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <tab.icon className="h-8 w-8" />
                  </motion.div>
                  <AnimatedCardTitle className="text-white group-hover:text-white/90">
                    {tab.label}
                  </AnimatedCardTitle>
                  <p className="text-white/80 text-sm font-body mt-2">
                    {tab.description}
                  </p>
                </AnimatedCardHeader>
              </AnimatedCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Active Tab Content */}
        <AnimatePresence mode="wait">
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
                    <activeTabData?.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <AnimatedCardTitle className="text-2xl">
                      {activeTabData?.label}
                    </AnimatedCardTitle>
                    <p className="text-muted-foreground font-body">
                      {activeTabData?.description}
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
                  {activeTabData?.component}
                </AnimatedCardContent>
            </AnimatedCard>
          </motion.div>
        </AnimatePresence>

        {/* Fun Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
        >
          <AnimatedCard className="text-center bg-gradient-to-br from-pink-100 to-purple-100 border-pink-200">
            <AnimatedCardContent className="p-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Heart className="h-12 w-12 text-pink-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-display font-bold text-pink-700">12</h3>
              <p className="text-pink-600 font-body">Puppies Loved</p>
            </AnimatedCardContent>
          </AnimatedCard>

          <AnimatedCard className="text-center bg-gradient-to-br from-green-100 to-emerald-100 border-green-200">
            <AnimatedCardContent className="p-6">
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Dog className="h-12 w-12 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-display font-bold text-green-700">8</h3>
              <p className="text-green-600 font-body">Health Checkups</p>
            </AnimatedCardContent>
          </AnimatedCard>

          <AnimatedCard className="text-center bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-200">
            <AnimatedCardContent className="p-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <MessageSquare className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-2xl font-display font-bold text-blue-700">24</h3>
              <p className="text-blue-600 font-body">Messages Sent</p>
            </AnimatedCardContent>
          </AnimatedCard>
        </motion.div>
      </div>
    </div>
  );
};

export default RedesignedDashboard;