import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, CheckCircle, Settings, RefreshCw } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * @interface SquareEnvironment
 * @description Defines the structure of the Square environment configuration object.
 */
interface SquareEnvironment {
  environment: 'sandbox' | 'production';
  application_id: string;
  location_id: string;
  webhook_signature_key: string;
  last_updated: string;
  is_active: boolean;
}

/**
 * @component SquareEnvironmentToggle
 * @description A component that allows an administrator to view the current Square API environment
 * and switch between 'sandbox' and 'production' modes.
 * @returns {React.ReactElement} The rendered environment toggle component.
 */
const SquareEnvironmentToggle = () => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [targetEnvironment, setTargetEnvironment] = useState<'sandbox' | 'production'>('sandbox');
  const queryClient = useQueryClient();

  const { data: squareConfig, isLoading } = useQuery({
    queryKey: ['square-environment'],
    queryFn: () => adminApi.getSquareEnvironment(),
    staleTime: 5 * 60 * 1000,
  });

  const switchEnvironmentMutation = useMutation({
    mutationFn: (environment: 'sandbox' | 'production') => 
      adminApi.switchSquareEnvironment(environment),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['square-environment'] });
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success(`Successfully switched to ${data.environment} environment!`);
      setShowConfirmDialog(false);
    },
    onError: (err: Error) => {
      toast.error(`Failed to switch environment: ${err.message}`);
      setShowConfirmDialog(false);
    }
  });

  const testConnectionMutation = useMutation({
    mutationFn: () => adminApi.testSquareConnection(),
    onSuccess: (data) => {
      toast.success(`Connection test successful! ${data.message}`);
    },
    onError: (err: Error) => {
      toast.error(`Connection test failed: ${err.message}`);
    }
  });

  /**
   * Initiates the environment switch process by setting the target environment and showing the confirmation dialog.
   * @param {'sandbox' | 'production'} environment - The target environment to switch to.
   */
  const handleEnvironmentSwitch = (environment: 'sandbox' | 'production') => {
    setTargetEnvironment(environment);
    setShowConfirmDialog(true);
  };

  /**
   * Confirms and executes the environment switch mutation.
   */
  const confirmEnvironmentSwitch = () => {
    switchEnvironmentMutation.mutate(targetEnvironment);
  };

  const currentEnv = squareConfig?.environment || 'sandbox';
  const isProduction = currentEnv === 'production';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold flex items-center">
          <Settings className="mr-2 h-6 w-6" />
          Square Environment Settings
        </h3>
        <Button
          variant="outline"
          onClick={() => testConnectionMutation.mutate()}
          disabled={testConnectionMutation.isPending}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${testConnectionMutation.isPending ? 'animate-spin' : ''}`} />
          Test Connection
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Environment Card */}
        <Card className={`${isProduction ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Current Environment
              <Badge 
                variant={isProduction ? 'destructive' : 'secondary'}
                className={isProduction ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}
              >
                {currentEnv.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <div className="flex items-center gap-2">
                  {squareConfig?.is_active ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-600">Active</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="text-yellow-600">Inactive</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Application ID:</span>
                  <p className="font-mono text-xs bg-white p-2 rounded border">
                    {squareConfig?.application_id || 'Not configured'}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Location ID:</span>
                  <p className="font-mono text-xs bg-white p-2 rounded border">
                    {squareConfig?.location_id || 'Not configured'}
                  </p>
                </div>
              </div>

              {squareConfig?.last_updated && (
                <div className="text-xs text-muted-foreground">
                  Last updated: {new Date(squareConfig.last_updated).toLocaleString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Environment Switcher Card */}
        <Card>
          <CardHeader>
            <CardTitle>Switch Environment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Sandbox Mode</h4>
                  <p className="text-sm text-muted-foreground">
                    Test payments with fake data
                  </p>
                </div>
                <Switch
                  checked={currentEnv === 'sandbox'}
                  onCheckedChange={(checked) => {
                    if (checked) handleEnvironmentSwitch('sandbox');
                  }}
                  disabled={switchEnvironmentMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    Production Mode
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Live payments with real money
                  </p>
                </div>
                <Switch
                  checked={currentEnv === 'production'}
                  onCheckedChange={(checked) => {
                    if (checked) handleEnvironmentSwitch('production');
                  }}
                  disabled={switchEnvironmentMutation.isPending}
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-800">Important:</p>
                    <p className="text-amber-700">
                      Switching to production will enable real payments. Make sure you have 
                      proper production credentials configured.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Environment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Sandbox Environment</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Test credit card: 4111 1111 1111 1111</li>
                <li>• Any future expiration date</li>
                <li>• Any 3-digit CVV</li>
                <li>• Payments are simulated</li>
                <li>• No real money involved</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Production Environment</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Real credit card processing</li>
                <li>• Actual money transfers</li>
                <li>• Transaction fees apply</li>
                <li>• Requires business verification</li>
                <li>• PCI compliance required</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Environment Switch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to switch to <strong>{targetEnvironment}</strong> environment?
              {targetEnvironment === 'production' && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                  <strong className="text-red-800">Warning:</strong> This will enable real payment processing. 
                  Make sure you have proper production credentials configured.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmEnvironmentSwitch}
              className={targetEnvironment === 'production' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              Switch to {targetEnvironment}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SquareEnvironmentToggle;