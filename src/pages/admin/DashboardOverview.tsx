import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dog, ShoppingCart, DollarSign, MessageSquare, Settings,
  ShieldCheck, Users, TrendingUp, Receipt, Heart
} from "lucide-react";

const quickStats = [
  { label: "Active Puppies", value: "45", icon: Dog, gradient: "from-blue-500 to-blue-600", link: "/admin/puppy-manager/puppies" },
  { label: "Total Adoptions", value: "127", icon: Receipt, gradient: "from-green-500 to-green-600", link: "/admin/orders/adoptions" },
  { label: "Monthly Revenue", value: "$12,450", icon: DollarSign, gradient: "from-purple-500 to-purple-600", link: "/admin/financial/transactions" },
  { label: "New Messages", value: "8", icon: MessageSquare, gradient: "from-orange-500 to-orange-600", link: "/admin/messages/chat" },
];

const quickActions = [
  { title: "Puppy Manager", description: "Manage puppies, parents, and litters", icon: Dog, link: "/admin/puppy-manager", color: "text-blue-500" },
  { title: "Marketing & SEO", description: "Optimize content and track analytics", icon: TrendingUp, link: "/admin/marketing", color: "text-green-500" },
  { title: "Adoptions/Orders", description: "View and manage all orders", icon: ShoppingCart, link: "/admin/orders", color: "text-purple-500" },
  { title: "Financial", description: "Track transactions and payments", icon: DollarSign, link: "/admin/financial", color: "text-yellow-500" },
  { title: "Messages/Email", description: "Live chat and email management", icon: MessageSquare, link: "/admin/messages", color: "text-pink-500" },
  { title: "General Settings", description: "Configure branding and site contact", icon: Settings, link: "/admin/settings", color: "text-cyan-500" },
  { title: "Security", description: "Manage security and access control", icon: ShieldCheck, link: "/admin/security", color: "text-red-500" },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Welcome back! Here's what's happening with your business.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={stat.link} className="block">
              <Card className={`hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br ${stat.gradient} text-white border-0 min-h-[120px]`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">{stat.label}</CardTitle>
                  <stat.icon className="h-5 w-5 sm:h-4 sm:w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Quick Actions</h3>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Link to={action.link} className="block">
                <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary min-h-[100px]">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                      <div className={`p-2 sm:p-3 bg-muted rounded-lg ${action.color} flex-shrink-0`}>
                        <action.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base sm:text-lg">{action.title}</CardTitle>
                        <p className="text-xs sm:text-sm text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 sm:space-y-4">
            {[
              { action: "New puppy added", detail: "Max - Golden Retriever", time: "2 hours ago" },
              { action: "Adoption completed", detail: "Bella adopted by John Smith", time: "5 hours ago" },
              { action: "New message received", detail: "From: sarah@example.com", time: "1 day ago" },
              { action: "Payment processed", detail: "$2,500 - Invoice #1234", time: "2 days ago" },
            ].map((activity, index) => (
              <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-2 border-b last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base">{activity.action}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">{activity.detail}</p>
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
