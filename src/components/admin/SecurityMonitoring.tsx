import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, AlertTriangle, Users, Activity, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminAPI } from '@/api';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SecurityEvent {
  id: string;
  user_id: string | null;
  event_type: string;
  event_data: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface SecurityStats {
  failed_logins_24h: number;
  role_changes_7d: number;
  total_active_sessions: number;
  suspicious_activities_24h: number;
}

const SecurityMonitoring: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { data: securityEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ['securityEvents', refreshTrigger],
    queryFn: () => fetchAdminAPI('/api/admin/security/events?limit=50'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: securityStats, isLoading: statsLoading } = useQuery({
    queryKey: ['securityStats', refreshTrigger],
    queryFn: () => fetchAdminAPI('/api/admin/security/stats'),
    refetchInterval: 60000, // Refresh every minute
  });

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'login_failed':
      case 'suspicious_activity':
        return 'destructive';
      case 'role_change':
      case 'privilege_escalation_attempt':
        return 'secondary';
      case 'data_access':
        return 'outline';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center text-gray-800 dark:text-white">
          <Shield className="mr-3 h-7 w-7 text-brand-red" />
          Security Monitoring
        </h2>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Security Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Failed Logins (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">
                {statsLoading ? '...' : securityStats?.failed_logins_24h || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Role Changes (7d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">
                {statsLoading ? '...' : securityStats?.role_changes_7d || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {statsLoading ? '...' : securityStats?.total_active_sessions || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Suspicious Activity (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold">
                {statsLoading ? '...' : securityStats?.suspicious_activities_24h || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="text-center py-4">Loading security events...</div>
          ) : securityEvents?.events?.length === 0 ? (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                No security events recorded. This is good - your system appears secure!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents?.events?.map((event: SecurityEvent) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Badge variant={getEventTypeColor(event.event_type)}>
                          {event.event_type.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {event.user_id ? event.user_id.substring(0, 8) + '...' : 'Anonymous'}
                      </TableCell>
                      <TableCell>{event.ip_address || 'N/A'}</TableCell>
                      <TableCell className="text-sm">
                        {formatDate(event.created_at)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm">
                        {event.event_data ? JSON.stringify(event.event_data).substring(0, 50) + '...' : 'No details'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Notice:</strong> This page shows security-related events for monitoring purposes. 
          All data is logged in compliance with privacy policies and is only accessible to administrators.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SecurityMonitoring;