import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Code, FileText, Users, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function SecurityOverview() {
  const stats = [
    { label: "Active API Keys", value: "3", icon: Code },
    { label: "Audit Log Entries", value: "1,234", icon: FileText },
    { label: "Admin Users", value: "2", icon: Users },
    { label: "Deletion Requests", value: "0", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Security Management</h2>
        <p className="text-muted-foreground">Manage API keys, audit logs, and access control</p>
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
        <Link to="/admin/security/api-keys">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-blue-500" />
                API Keys
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Generate and manage API keys</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/security/logs">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-500" />
                Audit Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">View security and system audit logs</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/security/roles">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                User Roles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Manage user roles and permissions</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/security/data-deletion">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-red-500" />
                Data Deletion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Handle GDPR data deletion requests</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
