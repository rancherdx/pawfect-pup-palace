import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Database, Image, FileText, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

const TestPage = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Database connectivity tests
  const { data: puppiesTest } = useQuery({
    queryKey: ['test-puppies'],
    queryFn: async () => {
      const { data, error } = await supabase.from('puppies').select('count').limit(1);
      return { data, error };
    },
    enabled: false
  });

  const { data: littersTest } = useQuery({
    queryKey: ['test-litters'],
    queryFn: async () => {
      const { data, error } = await supabase.from('litters').select('count').limit(1);
      return { data, error };
    },
    enabled: false
  });

  const runSystemTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const timeout = (promise: Promise<any>, ms: number, testName: string) => {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`${testName} timed out after ${ms}ms`));
        }, ms);

        promise
          .then(value => {
            clearTimeout(timer);
            resolve(value);
          })
          .catch(reason => {
            clearTimeout(timer);
            reject(reason);
          });
      });
    };

    const runTest = async (name: string, testFn: () => Promise<Omit<TestResult, 'name'>>): Promise<TestResult> => {
      try {
        const result = await timeout(testFn(), 10000, name) as Omit<TestResult, 'name'>;
        return { name, ...result };
      } catch (e) {
        return {
          name,
          status: 'fail',
          message: `Test failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
          details: e instanceof Error ? e.stack : undefined,
        };
      }
    };

    try {
      const tests = [
        runTest('Database Connection', async () => {
          const { error } = await supabase.from('puppies').select('count').limit(1);
          return {
            status: error ? 'fail' : 'pass',
            message: error ? 'Failed to connect to database' : 'Database connection successful',
            details: error?.message,
          };
        }),
        runTest('Authentication System', async () => ({
            status: isAuthenticated ? 'pass' : 'warning',
            message: isAuthenticated ? 'User authenticated' : 'No user authenticated',
            details: user ? `User ID: ${user.id}` : 'Please login to test admin features',
        })),
        runTest('Puppies Data', async () => {
            const { data: puppies, error } = await supabase.from('puppies').select('*').limit(5);
            return {
                status: error ? 'fail' : puppies?.length ? 'pass' : 'warning',
                message: error ? 'Failed to fetch puppies' : `Found ${puppies?.length || 0} puppies`,
                details: error?.message,
            };
        }),
        runTest('Litters Data', async () => {
            const { data: litters, error } = await supabase.from('litters').select('*').limit(5);
            return {
                status: error ? 'fail' : litters?.length ? 'pass' : 'warning',
                message: error ? 'Failed to fetch litters' : `Found ${litters?.length || 0} litters`,
                details: error?.message,
            };
        }),
        runTest('Blog Posts', async () => {
            const { data: posts, error } = await supabase.from('blog_posts').select('*').limit(5);
            return {
                status: error ? 'fail' : posts?.length ? 'pass' : 'warning',
                message: error ? 'Failed to fetch blog posts' : `Found ${posts?.length || 0} blog posts`,
                details: error?.message,
            };
        }),
        runTest('Testimonials', async () => {
            const { data: testimonials, error } = await supabase.from('testimonials').select('*').limit(5);
            return {
                status: error ? 'fail' : testimonials?.length ? 'pass' : 'warning',
                message: error ? 'Failed to fetch testimonials' : `Found ${testimonials?.length || 0} testimonials`,
                details: error?.message,
            };
        }),
        runTest('Storage Buckets', async () => {
            const { data: buckets, error } = await supabase.storage.listBuckets();
            const requiredBuckets = ['puppy-images', 'litter-images', 'brand-assets', 'videos'];
            const existingBuckets = buckets?.map(b => b.name) || [];
            const missingBuckets = requiredBuckets.filter(b => !existingBuckets.includes(b));
            return {
                status: error ? 'fail' : missingBuckets.length === 0 ? 'pass' : 'warning',
                message: error ? 'Failed to check storage buckets' :
                  missingBuckets.length === 0 ? 'All required buckets exist' : `Missing buckets: ${missingBuckets.join(', ')}`,
                details: `Found buckets: ${existingBuckets.join(', ')}`,
            };
        }),
      ];

      if (isAuthenticated && user) {
        tests.push(runTest('User Roles', async () => {
          const { data: roles, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);
          return {
            status: error ? 'fail' : 'pass',
            message: error ? 'Failed to fetch user roles' : `User has ${roles?.length || 0} role(s)`,
            details: error?.message || `Roles: ${roles?.map(r => r.role).join(', ') || 'None'}`,
          };
        }));
      }

      const results = await Promise.all(tests);
      setTestResults(results);

    } catch (error) {
      console.error("An unexpected error occurred during system tests:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pass':
        return 'default';
      case 'fail':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">System Test Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Verify all system components are functioning correctly
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {testResults.filter(r => r.status === 'pass').length}
                </div>
                <div className="text-sm text-muted-foreground">Passing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500">
                  {testResults.filter(r => r.status === 'warning').length}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {testResults.filter(r => r.status === 'fail').length}
                </div>
                <div className="text-sm text-muted-foreground">Failing</div>
              </div>
            </div>
            
            <Button 
              onClick={runSystemTests} 
              disabled={isRunning}
              className="w-full"
            >
              {isRunning ? 'Running Tests...' : 'Run System Tests'}
            </Button>
          </CardContent>
        </Card>

        {testResults.length > 0 && (
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{result.name}</h3>
                          <Badge variant={getStatusBadgeVariant(result.status)}>
                            {result.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {result.message}
                        </p>
                        {result.details && (
                          <p className="text-xs text-muted-foreground font-mono bg-muted p-2 rounded">
                            {result.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Test Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">What this tests:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Database connectivity and table access</li>
                <li>• Authentication system functionality</li>
                <li>• Data integrity for puppies, litters, blog posts, and testimonials</li>
                <li>• Storage bucket configuration</li>
                <li>• User role system (when authenticated)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Admin Access:</h4>
              <p className="text-sm text-muted-foreground">
                To test admin functionality, login with a super-admin account and navigate to /admin
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">API Documentation:</h4>
              <p className="text-sm text-muted-foreground">
                Access comprehensive API docs at: <strong>https://new.gdspuppies.com/api-docs</strong>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestPage;