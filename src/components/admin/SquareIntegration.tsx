
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CreditCard, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";

const SquareIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const handleConnect = () => {
    setLoading(true);
    
    // Simulate connecting to Square API
    setTimeout(() => {
      setIsConnected(true);
      setLoading(false);
    }, 2000);
  };
  
  const handleDisconnect = () => {
    setLoading(true);
    
    // Simulate disconnecting from Square API
    setTimeout(() => {
      setIsConnected(false);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <h2 className="text-3xl font-bold flex items-center">
          <CreditCard className="mr-2 h-8 w-8 text-brand-red" />
          Square Integration
        </h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className={`shadow-md ${isConnected ? "border-green-500" : "border-gray-200"}`}>
          <CardHeader className={`${isConnected ? "bg-green-50" : "bg-gray-50"}`}>
            <CardTitle className="flex items-center">
              {isConnected ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-gray-400 mr-2" />
              )}
              Connection Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {isConnected ? (
              <>
                <div className="mb-4">
                  <p className="text-lg font-medium text-green-600">Connected to Square</p>
                  <p className="text-gray-500 text-sm mt-1">Your Square account is successfully connected.</p>
                </div>
                
                <Button 
                  variant="outline" 
                  className="w-full border-red-300 text-red-600 hover:bg-red-50"
                  onClick={handleDisconnect}
                  disabled={loading}
                >
                  {loading ? "Disconnecting..." : "Disconnect Account"}
                </Button>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <p className="text-lg font-medium text-gray-800">Not Connected</p>
                  <p className="text-gray-500 text-sm mt-1">Connect your Square account to enable payment processing and inventory syncing.</p>
                </div>
                
                <Button 
                  className="w-full bg-brand-red hover:bg-red-700 text-white"
                  onClick={handleConnect}
                  disabled={loading}
                >
                  {loading ? "Connecting..." : "Connect Square Account"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader className="bg-gray-50">
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-3">
              <li className="flex items-center">
                <CheckCircle className={`h-5 w-5 mr-3 ${isConnected ? "text-green-500" : "text-gray-300"}`} />
                <span className={`${!isConnected && "text-gray-400"}`}>Credit Card Payments</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className={`h-5 w-5 mr-3 ${isConnected ? "text-green-500" : "text-gray-300"}`} />
                <span className={`${!isConnected && "text-gray-400"}`}>ACH Bank Transfers</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className={`h-5 w-5 mr-3 ${isConnected ? "text-green-500" : "text-gray-300"}`} />
                <span className={`${!isConnected && "text-gray-400"}`}>Email Invoicing</span>
              </li>
              <li className="flex items-center">
                <CheckCircle className={`h-5 w-5 mr-3 ${isConnected ? "text-green-500" : "text-gray-300"}`} />
                <span className={`${!isConnected && "text-gray-400"}`}>In-Person Payments</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full"
                disabled={!isConnected}
              >
                Configure Payment Methods <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader className="bg-gray-50">
            <CardTitle>Sync Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <span className="mr-2">Auto-sync puppies</span>
                </label>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 data-[state=checked]:bg-brand-red">
                  <span 
                    className={`${isConnected ? "bg-brand-red" : "bg-gray-200"} inline-flex h-6 w-11 items-center rounded-full transition-colors`} 
                  >
                    <span 
                      className={`${isConnected ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 rounded-full bg-white transition-transform`} 
                    />
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <span className="mr-2">Sync inventory</span>
                </label>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 data-[state=checked]:bg-brand-red">
                  <span 
                    className={`${isConnected ? "bg-brand-red" : "bg-gray-200"} inline-flex h-6 w-11 items-center rounded-full transition-colors`} 
                  >
                    <span 
                      className={`${isConnected ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 rounded-full bg-white transition-transform`} 
                    />
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <span className="mr-2">Notify on sales</span>
                </label>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2 data-[state=checked]:bg-brand-red">
                  <span 
                    className={`${isConnected ? "bg-brand-red" : "bg-gray-200"} inline-flex h-6 w-11 items-center rounded-full transition-colors`} 
                  >
                    <span 
                      className={`${isConnected ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 rounded-full bg-white transition-transform`} 
                    />
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full"
                disabled={!isConnected}
              >
                Advanced Settings <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader className="bg-gray-50">
            <CardTitle>Square Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-600 mb-6">
              Access your full Square dashboard to view detailed analytics, configure your payment settings, and manage your business.
            </p>
            <Button 
              className={`${isConnected ? "bg-brand-red hover:bg-red-700" : "bg-gray-300"} text-white`}
              disabled={!isConnected}
            >
              Open Square Dashboard
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardHeader className="bg-gray-50">
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-gray-600 mb-6">
              Having trouble with your Square integration? Our support team is here to help you get things working.
            </p>
            <Button variant="outline">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4 border border-dashed border-gray-300">
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
