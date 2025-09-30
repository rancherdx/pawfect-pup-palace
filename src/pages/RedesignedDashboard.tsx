import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { 
  Home, 
  Users, 
  FileText, 
  MessageSquare, 
  PawPrint,
  Heart,
  TrendingUp
} from "lucide-react";
import UserProfile from "@/components/dashboard/UserProfile";
import PuppyProfile from "@/components/dashboard/PuppyProfile";
import Receipts from "@/components/dashboard/Receipts";
import ChatHistory from "@/components/dashboard/ChatHistory";
import { Card, CardContent } from "@/components/ui/card";

const dashboardTabs = [
  {
    value: "profile",
    label: "My Profile",
    icon: Users,
    component: UserProfile,
  },
  {
    value: "puppies",
    label: "My Puppies",
    icon: PawPrint,
    component: PuppyProfile,
  },
  {
    value: "receipts",
    label: "Receipts",
    icon: FileText,
    component: Receipts,
  },
  {
    value: "messages",
    label: "Messages",
    icon: MessageSquare,
    component: ChatHistory,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
    },
  },
};

const RedesignedDashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const ActiveComponent = dashboardTabs.find(tab => tab.value === activeTab)?.component;

  return (
    <Layout>
      <div className="py-6 sm:py-8 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">
            Welcome Back! 🐾
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground">
            Manage your profile, puppies, and more
          </p>
        </motion.div>

        {/* Tab Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {dashboardTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            
            return (
              <motion.div key={tab.value} variants={itemVariants}>
                <Card
                  onClick={() => setActiveTab(tab.value)}
                  className={`cursor-pointer transition-all duration-300 border-2 ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                      : "bg-card hover:bg-muted border-border hover:border-primary hover:shadow-md"
                  }`}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 min-h-[140px]">
                    <Icon className={`h-10 w-10 mb-3 ${isActive ? "" : "text-primary"}`} />
                    <h3 className="text-lg font-semibold text-center">{tab.label}</h3>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Active Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {ActiveComponent && <ActiveComponent />}
        </motion.div>

        {/* Fun Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <Card className="border-2 border-border">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">5</p>
                <p className="text-sm text-muted-foreground">Favorite Puppies</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-accent/10 p-3">
                <PawPrint className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">12</p>
                <p className="text-sm text-muted-foreground">Total Visits</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">3</p>
                <p className="text-sm text-muted-foreground">Active Inquiries</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default RedesignedDashboard;