import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, FileText, MessageSquare, TrendingUp, BarChart } from "lucide-react";
import { motion } from "framer-motion";

export default function MarketingOverview() {
  const stats = [
    { label: "Total Page Views", value: "12,450", change: "+12.3%", icon: TrendingUp },
    { label: "Blog Posts", value: "24", change: "+3 this month", icon: FileText },
    { label: "Testimonials", value: "89", change: "+5 pending", icon: MessageSquare },
    { label: "SEO Score", value: "87/100", change: "Good", icon: Globe },
  ];

  const quickActions = [
    {
      title: "Website Analytics",
      description: "Track visits, conversions, and user behavior",
      icon: BarChart,
      link: "/admin/marketing/analytics",
      color: "text-blue-500"
    },
    {
      title: "SEO Manager",
      description: "Optimize meta tags, sitemaps, and search rankings",
      icon: Globe,
      link: "/admin/marketing/seo",
      color: "text-green-500"
    },
    {
      title: "Blog Management",
      description: "Create and manage blog posts",
      icon: FileText,
      link: "/admin/marketing/blog",
      color: "text-purple-500"
    },
    {
      title: "Testimonials",
      description: "Review and publish customer testimonials",
      icon: MessageSquare,
      link: "/admin/marketing/testimonials",
      color: "text-orange-500"
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Marketing & SEO</h2>
        <p className="text-muted-foreground">Manage your marketing campaigns and search engine optimization</p>
      </div>

      {/* Stats Grid */}
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
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {quickActions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
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

      {/* Analytics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="font-medium">Organic Search</span>
              <span className="text-muted-foreground">8,234 visits</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="font-medium">Direct Traffic</span>
              <span className="text-muted-foreground">3,456 visits</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="font-medium">Social Media</span>
              <span className="text-muted-foreground">760 visits</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="font-medium">Referral</span>
              <span className="text-muted-foreground">234 visits</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
