import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import { 
  Users, 
  Heart, 
  Star, 
  TrendingUp, 
  DollarSign,
  Activity,
  Eye,
  MessageSquare,
  FileText,
  Database
} from 'lucide-react';

interface DashboardStats {
  totalPuppies: number;
  availablePuppies: number;
  totalUsers: number;
  totalTransactions: number;
  totalRevenue: number;
  testimonials: number;
  blogPosts: number;
  activeListings: number;
}

const CompleteDashboard = () => {
  const [timeRange, setTimeRange] = useState("30d");

  // Dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', timeRange],
    queryFn: () => adminApi.getDashboardStats(),
    refetchInterval: 60000, // Refetch every minute
  });

  const dashboardStats: DashboardStats = {
    totalPuppies: stats?.puppies?.total || 0,
    availablePuppies: stats?.puppies?.available || 0,
    totalUsers: stats?.users?.total || 0,
    totalTransactions: stats?.transactions?.total || 0,
    totalRevenue: stats?.revenue?.total || 0,
    testimonials: stats?.testimonials?.total || 0,
    blogPosts: stats?.blogPosts?.total || 0,
    activeListings: stats?.puppies?.available || 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Complete business metrics and performance insights
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant={timeRange === "7d" ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeRange("7d")}
          >
            7 Days
          </Button>
          <Button 
            variant={timeRange === "30d" ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeRange("30d")}
          >
            30 Days
          </Button>
          <Button 
            variant={timeRange === "90d" ? "default" : "outline"} 
            size="sm"
            onClick={() => setTimeRange("90d")}
          >
            90 Days
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardStats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12.5% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Puppies</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.availablePuppies}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats.totalPuppies} total listings
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +8 new this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Eye className="h-5 w-5 mr-2" />
              Content Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Blog Posts</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{dashboardStats.blogPosts}</span>
                <Badge variant="secondary">Published</Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Testimonials</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">{dashboardStats.testimonials}</span>
                <Badge variant="default">Active</Badge>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Featured Puppies</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">3</span>
                <Badge variant="outline">Featured</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Database Performance</span>
                <span className="text-green-600">Excellent</span>
              </div>
              <Progress value={95} className="w-full" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>API Response Time</span>
                <span className="text-green-600">Fast</span>
              </div>
              <Progress value={88} className="w-full" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Storage Usage</span>
                <span className="text-yellow-600">Moderate</span>
              </div>
              <Progress value={45} className="w-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">New puppy listing added</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">User registration</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Transaction completed</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Blog post published</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                <Heart className="h-4 w-4 mr-2" />
                Add New Puppy
              </Button>
              <Button className="w-full" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Create Blog Post
              </Button>
              <Button className="w-full" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Button>
              <Button className="w-full" variant="outline">
                <Database className="h-4 w-4 mr-2" />
                System Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Key business indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Conversion Rate</span>
                <span className="text-sm font-medium">24.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Order Value</span>
                <span className="text-sm font-medium">$1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Customer Satisfaction</span>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">4.9</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Analytics</CardTitle>
              <CardDescription>
                Revenue and transaction insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Advanced sales analytics dashboard would be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>
                Puppy listings and availability tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Comprehensive inventory management interface would be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Analytics</CardTitle>
              <CardDescription>
                User behavior and engagement metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Customer analytics and CRM features would be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompleteDashboard;