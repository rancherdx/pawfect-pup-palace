import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dog, Heart, Layers, Eye, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function PuppyManagerOverview() {
  const stats = [
    { label: "Total Puppies", value: "45", icon: Dog, link: "/admin/puppy-manager/puppies" },
    { label: "Active Litters", value: "8", icon: Layers, link: "/admin/puppy-manager/litters" },
    { label: "Registered Parents", value: "12", icon: Heart, link: "/admin/puppy-manager/parents" },
    { label: "Visible Puppies", value: "38", icon: Eye, link: "/admin/puppy-manager/puppies" },
  ];

  const topPuppies = [
    { name: "Max", breed: "Golden Retriever", views: 1245, link: "/puppy/max" },
    { name: "Bella", breed: "Labrador", views: 1089, link: "/puppy/bella" },
    { name: "Charlie", breed: "German Shepherd", views: 987, link: "/puppy/charlie" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Puppy Manager</h2>
        <p className="text-muted-foreground">Overview of puppies, litters, and parent dogs</p>
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
            <Link to={stat.link}>
              <Card className="hover:shadow-lg transition-all cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Top Viewed Puppies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Viewed Puppies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPuppies.map((puppy, index) => (
              <div key={puppy.name} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{puppy.name}</p>
                    <p className="text-sm text-muted-foreground">{puppy.breed}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{puppy.views.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/admin/puppy-manager/parents">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Manage Parents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Add and manage parent dogs for breeding</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/puppy-manager/litters">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-blue-500" />
                Manage Litters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Organize puppies into litters with birth dates</p>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/puppy-manager/puppies">
          <Card className="hover:shadow-lg transition-all cursor-pointer hover:border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dog className="h-5 w-5 text-purple-500" />
                Manage Puppies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Add, edit, and manage all puppy listings</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
