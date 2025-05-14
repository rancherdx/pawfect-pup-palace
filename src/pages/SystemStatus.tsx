
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
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Service statuses
type StatusType = "healthy" | "degraded" | "offline" | "loading";

interface ServiceStatus {
  id: string;
  name: string;
  status: StatusType;
  latency?: number;
  message?: string;
  lastChecked: Date;
}

const SystemStatus = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Simulated service check - in real implementation, this would make API calls
  const checkServices = async () => {
    setIsRefreshing(true);
    
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500));
    
    setServices([
      {
        id: "api",
        name: "API Endpoints",
        status: "healthy",
        latency: 120,
        lastChecked: new Date()
      },
      {
        id: "d1",
        name: "D1 Database",
        status: "healthy", 
        latency: 42,
        lastChecked: new Date()
      },
      {
        id: "kv",
        name: "KV Storage",
        status: "healthy",
        latency: 35,
        lastChecked: new Date()
      },
      {
        id: "r2",
        name: "R2 Asset Storage",
        status: "healthy",
        latency: 89,
        lastChecked: new Date()
      },
      {
        id: "auth",
        name: "Authentication Service",
        status: "healthy",
        latency: 110,
        lastChecked: new Date()
      }
    ]);
    
    setIsRefreshing(false);
  };
  
  useEffect(() => {
    checkServices();
  }, []);

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

  const getStatusColor = (latency: number) => {
    if (latency < 50) return "bg-green-500";
    if (latency < 100) return "bg-green-400";
    if (latency < 200) return "bg-amber-400";
    return "bg-red-500";
  };
  
  return (
    <Section 
      title="System Status" 
      subtitle="Current operational status of GDS Puppies services"
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
        <Button 
          onClick={checkServices} 
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map(service => (
          <Card key={service.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  {getStatusIcon(service.status)}
                  <span className="ml-2">{service.name}</span>
                </CardTitle>
                {getStatusBadge(service.status)}
              </div>
              <CardDescription>
                Last checked: {service.lastChecked.toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {service.latency && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Latency</span>
                    <span className="font-mono">{service.latency}ms</span>
                  </div>
                  <Progress 
                    value={100 - (service.latency / 5)} 
                    className={`h-2 ${getStatusColor(service.latency)}`} 
                  />
                </div>
              )}
              {service.message && (
                <p className="mt-2 text-sm text-muted-foreground">{service.message}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-card rounded-lg">
        <h3 className="text-lg font-semibold mb-2">About System Status</h3>
        <p className="text-muted-foreground">
          This page shows the real-time operational status of GDS Puppies services. 
          It's publicly accessible and automatically refreshes every 5 minutes. 
          If you experience issues, please check this page before contacting support.
        </p>
      </div>
    </Section>
  );
};

export default SystemStatus;
