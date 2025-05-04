
import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Mail, CircleCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface PaymentMethodsProps {
  onDataChange: (method: string) => void;
  selectedMethod: string;
  totalAmount: number;
  isProcessing: boolean;
  onComplete: () => void;
  onPrevious: () => void;
}

const PaymentMethods = ({ 
  onDataChange, 
  selectedMethod,
  totalAmount, 
  isProcessing,
  onComplete,
  onPrevious 
}: PaymentMethodsProps) => {
  const [paymentMethod, setPaymentMethod] = useState(selectedMethod || "card");
  const [email, setEmail] = useState("");
  const [cardFormComplete, setCardFormComplete] = useState(false);
  
  useEffect(() => {
    onDataChange(paymentMethod);
  }, [paymentMethod, onDataChange]);
  
  // Mock function to simulate card form completion
  useEffect(() => {
    if (paymentMethod === "card") {
      // In a real implementation, this would check if the Square card form is valid
      const timer = setTimeout(() => {
        setCardFormComplete(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [paymentMethod]);

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6">Payment</h2>
        
        <div className="space-y-6">
          <RadioGroup 
            value={paymentMethod} 
            onValueChange={setPaymentMethod}
            className="space-y-4"
          >
            <div 
              className={`
                border rounded-lg p-4 cursor-pointer transition-all
                ${paymentMethod === 'wallet' ? 'border-brand-red bg-brand-red/5' : 'border-gray-200'}
              `}
            >
              <div className="flex items-start">
                <RadioGroupItem value="wallet" id="wallet" />
                <div className="ml-3">
                  <Label htmlFor="wallet" className="font-medium cursor-pointer">Digital Wallet</Label>
                  <p className="text-sm text-muted-foreground">Apple Pay, Google Pay</p>
                  
                  {paymentMethod === 'wallet' && (
                    <div className="mt-4 p-4 border rounded bg-gray-50">
                      <div className="grid grid-cols-4 gap-2">
                        {['Apple Pay', 'Google Pay', 'Afterpay', 'Cash App'].map((wallet) => (
                          <div 
                            key={wallet}
                            className="border rounded-lg p-2 text-center text-sm bg-white cursor-pointer hover:border-brand-red"
                          >
                            {wallet}
                          </div>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground text-center">
                        * In the actual implementation, Square's own wallet buttons would display here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div 
              className={`
                border rounded-lg p-4 cursor-pointer transition-all
                ${paymentMethod === 'card' ? 'border-brand-red bg-brand-red/5' : 'border-gray-200'}
              `}
            >
              <div className="flex items-start">
                <RadioGroupItem value="card" id="card" />
                <div className="ml-3 w-full">
                  <Label htmlFor="card" className="font-medium cursor-pointer">Credit or Debit Card</Label>
                  <p className="text-sm text-muted-foreground">Pay with your card</p>
                  
                  {paymentMethod === 'card' && (
                    <div className="mt-4 p-4 border rounded bg-gray-50">
                      {/* This would be where the Square payment form is injected */}
                      <div className="space-y-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input id="card-number" placeholder="1234 5678 9012 3456" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="space-y-2">
                          <Label htmlFor="card-expiry">Expiration Date</Label>
                          <Input id="card-expiry" placeholder="MM/YY" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="card-cvc">CVC</Label>
                          <Input id="card-cvc" placeholder="123" />
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center">
                        {cardFormComplete && (
                          <div className="flex items-center text-green-600 text-sm">
                            <CircleCheck className="h-4 w-4 mr-1" />
                            <span>Card information complete</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="mt-2 text-xs text-muted-foreground">
                        * In the actual implementation, Square's secure card form would display here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div 
              className={`
                border rounded-lg p-4 cursor-pointer transition-all
                ${paymentMethod === 'invoice' ? 'border-brand-red bg-brand-red/5' : 'border-gray-200'}
              `}
            >
              <div className="flex items-start">
                <RadioGroupItem value="invoice" id="invoice" />
                <div className="ml-3">
                  <Label htmlFor="invoice" className="font-medium cursor-pointer">Email Invoice</Label>
                  <p className="text-sm text-muted-foreground">Get an invoice by email to pay later</p>
                  
                  {paymentMethod === 'invoice' && (
                    <div className="mt-4 p-4 border rounded bg-gray-50">
                      <div className="space-y-2">
                        <Label htmlFor="invoice-email">Email Address</Label>
                        <Input 
                          id="invoice-email" 
                          type="email" 
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        We'll send you an invoice that you can pay online
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </RadioGroup>
          
          <div className="bg-secondary p-4 rounded-lg">
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-brand-red">${totalAmount}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              By proceeding with payment, you agree to our terms and conditions
            </p>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onPrevious}
              disabled={isProcessing}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            <Button 
              type="button" 
              className="bg-brand-red hover:bg-red-700 text-white min-w-[150px]"
              onClick={onComplete}
              disabled={isProcessing || (paymentMethod === 'invoice' && !email)}
            >
              {isProcessing ? 'Processing...' : 'Complete Adoption'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PaymentMethods;
