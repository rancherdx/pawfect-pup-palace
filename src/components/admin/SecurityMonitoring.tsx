import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Shield, 
  AlertTriangle, 
  Eye, 
  Ban, 
  Activity, 
  Lock,
  RefreshCw,
  Download,
  Settings
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SecurityMetrics {
  total_requests_24h: number;
  blocked_requests_24h: number;
  suspicious_activity_24h: number;
  failed_logins_24h: number;
  active_sessions: number;
  rate_limit_violations: number;
}

interface SecurityEvent {
  id: string;
  event_type: 'failed_login' | 'rate_limit' | 'suspicious_activity' | 'blocked_request';
  ip_address: string;
  user_agent: string;
  timestamp: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SecuritySettings {
  rate_limiting_enabled: boolean;
  max_requests_per_minute: number;
  ip_blocking_enabled: boolean;
  suspicious_activity_detection: boolean;
  login_attempt_limit: number;
  session_timeout_minutes: number;
}

const SecurityMonitoring = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['security-metrics'],
    queryFn: () => adminApi.getSecurityMetrics(),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 30000,
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['security-events'],
    queryFn: () => adminApi.getSecurityEvents(),
    refetchInterval: 60000, // Refresh every minute
    staleTime: 60000,
  });

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['security-settings'],
    queryFn: () => adminApi.getSecuritySettings(),
    staleTime: 5 * 60 * 1000,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: Partial<SecuritySettings>) => 
      adminApi.updateSecuritySettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-settings'] });
      toast.success('Security settings updated successfully!');
    },
    onError: (err: Error) => {
      toast.error(`Failed to update security settings: ${err.message}`);
    }
  });

  const blockIPMutation = useMutation({
    mutationFn: (ipAddress: string) => adminApi.blockIP(ipAddress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-events'] });
      toast.success('IP address blocked successfully!');
    },
    onError: (err: Error) => {
      toast.error(`Failed to block IP: ${err.message}`);
    }
  });

  const exportLogsMutation = useMutation({
    mutationFn: (dateRange: { start: string; end: string }) => 
      adminApi.exportSecurityLogs(dateRange),
    onSuccess: (data) => {
      // Create and download file
      const blob = new Blob([data.csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Security logs exported successfully!');
    },
    onError: (err: Error) => {
      toast.error(`Failed to export logs: ${err.message}`);
    }
  });

  const securityMetrics: SecurityMetrics = metrics || {
    total_requests_24h: 0,
    blocked_requests_24h: 0,
    suspicious_activity_24h: 0,
    failed_logins_24h: 0,
    active_sessions: 0,
    rate_limit_violations: 0,
  };

  const securityEvents: SecurityEvent[] = events || [];
  const securitySettings: SecuritySettings = settings || {
    rate_limiting_enabled: true,
    max_requests_per_minute: 100,
    ip_blocking_enabled: true,
    suspicious_activity_detection: true,
    login_attempt_limit: 5,
    session_timeout_minutes: 60,
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getEventTypeIcon = (eventType: string) => {
    const icons = {
      failed_login: Ban,
      rate_limit: Activity,
      suspicious_activity: AlertTriangle,
      blocked_request: Shield
    };
    const Icon = icons[eventType as keyof typeof icons] || AlertTriangle;
    return <Icon className="h-4 w-4" />;
  };

  const handleSettingToggle = (setting: keyof SecuritySettings, value: boolean | number) => {
    updateSettingsMutation.mutate({ [setting]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold flex items-center">
          <Shield className="mr-2 h-6 w-6" />
          Security Monitoring
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['security-metrics'] });
              queryClient.invalidateQueries({ queryKey: ['security-events'] });
            }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => exportLogsMutation.mutate({
              start: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
              end: new Date().toISOString()
            })}
            disabled={exportLogsMutation.isPending}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Logs
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Security Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{securityMetrics.total_requests_24h}</div>
                    <p className="text-sm text-muted-foreground">Total Requests (24h)</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-600">{securityMetrics.blocked_requests_24h}</div>
                    <p className="text-sm text-muted-foreground">Blocked Requests (24h)</p>
                  </div>
                  <Ban className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{securityMetrics.suspicious_activity_24h}</div>
                    <p className="text-sm text-muted-foreground">Suspicious Activity (24h)</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{securityMetrics.failed_logins_24h}</div>
                    <p className="text-sm text-muted-foreground">Failed Logins (24h)</p>
                  </div>
                  <Lock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{securityMetrics.active_sessions}</div>
                    <p className="text-sm text-muted-foreground">Active Sessions</p>
                  </div>
                  <Eye className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold">{securityMetrics.rate_limit_violations}</div>
                    <p className="text-sm text-muted-foreground">Rate Limit Violations</p>
                  </div>
                  <Activity className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Security Events */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getEventTypeIcon(event.event_type)}
                      <div>
                        <p className="font-medium">{event.event_type.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.ip_address} • {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(event.severity)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => blockIPMutation.mutate(event.ip_address)}
                        disabled={blockIPMutation.isPending}
                      >
                        Block IP
                      </Button>
                    </div>
                  </div>
                ))}
                {securityEvents.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No security events in the last 24 hours
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Security Events</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        No security events found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    securityEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEventTypeIcon(event.event_type)}
                            {event.event_type.replace('_', ' ').toUpperCase()}
                          </div>
                        </TableCell>
                        <TableCell className="font-mono">{event.ip_address}</TableCell>
                        <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{getSeverityBadge(event.severity)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => blockIPMutation.mutate(event.ip_address)}
                            disabled={blockIPMutation.isPending}
                          >
                            Block IP
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Rate Limiting</h4>
                  <p className="text-sm text-muted-foreground">
                    Automatically block IPs that exceed request limits
                  </p>
                </div>
                <Switch
                  checked={securitySettings.rate_limiting_enabled}
                  onCheckedChange={(checked) => handleSettingToggle('rate_limiting_enabled', checked)}
                  disabled={updateSettingsMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">IP Blocking</h4>
                  <p className="text-sm text-muted-foreground">
                    Enable automatic IP blocking for suspicious activity
                  </p>
                </div>
                <Switch
                  checked={securitySettings.ip_blocking_enabled}
                  onCheckedChange={(checked) => handleSettingToggle('ip_blocking_enabled', checked)}
                  disabled={updateSettingsMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Suspicious Activity Detection</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor and flag potentially malicious behavior
                  </p>
                </div>
                <Switch
                  checked={securitySettings.suspicious_activity_detection}
                  onCheckedChange={(checked) => handleSettingToggle('suspicious_activity_detection', checked)}
                  disabled={updateSettingsMutation.isPending}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Max Requests/Minute</label>
                  <input
                    type="number"
                    value={securitySettings.max_requests_per_minute}
                    onChange={(e) => handleSettingToggle('max_requests_per_minute', parseInt(e.target.value))}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    min="1"
                    max="1000"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Login Attempt Limit</label>
                  <input
                    type="number"
                    value={securitySettings.login_attempt_limit}
                    onChange={(e) => handleSettingToggle('login_attempt_limit', parseInt(e.target.value))}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    min="1"
                    max="20"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={securitySettings.session_timeout_minutes}
                    onChange={(e) => handleSettingToggle('session_timeout_minutes', parseInt(e.target.value))}
                    className="w-full mt-1 px-3 py-2 border rounded-md"
                    min="5"
                    max="480"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityMonitoring;