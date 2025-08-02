import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CreditCard, CheckCircle, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import SquareOAuthConnect from './SquareOAuthConnect';

interface Integration {
  id: string;
  service_name: string;
  is_active: boolean;
  api_key_set: boolean;
  other_config?: object;
}

const SquareIntegration = () => {
  const queryClient = useQueryClient();

  const { data: squareIntegration, isLoading: isLoadingIntegrations, isError: isErrorIntegrations } = useQuery({
    queryKey: ['integrations'],
    queryFn: async (): Promise<Integration | undefined> => {
      const response = await apiRequest<unknown>('/admin/integrations');
      const allIntegrations = (response as { integrations?: unknown[] }).integrations || response;
      return (allIntegrations as unknown[]).find((int: unknown) => (int as Integration).service_name?.toLowerCase() === 'square');
    },
    staleTime: 5 * 60 * 1000,
    select: (data: any) => data ? ({
      id: data.id,
      service_name: data.service_name,
      is_active: data.is_active,
      api_key_set: data.api_key_set,
      other_config: typeof data.other_config === 'string' ? JSON.parse(data.other_config || '{}') : (data.other_config || {}),
    }) : undefined,
  });

  const isConfigured = squareIntegration && squareIntegration.api_key_set;
  const isConnected = isConfigured && squareIntegration.is_active;

  const updateIntegrationMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { is_active: boolean; service_name: string; other_config: object; } }) => 
      apiRequest<Integration>(`/admin/integrations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Square connection status updated!');
    },
    onError: (err: Error) => {
      toast.error(`Failed to update Square status: ${err.message}`);
    }
  });

  const handleToggleSquareActivation = () => {
    if (!squareIntegration) {
      toast.error('Square integration details not found.');
      return;
    }
    if (!squareIntegration.api_key_set) {
      toast.info('Square is not yet configured. Please set it up in Third-Party Integrations first.');
      return;
    }

    updateIntegrationMutation.mutate({
      id: squareIntegration.id,
      data: {
        is_active: !squareIntegration.is_active,
        service_name: squareIntegration.service_name,
        other_config: squareIntegration.other_config || {},
      },
    });
  };
  
  const isLoading = isLoadingIntegrations || updateIntegrationMutation.isPending;

  if (isLoadingIntegrations) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-12 w-12 animate-spin text-brand-red" />
        <p className="ml-3 text-lg">Loading Square Integration Status...</p>
      </div>
    );
  }

  if (isErrorIntegrations) {
     return (
      <div className="flex flex-col justify-center items-center min-h-[200px] text-red-600">
        <AlertCircle className="h-12 w-12 mb-2" />
        <p className="text-lg text-center">Error loading Square integration status.</p>
        <p className="text-sm">It might be an issue with fetching third-party integrations data.</p>
        <Button onClick={() => queryClient.refetchQueries({ queryKey: ['integrations'] })} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <h2 className="text-3xl font-bold flex items-center">
          <CreditCard className="mr-2 h-8 w-8 text-brand-red" />
          Square Integration
        </h2>
      </div>
      
      {/* OAuth Connection Component */}
      <SquareOAuthConnect />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className={`shadow-md ${isConnected ? "border-green-500" : (!isConfigured ? "border-amber-500" : "border-gray-200")}`}>
          <CardHeader className={`${isConnected ? "bg-green-50 dark:bg-green-900/20" : (!isConfigured ? "bg-amber-50 dark:bg-amber-900/20" : "bg-gray-50 dark:bg-gray-800/20")}`}>
            <CardTitle className="flex items-center">
              {isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <AlertCircle className={`h-5 w-5 ${!isConfigured ? "text-amber-500" : "text-gray-400"} mr-2`} />
              )}
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {!isConfigured ? (
              <>
                <div className="mb-4">
                  <p className="text-lg font-medium text-amber-700 dark:text-amber-500">Not Configured</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Square integration needs to be set up with an API key in the integrations manager.</p>
                </div>
                <Button asChild className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                  <Link to="/admin?tab=integrations">
                    Configure Square <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            ) : isConnected ? (
              <>
                <div className="mb-4">
                  <p className="text-lg font-medium text-green-600 dark:text-green-400">Connected to Square</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your Square account is successfully connected and active.</p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-500 dark:hover:bg-red-900/30"
                  onClick={handleToggleSquareActivation}
                  disabled={isLoading}
                >
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processing...</> : "Deactivate Square"}
                </Button>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-lg font-medium text-gray-800 dark:text-gray-200">Configured but Inactive</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Square is configured but currently inactive. Activate it to enable payments.</p>
                </div>
                <Button 
                  className="w-full bg-brand-red hover:bg-red-700 text-white"
                  onClick={handleToggleSquareActivation}
                  disabled={isLoading}
                >
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Processing...</> : "Activate Square"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Payment Methods Card - styling updated based on isConnected */}
        <Card className="shadow-md">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/20">
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-3">
              {[ "Credit Card Payments", "ACH Bank Transfers", "Email Invoicing", "In-Person Payments"].map(method => (
                <li key={method} className="flex items-center">
                  <CheckCircle className={`h-5 w-5 mr-3 ${isConnected ? "text-green-500" : "text-gray-300 dark:text-gray-600"}`} />
                  <span className={`${!isConnected && "text-gray-400 dark:text-gray-500"}`}>{method}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Button variant="outline" className="w-full" disabled={!isConnected}>
                Configure Payment Methods <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        </Card>
        
        {/* Sync Settings Card - styling updated based on isConnected */}
        <Card className="shadow-md">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/20">
            <CardTitle>Sync Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {["Auto-sync puppies", "Sync inventory", "Notify on sales"].map(setting => (
                <div key={setting} className="flex items-center justify-between">
                  <label className={`flex items-center ${!isConnected && "text-gray-400 dark:text-gray-500"}`}>
                    <span className="mr-2">{setting}</span>
                  </label>
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isConnected ? "bg-brand-red" : "bg-gray-200 dark:bg-gray-700"}`}>
                    <span className={`${isConnected ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button variant="outline" className="w-full" disabled={!isConnected}>
                Advanced Settings <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Square Dashboard and Need Help? cards - styling updated */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/20">
            <CardTitle>Square Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Access your full Square dashboard to view detailed analytics, configure your payment settings, and manage your business.
            </p>
            <Button 
              className={`${isConnected ? "bg-brand-red hover:bg-red-700" : "bg-gray-300 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"} text-white`}
              disabled={!isConnected}
              onClick={() => window.open('https://squareup.com/dashboard', '_blank')}
            >
              Open Square Dashboard
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/20">
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Having trouble with your Square integration? Our support team is here to help you get things working.
            </p>
            <Button variant="outline">Contact Support</Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800/30 rounded-lg p-4 border border-dashed border-gray-300 dark:border-gray-700">
        <h3 className="font-medium">How Square Integration Works:</h3>
        <ul className="mt-2 text-sm text-gray-600 space-y-1">
          <li>• Puppies added to your inventory will sync automatically with Square.</li>
          <li>• When a puppy is marked as "Sold", it will be removed from available inventory.</li>
          <li>• All transactions processed through Square will appear in your transaction history.</li>
          <li>• You can send email invoices or process payments in person.</li>
        </ul>
      </div>
    </div>
  );
};

export default SquareIntegration;
