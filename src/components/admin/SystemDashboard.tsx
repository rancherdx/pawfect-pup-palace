import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from '@tanstack/react-query';
import { 
  Activity, 
  Database, 
  Server, 
  Users, 
  FileText, 
  Image, 
  Shield,
  TrendingUp,
  HardDrive,
  Cpu
} from 'lucide-react';

/**
 * @interface SystemStats
 * @description Defines the structure for the system statistics object.
 */
interface SystemStats {
  totalPuppies: number;
  totalLitters: number;
  totalUsers: number;
  totalTransactions: number;
  storageUsed: number;
  storageTotal: number;
  uptime: string;
  lastBackup: string;
}

/**
 * @component SystemDashboard
 * @description A dashboard component that displays key metrics and statistics about the system's health,
 * performance, and resource usage.
 * @returns {React.ReactElement} The rendered system dashboard.
 */
const SystemDashboard = () => {
  // System statistics
  const { data: systemStats, isLoading } = useQuery({
    queryKey: ['system-stats'],
    queryFn: async (): Promise<SystemStats> => {
      // This would be replaced with actual API calls
      return {
        totalPuppies: 85,
        totalLitters: 12,
        totalUsers: 125,
        totalTransactions: 347,
        storageUsed: 2.4,
        storageTotal: 10,
        uptime: "99.9%",
        lastBackup: new Date().toISOString()
      };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const storagePercentage = systemStats ? (systemStats.storageUsed / systemStats.storageTotal) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor system health, performance, and resources
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Activity className="h-4 w-4 mr-2" />
            View Logs
          </Button>
          <Button variant="outline" size="sm">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Puppies</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalPuppies || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active listings
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalTransactions || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total completed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.uptime || '0%'}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HardDrive className="h-5 w-5 mr-2" />
              Storage Usage
            </CardTitle>
            <CardDescription>
              Current storage utilization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Used: {systemStats?.storageUsed || 0} GB</span>
              <span>Total: {systemStats?.storageTotal || 0} GB</span>
            </div>
            <Progress value={storagePercentage} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{storagePercentage.toFixed(1)}% used</span>
              <span>{(systemStats?.storageTotal || 0) - (systemStats?.storageUsed || 0)} GB free</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Database Status
            </CardTitle>
            <CardDescription>
              Database health and performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Connection Status</span>
              <Badge variant="default" className="bg-green-500">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Query Performance</span>
              <Badge variant="default" className="bg-green-500">Optimal</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Last Backup</span>
              <span className="text-xs text-muted-foreground">
                {systemStats?.lastBackup ? new Date(systemStats.lastBackup).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tables</span>
              <Badge variant="outline">17 Active</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            System Activity
          </CardTitle>
          <CardDescription>
            Recent system events and operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Database indexes optimized</span>
              </div>
              <span className="text-xs text-muted-foreground">2 minutes ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">New user registration</span>
              </div>
              <span className="text-xs text-muted-foreground">15 minutes ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Backup completed successfully</span>
              </div>
              <span className="text-xs text-muted-foreground">1 hour ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">New puppy listing added</span>
              </div>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemDashboard;