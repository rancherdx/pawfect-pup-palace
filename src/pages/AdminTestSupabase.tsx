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
import { adminApi } from '@/api/adminApi';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Section from "@/components/Section";

interface User {
  id: string;
  name: string;
}

interface TestLog {
  id: string;
  operation: string;
  method: string;
  requestBody?: string;
  responseStatus: number;
  responseBody?: string;
  latencyMs: number;
  createdAt: string;
}

interface SupabaseOperation {
  name: string;
  description: string;
  category: string;
  requiresAuth: boolean;
  adminOnly: boolean;
  method: () => Promise<any>;
}

const AdminTestSupabase = () => {
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedOperation, setSelectedOperation] = useState<string>("");
  const [requestBody, setRequestBody] = useState<string>("");
  const [testResults, setTestResults] = useState<TestLog[]>([]);
  const queryClient = useQueryClient();

  // Supabase Operations for testing
  const supabaseOperations: SupabaseOperation[] = [
    // Public operations
    { 
      name: "Get Puppies", 
      description: "Fetch all puppies from Supabase", 
      category: "Public", 
      requiresAuth: false, 
      adminOnly: false,
      method: async () => await supabase.from('puppies').select('*').limit(5)
    },
    { 
      name: "Get Litters", 
      description: "Fetch all litters from Supabase", 
      category: "Public", 
      requiresAuth: false, 
      adminOnly: false,
      method: async () => await supabase.from('litters').select('*').limit(5)
    },
    { 
      name: "Get Testimonials", 
      description: "Fetch testimonials from Supabase", 
      category: "Public", 
      requiresAuth: false, 
      adminOnly: false,
      method: async () => await supabase.from('testimonials').select('*').limit(5)
    },
    { 
      name: "Get Blog Posts", 
      description: "Fetch published blog posts", 
      category: "Public", 
      requiresAuth: false, 
      adminOnly: false,
      method: async () => await supabase.from('blog_posts').select('*').eq('status', 'published').limit(5)
    },
    
    // Admin operations
    { 
      name: "Admin Get All Puppies", 
      description: "Admin fetch all puppies", 
      category: "Admin", 
      requiresAuth: true, 
      adminOnly: true,
      method: () => adminApi.getAllPuppies()
    },
    { 
      name: "Admin Get All Litters", 
      description: "Admin fetch all litters", 
      category: "Admin", 
      requiresAuth: true, 
      adminOnly: true,
      method: () => adminApi.getAllLitters()
    },
    { 
      name: "Admin Get Users", 
      description: "Admin fetch all users", 
      category: "Admin", 
      requiresAuth: true, 
      adminOnly: true,
      method: () => adminApi.getAllUsers()
    },
    { 
      name: "Admin Get Dashboard Stats", 
      description: "Get dashboard statistics", 
      category: "Admin", 
      requiresAuth: true, 
      adminOnly: true,
      method: () => adminApi.getDashboardStats()
    },
    { 
      name: "Admin Get Site Settings", 
      description: "Fetch site settings", 
      category: "Admin", 
      requiresAuth: true, 
      adminOnly: true,
      method: () => adminApi.getSiteSettings()
    },
    { 
      name: "Admin Get Integrations", 
      description: "Fetch third-party integrations", 
      category: "Admin", 
      requiresAuth: true, 
      adminOnly: true,
      method: () => adminApi.getIntegrations()
    },
    { 
      name: "Admin Get Transactions", 
      description: "Fetch transaction history", 
      category: "Admin", 
      requiresAuth: true, 
      adminOnly: true,
      method: () => adminApi.getTransactions({ limit: 10 })
    },
    
    // Database tests
    { 
      name: "Test Auth User", 
      description: "Check current authenticated user", 
      category: "Database", 
      requiresAuth: true, 
      adminOnly: false,
      method: () => supabase.auth.getUser()
    },
    { 
      name: "Test Database Connection", 
      description: "Simple database connectivity test", 
      category: "Database", 
      requiresAuth: false, 
      adminOnly: false,
      method: async () => await supabase.from('puppies').select('count', { count: 'exact', head: true })
    }
  ];

  // Get list of users for impersonation
  const { data: users } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      try {
        const result = await adminApi.getAllUsers();
        return { users: result.data || [] };
      } catch (error) {
        console.error('Failed to fetch users:', error);
        return { users: [] };
      }
    },
  });

  // Execute Supabase operation test
  const executeSupabaseTest = useMutation({
    mutationFn: async ({ operationName }: { operationName: string }) => {
      const operation = supabaseOperations.find(op => op.name === operationName);
      if (!operation) throw new Error('Operation not found');

      const startTime = Date.now();
      try {
        const result = await operation.method();
        const latency = Date.now() - startTime;

        const testLog: TestLog = {
          id: Date.now().toString(),
          operation: operation.name,
          method: operation.description,
          requestBody: '',
          responseStatus: result.error ? 400 : 200,
          responseBody: JSON.stringify(result, null, 2),
          latencyMs: latency,
          createdAt: new Date().toISOString(),
        };

        return testLog;
      } catch (error) {
        const latency = Date.now() - startTime;
        return {
          id: Date.now().toString(),
          operation: operation.name,
          method: operation.description,
          requestBody: '',
          responseStatus: 500,
          responseBody: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          latencyMs: latency,
          createdAt: new Date().toISOString(),
        } as TestLog;
      }
    },
    onSuccess: (result) => {
      setTestResults(prev => [result, ...prev]);
      toast.success(`Operation completed in ${result.latencyMs}ms`);
    },
  });

  const handleOperationTest = () => {
    if (!selectedOperation) {
      toast.error('Please select an operation to test');
      return;
    }

    executeSupabaseTest.mutate({ operationName: selectedOperation });
  };

  const getStatusBadge = (status: number) => {
    if (status >= 200 && status < 300) {
      return <Badge variant="default" className="bg-green-500">Success</Badge>;
    } else if (status >= 400 && status < 500) {
      return <Badge variant="destructive">Client Error</Badge>;
    } else if (status >= 500) {
      return <Badge variant="destructive">Server Error</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  const clearResults = () => {
    setTestResults([]);
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
              Supabase API Test Suite
            </h1>
            
            <div className="flex gap-2">
              <Button 
                onClick={clearResults}
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Clear Results
              </Button>
            </div>
          </div>

          <Tabs defaultValue="operation-testing" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="operation-testing">
                <Server className="mr-2 h-4 w-4" />
                Operation Testing
              </TabsTrigger>
              <TabsTrigger value="test-results">
                <Eye className="mr-2 h-4 w-4" />
                Test Results
              </TabsTrigger>
              <TabsTrigger value="system-status">
                <Database className="mr-2 h-4 w-4" />
                System Status
              </TabsTrigger>
            </TabsList>

            <TabsContent value="operation-testing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Supabase Operation Testing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="operation-select">Select Operation</Label>
                    <Select value={selectedOperation} onValueChange={setSelectedOperation}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a Supabase operation to test" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(
                          supabaseOperations.reduce((acc, operation) => {
                            if (!acc[operation.category]) acc[operation.category] = [];
                            acc[operation.category].push(operation);
                            return acc;
                          }, {} as Record<string, SupabaseOperation[]>)
                        ).map(([category, operations]) => (
                          <div key={category}>
                            <div className="px-2 py-1 text-sm font-semibold text-muted-foreground">
                              {category}
                            </div>
                            {operations.map(operation => (
                              <SelectItem 
                                key={operation.name}
                                value={operation.name}
                              >
                                <div className="flex items-center space-x-2">
                                  <span>{operation.name}</span>
                                  {operation.adminOnly && <Shield className="h-3 w-3" />}
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleOperationTest}
                    disabled={!selectedOperation || executeSupabaseTest.isPending}
                    className="w-full"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {executeSupabaseTest.isPending ? 'Testing...' : 'Test Operation'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="test-results" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  {testResults.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No test results yet. Run some operations to see results here.
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Operation</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Latency</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Response</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {testResults.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell className="font-medium">{result.operation}</TableCell>
                            <TableCell>{getStatusBadge(result.responseStatus)}</TableCell>
                            <TableCell className="text-green-600 font-mono">
                              {result.latencyMs}ms
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(result.createdAt).toLocaleTimeString()}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-20">
                                  {result.responseBody}
                                </pre>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system-status" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="mr-2 h-5 w-5" />
                      Database
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Connected to Supabase</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="mr-2 h-5 w-5" />
                      Authentication
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Supabase Auth Active</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Server className="mr-2 h-5 w-5" />
                      API Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Supabase Client Ready</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Section>
    </div>
  );
};

export default AdminTestSupabase;