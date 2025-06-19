
import { useState, useEffect } from "react";
import { CreditCard, Shield, Heart, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface SquareCheckoutProps {
  amount: number;
  puppyName: string;
  puppyId: string;
  userId?: string;
  customerEmail?: string;
  onSuccess: (paymentResult: any) => void;
  onCancel: () => void;
}

const SquareCheckout = ({ 
  amount, 
  puppyName, 
  puppyId, 
  userId, 
  customerEmail,
  onSuccess, 
  onCancel 
}: SquareCheckoutProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingInfo, setBillingInfo] = useState({
    firstName: "",
    lastName: "",
    email: customerEmail || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: ""
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingInfo(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    for (const field of required) {
      if (!billingInfo[field as keyof typeof billingInfo]) {
        toast({
          title: "Missing Information",
          description: `Please fill in your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
          variant: "destructive"
        });
        return false;
      }
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingInfo.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const processPayment = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);

    try {
      const jwtToken = localStorage.getItem('jwt');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (jwtToken) {
        headers['Authorization'] = `Bearer ${jwtToken}`;
      }

      const payload = {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'USD',
        puppyId,
        userId,
        customerEmail: billingInfo.email,
        billingInfo,
        puppyName,
        redirectUrl: `${window.location.origin}/adoption-success`
      };

      const response = await fetch('/api/square/checkout', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.checkoutUrl) {
        // Redirect to Square checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "Payment processing failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg border-brand-red/20">
          <CardHeader className="bg-gradient-to-r from-brand-red/5 to-red-100/50">
            <CardTitle className="text-2xl flex items-center">
              <Heart className="mr-2 h-6 w-6 text-brand-red" />
              Complete Your Adoption
            </CardTitle>
            <p className="text-muted-foreground">
              You're about to give {puppyName} a loving forever home!
            </p>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Order Summary */}
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <PawPrint className="mr-2 h-5 w-5 text-brand-red" />
                    <span className="font-medium">Adoption Fee for {puppyName}</span>
                  </div>
                  <span className="text-xl font-bold text-brand-red">
                    ${amount.toFixed(2)}
                  </span>
                </div>
                <div className="mt-3 flex items-center text-sm text-muted-foreground">
                  <Shield className="mr-1 h-4 w-4 text-green-600" />
                  Includes health guarantee, vaccinations, and microchip
                </div>
              </CardContent>
            </Card>

            {/* Billing Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Billing Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={billingInfo.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={billingInfo.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={billingInfo.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={billingInfo.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  name="address"
                  value={billingInfo.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    name="city"
                    value={billingInfo.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    name="state"
                    value={billingInfo.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={billingInfo.zipCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Payment Actions */}
            <div className="flex flex-col space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Shield className="mr-2 h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Secure Payment by Square</p>
                    <p className="text-sm text-blue-700">
                      Your payment information is encrypted and secure
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                
                <Button 
                  onClick={processPayment}
                  disabled={isProcessing}
                  className="flex-1 bg-brand-red hover:bg-red-700 text-white"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay ${amount.toFixed(2)}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SquareCheckout;
