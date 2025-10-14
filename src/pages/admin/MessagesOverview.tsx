import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Bell, Mail, PlugZap } from "lucide-react";
import { motion } from "framer-motion";

export default function MessagesOverview() {
  const stats = [
    { label: "Unread Messages", value: "8", icon: MessageSquare },
    { label: "New Notifications", value: "12", icon: Bell },
    { label: "Email Templates", value: "15", icon: Mail },
    { label: "Active Integration", value: "1", icon: PlugZap },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Messages & Email</h2>
        <p className="text-muted-foreground">Manage live chat, notifications, and email communications</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/admin/messages/chat">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-500" />
                Live Chat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Real-time chat with website visitors</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/messages/notifications">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage notification center and alerts</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/messages/templates">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-500" />
                Email Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Create and manage email templates</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/messages/integration">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlugZap className="h-5 w-5 text-purple-500" />
                Email Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Configure MailChannels and DKIM settings</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
