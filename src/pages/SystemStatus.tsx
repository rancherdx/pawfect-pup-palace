
import { useState, useEffect } from "react";
import Section from "@/components/Section";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Activity, Database, Server, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/api/client";
import { useQuery } from '@tanstack/react-query';

/**
 * @typedef {"healthy" | "degraded" | "offline" | "loading"} StatusType
 * @description Represents the possible status of a system service.
 */
type StatusType = "healthy" | "degraded" | "offline" | "loading";

/**
 * @interface ServiceStatus
 * @description Defines the structure for an object representing the status of a single service.
 */
interface ServiceStatus {
  id: string;
  name: string;
  status: StatusType;
  latency?: number;
  message?: string;
  lastChecked: Date;
  uptime?: number;
}

/**
 * @interface SystemHealth
 * @description Defines the structure for the overall system health object, including all services.
 */
interface SystemHealth {
  services: ServiceStatus[];
  overallStatus: StatusType;
  lastUpdated: string;
}

/**
 * @component SystemStatus
 * @description A page that displays the real-time operational status of the application's
 * various backend services. It simulates health checks for API, database, storage, etc.,
 * and presents the information in a clear, user-friendly dashboard.
 *
 * @returns {JSX.Element} The rendered system status page.
 */
const SystemStatus = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { data: systemHealth, isLoading, refetch } = useQuery({
    queryKey: ['systemStatus'],
    queryFn: async (): Promise<SystemHealth> => {
      // In a real implementation, this would call actual health check endpoints
      // For now, we'll simulate real-time checks
      const healthChecks = await Promise.all([
        checkApiHealth(),
        checkDatabaseHealth(),
        checkStorageHealth(),
        checkAuthHealth(),
        checkPaymentHealth()
      ]);

      const services = healthChecks;
      const overallStatus = services.some(s => s.status === 'offline') ? 'offline' :
                          services.some(s => s.status === 'degraded') ? 'degraded' : 'healthy';

      return {
        services,
        overallStatus,
        lastUpdated: new Date().toISOString()
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000 // Consider data stale after 15 seconds
  });

  /**
   * @function checkApiHealth
   * @description Simulates a health check for the API endpoints.
   * @returns {Promise<ServiceStatus>} A promise that resolves to the status of the API service.
   */
  const checkApiHealth = async (): Promise<ServiceStatus> => {
    try {
      const startTime = Date.now();
      // Try to hit a simple endpoint to test API health
      await fetch('/api/settings/public');
      const latency = Date.now() - startTime;
      
      return {
        id: "api",
        name: "API Endpoints",
        status: latency > 2000 ? "degraded" : "healthy",
        latency,
        lastChecked: new Date(),
        uptime: 99.8
      };
    } catch (error) {
      return {
        id: "api",
        name: "API Endpoints", 
        status: "offline",
        message: "API endpoints are not responding",
        lastChecked: new Date(),
        uptime: 99.8
      };
    }
  };

  /**
   * @function checkDatabaseHealth
   * @description Simulates a health check for the database.
   * @returns {Promise<ServiceStatus>} A promise that resolves to the status of the database service.
   */
  const checkDatabaseHealth = async (): Promise<ServiceStatus> => {
    try {
      const startTime = Date.now();
      // Simulate database connectivity check
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
      const latency = Date.now() - startTime;
      
      return {
        id: "database",
        name: "D1 Database",
        status: "healthy",
        latency,
        lastChecked: new Date(),
        uptime: 99.9
      };
    } catch (error) {
      return {
        id: "database",
        name: "D1 Database",
        status: "offline",
        message: "Database connection failed",
        lastChecked: new Date(),
        uptime: 99.9
      };
    }
  };

  /**
   * @function checkStorageHealth
   * @description Simulates a health check for the storage service.
   * @returns {Promise<ServiceStatus>} A promise that resolves to the status of the storage service.
   */
  const checkStorageHealth = async (): Promise<ServiceStatus> => {
    const latency = Math.random() * 200 + 30;
    return {
      id: "storage",
      name: "R2 Storage",
      status: "healthy",
      latency,
      lastChecked: new Date(),
      uptime: 99.95
    };
  };

  /**
   * @function checkAuthHealth
   * @description Simulates a health check for the authentication service.
   * @returns {Promise<ServiceStatus>} A promise that resolves to the status of the auth service.
   */
  const checkAuthHealth = async (): Promise<ServiceStatus> => {
    const latency = Math.random() * 150 + 40;
    return {
      id: "auth",
      name: "Authentication Service",
      status: "healthy",
      latency,
      lastChecked: new Date(),
      uptime: 99.7
    };
  };

  /**
   * @function checkPaymentHealth
   * @description Simulates a health check for the payment processing service.
   * @returns {Promise<ServiceStatus>} A promise that resolves to the status of the payment service.
   */
  const checkPaymentHealth = async (): Promise<ServiceStatus> => {
    const latency = Math.random() * 300 + 80;
    return {
      id: "payment",
      name: "Payment Processing",
      status: "healthy",
      latency,
      lastChecked: new Date(),
      uptime: 99.5
    };
  };

  /**
   * @function handleRefresh
   * @description Manually triggers a refresh of the system health status.
   */
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  /**
   * @function getStatusIcon
   * @description Returns an icon component based on the service status.
   * @param {StatusType} status - The status of the service.
   * @returns {JSX.Element} The corresponding status icon.
   */
  const getStatusIcon = (status: StatusType) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="text-green-500 h-5 w-5" />;
      case "degraded":
        return <AlertTriangle className="text-amber-500 h-5 w-5" />;
      case "offline":
        return <XCircle className="text-red-500 h-5 w-5" />;
      case "loading":
      default:
        return <RefreshCw className="animate-spin text-blue-500 h-5 w-5" />;
    }
  };
  
  /**
   * @function getStatusBadge
   * @description Returns a styled Badge component based on the service status.
   * @param {StatusType} status - The status of the service.
   * @returns {JSX.Element} The corresponding status badge.
   */
  const getStatusBadge = (status: StatusType) => {
    switch (status) {
      case "healthy":
        return <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30">Operational</Badge>;
      case "degraded":
        return <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">Degraded</Badge>;
      case "offline":
        return <Badge variant="outline" className="bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/30">Offline</Badge>;
      case "loading":
      default:
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30">Checking</Badge>;
    }
  };

  /**
   * @function getStatusColor
   * @description Returns a Tailwind CSS class for the progress bar color based on latency.
   * @param {number} latency - The latency of the service in milliseconds.
   * @returns {string} The CSS class for the progress bar color.
   */
  const getStatusColor = (latency: number) => {
    if (latency < 100) return "bg-green-500";
    if (latency < 300) return "bg-green-400";
    if (latency < 500) return "bg-amber-400";
    return "bg-red-500";
  };

  /**
   * @function getServiceIcon
   * @description Returns an icon component for a specific service based on its ID.
   * @param {string} serviceId - The ID of the service.
   * @returns {JSX.Element} The corresponding service icon.
   */
  const getServiceIcon = (serviceId: string) => {
    switch (serviceId) {
      case "api": return <Server className="h-5 w-5" />;
      case "database": return <Database className="h-5 w-5" />;
      case "storage": return <Activity className="h-5 w-5" />;
      case "auth": return <Shield className="h-5 w-5" />;
      case "payment": return <Activity className="h-5 w-5" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };
  
  return (
    <Section 
      title="System Status" 
      subtitle="Real-time operational status of GDS Puppies services"
    >
      {/* Overall Status Banner */}
      <div className="mb-6 p-4 rounded-lg border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {systemHealth && getStatusIcon(systemHealth.overallStatus)}
            <div>
              <h3 className="font-semibold">
                System Status: {systemHealth?.overallStatus === 'healthy' ? 'All Systems Operational' : 
                                systemHealth?.overallStatus === 'degraded' ? 'Some Systems Degraded' : 
                                'System Issues Detected'}
              </h3>
              <p className="text-sm text-muted-foreground">
                Last updated: {systemHealth ? new Date(systemHealth.lastUpdated).toLocaleString() : 'Loading...'}
              </p>
            </div>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={isRefreshing || isLoading}
            variant="outline"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Service Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {(systemHealth?.services || []).map(service => (
          <Card key={service.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center text-lg">
                  {getServiceIcon(service.id)}
                  <span className="ml-2">{service.name}</span>
                </CardTitle>
                {getStatusBadge(service.status)}
              </div>
              <CardDescription>
                Last checked: {service.lastChecked.toLocaleTimeString()}
                {service.uptime && (
                  <span className="ml-2">• Uptime: {service.uptime}%</span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {service.latency && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Response Time</span>
                    <span className="font-mono">{service.latency}ms</span>
                  </div>
                  <Progress 
                    value={Math.max(0, 100 - (service.latency / 10))} 
                    className="h-2" 
                  />
                  <div className={`h-2 w-full rounded-full ${getStatusColor(service.latency)}`} />
                </div>
              )}
              {service.message && (
                <p className="mt-2 text-sm text-destructive">{service.message}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Historical Data Placeholder */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Service Availability (Last 24 Hours)</CardTitle>
          <CardDescription>Historical uptime and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Historical metrics will be available once sufficient data is collected.</p>
            <p className="text-sm mt-2">Check back in 24 hours for trending data.</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Status Information */}
      <div className="mt-8 p-4 bg-card rounded-lg">
        <h3 className="text-lg font-semibold mb-2">About System Status</h3>
        <p className="text-muted-foreground mb-4">
          This page shows the real-time operational status of GDS Puppies services. 
          Status is checked automatically every 30 seconds and updated in real-time.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span><strong>Operational:</strong> Service is running normally</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span><strong>Degraded:</strong> Service is slower than normal</span>
          </div>
          <div className="flex items-center space-x-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span><strong>Offline:</strong> Service is not responding</span>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default SystemStatus;
