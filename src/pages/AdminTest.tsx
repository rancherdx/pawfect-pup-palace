
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TestTube, 
  Send, 
  User, 
  Shield, 
  Database, 
  Server, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Clock,
  Eye,
  Settings
} from "lucide-react";
import { apiRequest } from '@/api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Section from "@/components/Section";

interface User {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

interface TestSession {
  id: string;
  adminUserId: string;
  impersonatedUserId?: string;
  testToken: string;
  sessionPurpose: string;
  expiresAt: string;
  isActive: boolean;
  createdAt: string;
}

interface TestLog {
  id: string;
  sessionId: string;
  endpoint: string;
  method: string;
  requestBody?: string;
  responseStatus: number;
  responseBody?: string;
  latencyMs: number;
  createdAt: string;
}

interface ApiEndpoint {
  path: string;
  method: string;
  description: string;
  category: string;
  requiresAuth: boolean;
  adminOnly: boolean;
}

const AdminTest = () => {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("");
  const [requestBody, setRequestBody] = useState<string>("");
  const [testResults, setTestResults] = useState<TestLog[]>([]);
  const [currentSession, setCurrentSession] = useState<TestSession | null>(null);
  const queryClient = useQueryClient();

  // API Endpoints for testing
  const apiEndpoints: ApiEndpoint[] = [
    // Public endpoints
    { path: "/api/puppies", method: "GET", description: "Get all puppies", category: "Public", requiresAuth: false, adminOnly: false },
    { path: "/api/litters", method: "GET", description: "Get all litters", category: "Public", requiresAuth: false, adminOnly: false },
    { path: "/api/stud-dogs", method: "GET", description: "Get all stud dogs", category: "Public", requiresAuth: false, adminOnly: false },
    { path: "/api/settings/public", method: "GET", description: "Get public settings", category: "Public", requiresAuth: false, adminOnly: false },
    
    // Auth endpoints
    { path: "/api/auth/login", method: "POST", description: "User login", category: "Auth", requiresAuth: false, adminOnly: false },
    { path: "/api/auth/register", method: "POST", description: "User registration", category: "Auth", requiresAuth: false, adminOnly: false },
    { path: "/api/auth/logout", method: "POST", description: "User logout", category: "Auth", requiresAuth: true, adminOnly: false },
    
    // User endpoints
    { path: "/api/users/me", method: "GET", description: "Get current user", category: "User", requiresAuth: true, adminOnly: false },
    { path: "/api/users/me/profile", method: "PUT", description: "Update user profile", category: "User", requiresAuth: true, adminOnly: false },
    { path: "/api/my-puppies", method: "GET", description: "Get user's puppies", category: "User", requiresAuth: true, adminOnly: false },
    
    // Admin endpoints
    { path: "/api/admin/users", method: "GET", description: "List all users", category: "Admin", requiresAuth: true, adminOnly: true },
    { path: "/api/admin/puppies", method: "POST", description: "Create puppy", category: "Admin", requiresAuth: true, adminOnly: true },
    { path: "/api/admin/litters", method: "POST", description: "Create litter", category: "Admin", requiresAuth: true, adminOnly: true },
    { path: "/api/admin/settings", method: "GET", description: "Get all settings", category: "Admin", requiresAuth: true, adminOnly: true },
    { path: "/api/admin/transactions", method: "GET", description: "Get transactions", category: "Admin", requiresAuth: true, adminOnly: true },
  ];

  // Generate new admin test session
  const generateTestSession = useMutation({
    mutationFn: async (purpose: string = 'endpoint_testing') => {
      return apiRequest<TestSession>('/admin/test-session', {
        method: 'POST',
        body: JSON.stringify({ purpose }),
      });
    },
    onSuccess: (session) => {
      setCurrentSession(session);
      toast.success('New test session generated');
    },
    onError: (error) => {
      toast.error(`Failed to generate test session: ${error.message}`);
    }
  });

  // Get list of users for impersonation
  const { data: users } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => apiRequest<{ users: User[] }>('/admin/users?limit=100'),
  });

  // Generate impersonation token
  const generateImpersonationToken = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest<TestSession>('/admin/test-session/impersonate', {
        method: 'POST',
        body: JSON.stringify({ userId, purpose: 'user_impersonation' }),
      });
    },
    onSuccess: (session) => {
      setCurrentSession(session);
      toast.success('Impersonation token generated');
    },
    onError: (error) => {
      toast.error(`Failed to generate impersonation token: ${error.message}`);
    }
  });

  // Execute API test
  const executeApiTest = useMutation({
    mutationFn: async ({ endpoint, method, body }: { endpoint: string; method: string; body?: string }) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Use test token if available
      if (currentSession?.testToken) {
        headers['Authorization'] = `Bearer ${currentSession.testToken}`;
      }

      const startTime = Date.now();
      try {
        const response = await fetch(endpoint, {
          method,
          headers,
          body: body ? JSON.stringify(JSON.parse(body)) : undefined,
        });

        const latency = Date.now() - startTime;
        const responseText = await response.text();
        let responseBody;
        try {
          responseBody = JSON.parse(responseText);
        } catch {
          responseBody = responseText;
        }

        const result: TestLog = {
          id: Date.now().toString(),
          sessionId: currentSession?.id || 'no-session',
          endpoint,
          method,
          requestBody: body,
          responseStatus: response.status,
          responseBody: JSON.stringify(responseBody, null, 2),
          latencyMs: latency,
          createdAt: new Date().toISOString(),
        };

        return result;
      } catch (error) {
        const latency = Date.now() - startTime;
        return {
          id: Date.now().toString(),
          sessionId: currentSession?.id || 'no-session',
          endpoint,
          method,
          requestBody: body,
          responseStatus: 0,
          responseBody: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          latencyMs: latency,
          createdAt: new Date().toISOString(),
        } as TestLog;
      }
    },
    onSuccess: (result) => {
      setTestResults(prev => [result, ...prev]);
      toast.success(`API test completed in ${result.latencyMs}ms`);
    },
  });

  // Auto-generate session on component mount
  useEffect(() => {
    if (!currentSession) {
      generateTestSession.mutate('admin_dashboard_testing');
    }
  }, []);

  const handleEndpointTest = () => {
    if (!selectedEndpoint) {
      toast.error('Please select an endpoint to test');
      return;
    }

    const endpoint = apiEndpoints.find(ep => `${ep.method} ${ep.path}` === selectedEndpoint);
    if (!endpoint) return;

    executeApiTest.mutate({
      endpoint: endpoint.path,
      method: endpoint.method,
      body: requestBody || undefined,
    });
  };

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return <Badge variant="default" className="bg-green-500">Success</Badge>;
    } else if (status >= 400 && status < 500) {
      return <Badge variant="destructive">Client Error</Badge>;
    } else if (status >= 500) {
      return <Badge variant="destructive">Server Error</Badge>;
    } else if (status === 0) {
      return <Badge variant="outline">Network Error</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black/95 paw-print-bg">
      <Section className="py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold flex items-center">
              <span className="bg-brand-red text-white p-2 rounded-full mr-3">
                <TestTube className="h-6 w-6" />
              </span>
              Admin Test Suite
            </h1>
            
            <div className="flex gap-2">
              <Button 
                onClick={() => generateTestSession.mutate('manual_testing')}
                disabled={generateTestSession.isPending}
                variant="outline"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${generateTestSession.isPending ? 'animate-spin' : ''}`} />
                New Session
              </Button>
            </div>
          </div>

          {/* Session Status */}
          {currentSession && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Current Test Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <Label>Session ID</Label>
                    <p className="font-mono">{currentSession.id}</p>
                  </div>
                  <div>
                    <Label>Purpose</Label>
                    <p>{currentSession.sessionPurpose}</p>
                  </div>
                  <div>
                    <Label>Expires</Label>
                    <p>{new Date(currentSession.expiresAt).toLocaleString()}</p>
                  </div>
                </div>
                {currentSession.impersonatedUserId && (
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <p className="text-amber-800 dark:text-amber-200">
                      <User className="inline mr-2 h-4 w-4" />
                      Currently impersonating user: {currentSession.impersonatedUserId}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="endpoint-testing" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="endpoint-testing">
                <Server className="mr-2 h-4 w-4" />
                Endpoint Testing
              </TabsTrigger>
              <TabsTrigger value="user-impersonation">
                <User className="mr-2 h-4 w-4" />
                User Impersonation
              </TabsTrigger>
              <TabsTrigger value="test-results">
                <Eye className="mr-2 h-4 w-4" />
                Test Results
              </TabsTrigger>
              <TabsTrigger value="system-checks">
                <Database className="mr-2 h-4 w-4" />
                System Checks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="endpoint-testing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Endpoint Testing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="endpoint-select">Select Endpoint</Label>
                    <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an API endpoint to test" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(
                          apiEndpoints.reduce((acc, endpoint) => {
                            if (!acc[endpoint.category]) acc[endpoint.category] = [];
                            acc[endpoint.category].push(endpoint);
                            return acc;
                          }, {} as Record<string, ApiEndpoint[]>)
                        ).map(([category, endpoints]) => (
                          <div key={category}>
                            <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                              {category}
                            </div>
                            {endpoints.map(endpoint => (
                              <SelectItem 
                                key={`${endpoint.method} ${endpoint.path}`}
                                value={`${endpoint.method} ${endpoint.path}`}
                              >
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs">
                                    {endpoint.method}
                                  </Badge>
                                  <span>{endpoint.path}</span>
                                  {endpoint.adminOnly && <Shield className="h-3 w-3" />}
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedEndpoint && (
                    <div>
                      <Label htmlFor="request-body">Request Body (JSON)</Label>
                      <Textarea
                        id="request-body"
                        placeholder='{"key": "value"}'
                        value={requestBody}
                        onChange={(e) => setRequestBody(e.target.value)}
                        className="font-mono"
                        rows={6}
                      />
                    </div>
                  )}

                  <Button 
                    onClick={handleEndpointTest}
                    disabled={!selectedEndpoint || executeApiTest.isPending}
                    className="w-full"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {executeApiTest.isPending ? 'Testing...' : 'Test Endpoint'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="user-impersonation" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Impersonation Testing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="user-select">Select User to Impersonate</Label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a user to impersonate for testing" />
                      </SelectTrigger>
                      <SelectContent>
                        {users?.users?.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center space-x-2">
                              <span>{user.name || user.email}</span>
                              <div className="flex space-x-1">
                                {user.roles.map(role => (
                                  <Badge key={role} variant="outline" className="text-xs">
                                    {role}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={() => selectedUser && generateImpersonationToken.mutate(selectedUser)}
                    disabled={!selectedUser || generateImpersonationToken.isPending}
                    className="w-full"
                  >
                    <User className="mr-2 h-4 w-4" />
                    {generateImpersonationToken.isPending ? 'Generating...' : 'Generate Impersonation Token'}
                  </Button>

                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      ⚠️ <strong>Security Note:</strong> Impersonation tokens are session-limited, 
                      expire automatically, and are only valid for testing purposes. All impersonation 
                      activities are logged for security auditing.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="test-results" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Endpoint</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Latency</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {testResults.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                              No test results yet. Run some endpoint tests to see results here.
                            </TableCell>
                          </TableRow>
                        ) : (
                          testResults.slice(0, 10).map((result) => (
                            <TableRow key={result.id}>
                              <TableCell className="text-xs">
                                {new Date(result.createdAt).toLocaleTimeString()}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{result.method}</Badge>
                              </TableCell>
                              <TableCell className="font-mono text-sm">{result.endpoint}</TableCell>
                              <TableCell>{getStatusBadge(result.responseStatus)}</TableCell>
                              <TableCell>{result.latencyMs}ms</TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system-checks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Health Checks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      System health checks will be available here.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      This will include database connectivity, API response times, and service status.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </Section>
    </div>
  );
};

export default AdminTest;
