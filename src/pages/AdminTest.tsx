
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Section from "@/components/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Check, AlertTriangle } from "lucide-react";

// Super Admin usernames
const SUPER_ADMINS = ["gsawyer", "drancher"];
const DEFAULT_PASSWORD = "Password123$Puppies";

// Test endpoints
const TEST_ENDPOINTS = [
  { name: "Login API", url: "/api/login", method: "POST" },
  { name: "Register API", url: "/api/register", method: "POST" },
  { name: "Puppies List", url: "/api/puppies", method: "GET" },
  { name: "Litters List", url: "/api/litters", method: "GET" },
  { name: "User Details", url: "/api/user", method: "GET" },
  { name: "D1 Database", url: "/api/test/database", method: "GET" },
  { name: "KV Storage", url: "/api/test/kv", method: "GET" },
  { name: "R2 Storage", url: "/api/test/r2", method: "GET" },
];

interface HeaderField {
  name: string;
  value: string;
}

interface TestResult {
  endpoint: string;
  status: "success" | "error" | "loading";
  statusCode?: number;
  responseTime?: number;
  error?: string;
  response?: any;
}

const AdminTest = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [passwordChangeData, setPasswordChangeData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [selectedEndpoint, setSelectedEndpoint] = useState(TEST_ENDPOINTS[0].url);
  const [selectedMethod, setSelectedMethod] = useState(TEST_ENDPOINTS[0].method);
  const [customHeaders, setCustomHeaders] = useState<HeaderField[]>([
    { name: "Content-Type", value: "application/json" },
  ]);
  const [requestBody, setRequestBody] = useState("");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTest, setIsRunningTest] = useState(false);
  
  // Check if user is super admin
  const isSuperAdmin = user && SUPER_ADMINS.includes(user.name.toLowerCase());
  
  // Check if this is first login with default password
  useEffect(() => {
    if (isAuthenticated && user) {
      // In a real implementation, this would be part of the auth response
      // Here we're just simulating first login detection
      const hasSetCustomPassword = localStorage.getItem(`${user.id}-password-changed`);
      setIsFirstLogin(!hasSetCustomPassword);
    }
  }, [isAuthenticated, user]);
  
  // Redirect if not authenticated or not super admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/admin-test" } });
      toast({
        title: "Authentication Required",
        description: "You need to login as a super admin to access this page.",
        variant: "destructive",
      });
    } else if (isAuthenticated && user && !isSuperAdmin) {
      navigate("/dashboard");
      toast({
        title: "Access Denied",
        description: "Only super administrators can access this page.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, isSuperAdmin, navigate]);

  // Handle password change
  const handlePasswordChange = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordChangeData;
    
    // Validation
    if (currentPassword !== DEFAULT_PASSWORD) {
      toast({
        title: "Incorrect Password",
        description: "The current password you entered is incorrect.",
        variant: "destructive",
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Your new password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }
    
    // Password strength validation
    if (newPassword.length < 12) {
      toast({
        title: "Password Too Short",
        description: "Your password must be at least 12 characters long.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real implementation, this would call an API endpoint
    // Here we're just simulating the password change
    localStorage.setItem(`${user!.id}-password-changed`, "true");
    
    toast({
      title: "Password Changed",
      description: "Your password has been successfully updated.",
    });
    
    setIsFirstLogin(false);
  };
  
  // Add custom header field
  const addHeaderField = () => {
    setCustomHeaders([...customHeaders, { name: "", value: "" }]);
  };
  
  // Update custom header field
  const updateHeaderField = (index: number, field: "name" | "value", value: string) => {
    const updatedHeaders = [...customHeaders];
    updatedHeaders[index][field] = value;
    setCustomHeaders(updatedHeaders);
  };
  
  // Remove custom header field
  const removeHeaderField = (index: number) => {
    const updatedHeaders = [...customHeaders];
    updatedHeaders.splice(index, 1);
    setCustomHeaders(updatedHeaders);
  };
  
  // Run the API test
  const runTest = async () => {
    setIsRunningTest(true);
    
    // Prepare headers
    const headers: Record<string, string> = {};
    customHeaders.forEach(header => {
      if (header.name && header.value) {
        headers[header.name] = header.value;
      }
    });
    
    // Create a new test result
    const newResult: TestResult = {
      endpoint: selectedEndpoint,
      status: "loading",
    };
    
    setTestResults(prev => [newResult, ...prev]);
    
    try {
      const startTime = performance.now();
      
      // Make the API request
      const response = await fetch(selectedEndpoint, {
        method: selectedMethod,
        headers,
        body: ["POST", "PUT", "PATCH"].includes(selectedMethod) && requestBody
          ? requestBody
          : undefined,
      });
      
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      // Parse response
      let responseData;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      
      // Update test result
      const updatedResult: TestResult = {
        endpoint: selectedEndpoint,
        status: response.ok ? "success" : "error",
        statusCode: response.status,
        responseTime,
        response: responseData,
      };
      
      setTestResults(prev => [updatedResult, ...prev.slice(1)]);
    } catch (error) {
      // Handle error
      setTestResults(prev => [{
        endpoint: selectedEndpoint,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }, ...prev.slice(1)]);
    } finally {
      setIsRunningTest(false);
    }
  };
  
  // Run all tests
  const runAllTests = async () => {
    setIsRunningTest(true);
    setTestResults([]);
    
    for (const endpoint of TEST_ENDPOINTS) {
      const newResult: TestResult = {
        endpoint: endpoint.url,
        status: "loading",
      };
      
      setTestResults(prev => [...prev, newResult]);
      
      try {
        const startTime = performance.now();
        
        const response = await fetch(endpoint.url, {
          method: endpoint.method,
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        const endTime = performance.now();
        const responseTime = Math.round(endTime - startTime);
        
        // Parse response
        let responseData;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }
        
        // Update test result
        const updatedResult: TestResult = {
          endpoint: endpoint.url,
          status: response.ok ? "success" : "error",
          statusCode: response.status,
          responseTime,
          response: responseData,
        };
        
        setTestResults(prev => {
          const index = prev.findIndex(r => r.endpoint === endpoint.url);
          const newResults = [...prev];
          newResults[index] = updatedResult;
          return newResults;
        });
      } catch (error) {
        // Handle error
        setTestResults(prev => {
          const index = prev.findIndex(r => r.endpoint === endpoint.url);
          const newResults = [...prev];
          newResults[index] = {
            endpoint: endpoint.url,
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error occurred",
          };
          return newResults;
        });
      }
      
      // Small delay between tests
      await new Promise(r => setTimeout(r, 500));
    }
    
    setIsRunningTest(false);
  };
  
  // If not authenticated or not super admin, show loading
  if (!isAuthenticated) {
    return (
      <Section className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4">Checking authentication...</p>
      </Section>
    );
  }
  
  // If first login, show password change form
  if (isFirstLogin) {
    return (
      <Section title="Change Default Password" className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Welcome, Super Admin!</CardTitle>
            <p className="text-sm text-muted-foreground">
              You need to change your default password before proceeding.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input 
                  id="current-password"
                  type="password"
                  value={passwordChangeData.currentPassword}
                  onChange={(e) => setPasswordChangeData({
                    ...passwordChangeData,
                    currentPassword: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password"
                  type="password"
                  value={passwordChangeData.newPassword}
                  onChange={(e) => setPasswordChangeData({
                    ...passwordChangeData,
                    newPassword: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input 
                  id="confirm-password"
                  type="password"
                  value={passwordChangeData.confirmPassword}
                  onChange={(e) => setPasswordChangeData({
                    ...passwordChangeData,
                    confirmPassword: e.target.value
                  })}
                />
              </div>
              
              <Button 
                type="button"
                className="w-full" 
                onClick={handlePasswordChange}
              >
                Change Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </Section>
    );
  }
  
  return (
    <Section title="Admin Test Panel" subtitle="Test and verify system components">
      <Tabs defaultValue="api-tester">
        <TabsList className="mb-6">
          <TabsTrigger value="api-tester">API Tester</TabsTrigger>
          <TabsTrigger value="system-info">System Info</TabsTrigger>
          <TabsTrigger value="auth-tokens">Auth Tokens</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-tester" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoint Tester</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="endpoint">Endpoint</Label>
                    <Select 
                      value={selectedEndpoint} 
                      onValueChange={setSelectedEndpoint}
                    >
                      <SelectTrigger id="endpoint">
                        <SelectValue placeholder="Select endpoint" />
                      </SelectTrigger>
                      <SelectContent>
                        {TEST_ENDPOINTS.map((endpoint) => (
                          <SelectItem 
                            key={endpoint.url} 
                            value={endpoint.url}
                            onSelect={() => setSelectedMethod(endpoint.method)}
                          >
                            {endpoint.name} ({endpoint.url})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="method">Method</Label>
                    <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                      <SelectTrigger id="method">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                        <SelectItem value="PATCH">PATCH</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Headers</Label>
                    {customHeaders.map((header, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          placeholder="Name"
                          value={header.name}
                          onChange={(e) => updateHeaderField(index, "name", e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="Value"
                          value={header.value}
                          onChange={(e) => updateHeaderField(index, "value", e.target.value)}
                          className="flex-1"
                        />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeHeaderField(index)}
                        >
                          X
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={addHeaderField}
                    >
                      Add Header
                    </Button>
                  </div>
                  
                  {["POST", "PUT", "PATCH"].includes(selectedMethod) && (
                    <div className="space-y-2">
                      <Label htmlFor="body">Request Body (JSON)</Label>
                      <textarea
                        id="body"
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder='{"key": "value"}'
                        value={requestBody}
                        onChange={(e) => setRequestBody(e.target.value)}
                      />
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Button 
                      onClick={runTest}
                      disabled={isRunningTest}
                      className="flex-1"
                    >
                      {isRunningTest ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Running...
                        </>
                      ) : (
                        "Test Endpoint"
                      )}
                    </Button>
                    <Button 
                      onClick={runAllTests}
                      disabled={isRunningTest}
                      variant="secondary"
                      className="flex-1"
                    >
                      {isRunningTest ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Running All...
                        </>
                      ) : (
                        "Test All Endpoints"
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Test Results</h3>
                  {testResults.length === 0 ? (
                    <p className="text-muted-foreground text-sm py-4">No tests run yet</p>
                  ) : (
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {testResults.map((result, index) => (
                        <div 
                          key={index} 
                          className={`p-3 border rounded-md ${
                            result.status === "success" 
                              ? "bg-green-500/10 border-green-500/30" 
                              : result.status === "error"
                                ? "bg-red-500/10 border-red-500/30"
                                : "bg-blue-500/10 border-blue-500/30"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{result.endpoint}</span>
                            {result.status === "loading" ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : result.status === "success" ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          
                          {result.status !== "loading" && (
                            <div className="mt-2 space-y-1 text-sm">
                              {result.statusCode && (
                                <p className="font-mono">Status: {result.statusCode}</p>
                              )}
                              {result.responseTime && (
                                <p className="font-mono">Time: {result.responseTime}ms</p>
                              )}
                              {result.error && (
                                <p className="text-red-500">{result.error}</p>
                              )}
                              {result.response && (
                                <div className="mt-2">
                                  <p className="font-medium">Response:</p>
                                  <pre className="text-xs bg-secondary/50 p-2 rounded-sm overflow-auto max-h-[200px] mt-1">
                                    {typeof result.response === 'string' 
                                      ? result.response 
                                      : JSON.stringify(result.response, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="system-info">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary/30 rounded-md">
                    <h3 className="font-medium">Environment</h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm flex justify-between">
                        <span className="text-muted-foreground">Node.js Version:</span>
                        <span className="font-mono">v18.x</span>
                      </p>
                      <p className="text-sm flex justify-between">
                        <span className="text-muted-foreground">Cloudflare Worker:</span>
                        <span className="font-mono">v2.x</span>
                      </p>
                      <p className="text-sm flex justify-between">
                        <span className="text-muted-foreground">Build Date:</span>
                        <span className="font-mono">{new Date().toISOString()}</span>
                      </p>
                      <p className="text-sm flex justify-between">
                        <span className="text-muted-foreground">Environment:</span>
                        <span className="font-mono">Production</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-secondary/30 rounded-md">
                    <h3 className="font-medium">Cloudflare Resources</h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm flex justify-between">
                        <span className="text-muted-foreground">D1 Database:</span>
                        <span className="font-mono">puppy_breeder_db</span>
                      </p>
                      <p className="text-sm flex justify-between">
                        <span className="text-muted-foreground">KV Namespace:</span>
                        <span className="font-mono">puppy_breeder_AUTH_STORE</span>
                      </p>
                      <p className="text-sm flex justify-between">
                        <span className="text-muted-foreground">R2 Bucket:</span>
                        <span className="font-mono">puppy_breeder_images</span>
                      </p>
                      <p className="text-sm flex justify-between">
                        <span className="text-muted-foreground">Worker Mode:</span>
                        <span className="font-mono">Worker-only</span>
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-secondary/30 rounded-md">
                  <h3 className="font-medium">Database Information</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm flex justify-between">
                      <span className="text-muted-foreground">Schema Version:</span>
                      <span className="font-mono">1.0</span>
                    </p>
                    <p className="text-sm flex justify-between">
                      <span className="text-muted-foreground">Total Tables:</span>
                      <span className="font-mono">8</span>
                    </p>
                    <p className="text-sm flex justify-between">
                      <span className="text-muted-foreground">Total Records:</span>
                      <span className="font-mono">~250</span>
                    </p>
                    <p className="text-sm flex justify-between">
                      <span className="text-muted-foreground">Last Migration:</span>
                      <span className="font-mono">{new Date().toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>
                
                <div className="p-4 bg-secondary/30 rounded-md">
                  <h3 className="font-medium">Initialization Commands</h3>
                  <div className="mt-2">
                    <pre className="text-xs bg-secondary/50 p-2 rounded-sm overflow-auto">
                      {`# Initialize D1 Database
wrangler d1 execute puppy_breeder_db --file=./src/worker/schema.sql

# Seed with sample data
wrangler d1 execute puppy_breeder_db --file=./src/worker/seed.sql

# Create KV namespace
wrangler kv:namespace create "AUTH_STORE"

# Create R2 bucket
wrangler r2 bucket create puppy_breeder_images`}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="auth-tokens">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-secondary/30 rounded-md">
                  <h3 className="font-medium">API Keys</h3>
                  <div className="mt-2 space-y-4">
                    <div>
                      <Label>Admin API Key</Label>
                      <div className="flex mt-1">
                        <Input 
                          type="password" 
                          value="sk_test_admin_key_1234567890" 
                          readOnly
                          className="font-mono"
                        />
                        <Button variant="outline" className="ml-2">
                          Copy
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Read-only API Key</Label>
                      <div className="flex mt-1">
                        <Input 
                          type="password" 
                          value="sk_test_readonly_key_1234567890" 
                          readOnly
                          className="font-mono"
                        />
                        <Button variant="outline" className="ml-2">
                          Copy
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Button>
                        Generate New API Key
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-secondary/30 rounded-md">
                  <h3 className="font-medium">JWT Configuration</h3>
                  <div className="mt-2 space-y-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>JWT Expiry</Label>
                        <Select defaultValue="7d">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1h">1 hour</SelectItem>
                            <SelectItem value="1d">1 day</SelectItem>
                            <SelectItem value="7d">7 days</SelectItem>
                            <SelectItem value="30d">30 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label>JWT Algorithm</Label>
                        <Select defaultValue="HS256">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HS256">HS256</SelectItem>
                            <SelectItem value="HS384">HS384</SelectItem>
                            <SelectItem value="HS512">HS512</SelectItem>
                            <SelectItem value="RS256">RS256</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label>JWT Secret Key (Masked)</Label>
                      <Input 
                        type="password" 
                        value="••••••••••••••••••••••••••••••••" 
                        readOnly
                        className="font-mono"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        JWT secret is stored securely in Cloudflare Worker Secrets
                      </p>
                    </div>
                    
                    <div>
                      <Button variant="secondary">
                        Rotate JWT Secret
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-secondary/30 rounded-md">
                  <h3 className="font-medium">Current Session</h3>
                  <div className="mt-2 space-y-2">
                    <p className="text-sm flex justify-between">
                      <span className="text-muted-foreground">User:</span>
                      <span className="font-mono">{user?.name}</span>
                    </p>
                    <p className="text-sm flex justify-between">
                      <span className="text-muted-foreground">Role:</span>
                      <span className="font-mono">{user?.role || "super-admin"}</span>
                    </p>
                    <p className="text-sm flex justify-between">
                      <span className="text-muted-foreground">Session Expires:</span>
                      <span className="font-mono">
                        {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleString()}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Section>
  );
};

export default AdminTest;
