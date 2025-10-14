import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Mail, PlugZap, Settings, Bell, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsOverview() {
  const quickActions = [
    {
      title: "Branding",
      description: "Manage logos, colors, and company information",
      icon: FileText,
      link: "/admin/settings/branding",
      color: "text-blue-500"
    },
    {
      title: "Site Contact",
      description: "Update phone, email, address, and hours",
      icon: Phone,
      link: "/admin/settings/contact",
      color: "text-green-500"
    },
    {
      title: "PWA Configuration",
      description: "Configure Progressive Web App settings",
      icon: PlugZap,
      link: "/admin/settings/pwa",
      color: "text-purple-500"
    },
    {
      title: "Push Notifications",
      description: "Configure notification preferences and alerts",
      icon: Bell,
      link: "/admin/settings/notifications",
      color: "text-yellow-500"
    },
    {
      title: "System Settings",
      description: "Maintenance mode and system configuration",
      icon: Settings,
      link: "/admin/settings/system",
      color: "text-orange-500"
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">General Settings</h2>
        <p className="text-muted-foreground">Configure branding, contact information, and system settings</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link to={action.link}>
              <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 bg-muted rounded-lg ${action.color}`}>
                      <action.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
