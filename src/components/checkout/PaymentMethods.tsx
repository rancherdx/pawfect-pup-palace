import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Mail, CircleCheck, Check, Smartphone, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";
import { toast } from 'sonner'; // Import toast

interface PaymentMethodsProps {
  onDataChange: (method: string) => void;
  selectedMethod: string;
  totalAmount: number;
  isProcessing: boolean; // This prop might be controlled by parent, or we use a local one
  onComplete: (paymentResult?: unknown) => void; // Modified to potentially pass payment result
  onPrevious: () => void;
  // Optional props that might come from a broader checkout context
  userId?: string;
  puppyId?: string;
  customerEmail?: string; // Email for receipt if not logged in or different from account
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { 
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const PaymentMethods = ({ 
  onDataChange, 
  selectedMethod,
  totalAmount, 
  // isProcessing: parentIsProcessing, // Renamed to avoid conflict with local state
  onComplete,
  onPrevious,
  userId, // Assuming these might be passed from a checkout context
  puppyId,
  customerEmail: initialCustomerEmail
}: PaymentMethodsProps) => {
  const [paymentMethod, setPaymentMethod] = useState(selectedMethod || "wallet");
  const [invoiceEmail, setInvoiceEmail] = useState(initialCustomerEmail || ""); // For invoice method
  const [cardNumber, setCardNumber] = useState(""); // To track if card number is filled for sourceId simulation
  const [cardFormComplete, setCardFormComplete] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // Local processing state

  useEffect(() => {
    onDataChange(paymentMethod);
  }, [paymentMethod, onDataChange]);
  
  useEffect(() => {
    if (paymentMethod === "card") {
      // Simulate card form validation, in reality, this would be based on Square Elements state
      setCardFormComplete(cardNumber.replace(/\s/g, '').length >= 15); // Basic check
    }
  }, [paymentMethod, cardNumber]);
  
  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "wallet": return <Smartphone className="h-5 w-5 text-brand-red" />;
      case "card": return <CreditCard className="h-5 w-5 text-brand-red" />;
      case "invoice": return <Mail className="h-5 w-5 text-brand-red" />;
      case "afterpay": return <Clock className="h-5 w-5 text-brand-red" />;
      default: return null;
    }
  };

  const handleFinalSubmit = async () => {
    setIsProcessing(true);

    if (paymentMethod === 'card') {
      if (!cardFormComplete) {
        toast.error("Please ensure card details are complete.");
        setIsProcessing(false);
        return;
      }

      const sourceId = "cnon:card-nonce-ok"; // Simulated Square payment nonce
      const amountInCents = Math.round(totalAmount * 100);
      const currency = "USD";

      const payload: any = {
        sourceId,
        amount: amountInCents,
        currency,
      };

      if (userId) payload.userId = userId;
      if (puppyId) payload.puppyId = puppyId;
      if (initialCustomerEmail) payload.customerEmail = initialCustomerEmail;


      try {
        const jwtToken = localStorage.getItem('jwt');
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {})
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('Backend /api/checkout response:', data);

        if (response.ok) {
          onComplete(data);
        } else {
          console.error('Payment failed:', data);
          toast.error(`Payment failed: ${data.details || data.error || 'Please try again.'}`);
        }
      } catch (error) {
        console.error('Network or unexpected error during payment:', error);
        toast.error('An error occurred. Please check your connection and try again.');
      } finally {
        setIsProcessing(false);
      }

    } else if (paymentMethod === 'invoice') {
      if (!invoiceEmail || !/^\S+@\S+\.\S+$/.test(invoiceEmail)) {
        toast.error("Please enter a valid email address for the invoice.");
        setIsProcessing(false);
        return;
      }
      console.log(`TODO: Implement backend call for Email Invoice to: ${invoiceEmail}`);
      toast.info(`Invoice will be sent to ${invoiceEmail}. (This is a placeholder)`);
      onComplete({ paymentMethod: 'invoice', email: invoiceEmail, status: 'pending' });
      setIsProcessing(false);
    } else {
      console.log(`TODO: Implement backend call for ${paymentMethod}`);
      toast.info(`Processing for ${paymentMethod} is not yet implemented.`);
      onComplete({ paymentMethod, status: 'pending_action_required' });
      setIsProcessing(false);
    }
  };


  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="shadow-md border-brand-red/10">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <CreditCard className="mr-2 h-6 w-6 text-brand-red" />
            Payment
          </h2>
          
          <div className="space-y-6">
            <RadioGroup 
              value={paymentMethod} 
              onValueChange={setPaymentMethod}
              className="space-y-4"
            >
              {/* Wallet Option - structure kept for brevity */}
              <motion.div 
                variants={itemVariants}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-brand-red/30 ${paymentMethod === 'wallet' ? 'border-brand-red bg-brand-red/5' : 'border-gray-200'}`}
              >
                 <div className="flex items-start">
                  <RadioGroupItem value="wallet" id="wallet" />
                  <div className="ml-3">
                    <Label htmlFor="wallet" className="font-medium cursor-pointer flex items-center">
                      {getPaymentIcon("wallet")} <span className="ml-2">Digital Wallet</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">Apple Pay, Google Pay</p>
                    {/* Content for wallet would be here if expanded */}
                  </div>
                </div>
              </motion.div>
              
              {/* Afterpay Option - structure kept for brevity */}
              <motion.div 
                variants={itemVariants}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-brand-red/30 ${paymentMethod === 'afterpay' ? 'border-brand-red bg-brand-red/5' : 'border-gray-200'}`}
              >
                <div className="flex items-start">
                  <RadioGroupItem value="afterpay" id="afterpay" />
                  <div className="ml-3">
                    <Label htmlFor="afterpay" className="font-medium cursor-pointer flex items-center">
                      {getPaymentIcon("afterpay")} <span className="ml-2">Buy Now, Pay Later</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">Afterpay, Klarna, Affirm</p>
                     {/* Content for afterpay would be here if expanded */}
                  </div>
                </div>
              </motion.div>
              
              {/* Card Option */}
              <motion.div 
                variants={itemVariants}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-brand-red/30 ${paymentMethod === 'card' ? 'border-brand-red bg-brand-red/5' : 'border-gray-200'}`}
              >
                <div className="flex items-start">
                  <RadioGroupItem value="card" id="card" />
                  <div className="ml-3 w-full">
                    <Label htmlFor="card" className="font-medium cursor-pointer flex items-center">
                      {getPaymentIcon("card")} <span className="ml-2">Credit or Debit Card</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">Pay with your card</p>
                    {paymentMethod === 'card' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 p-4 border rounded bg-gray-50"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="card-number">Card Number</Label>
                          <div className="relative">
                            <Input
                              id="card-number"
                              placeholder="1234 5678 9012 3456"
                              className="pl-10"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                           
                            <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          </div>
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
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="flex items-center text-green-600 text-sm"
                            >
                              <CircleCheck className="h-4 w-4 mr-1" />
                              <span>Mock card information complete</span>
                            </motion.div>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          * Secured by Square's payment processing. Test nonce will be used.
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
              
              {/* Invoice Option */}
              <motion.div 
                variants={itemVariants}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-brand-red/30 ${paymentMethod === 'invoice' ? 'border-brand-red bg-brand-red/5' : 'border-gray-200'}`}
              >
                <div className="flex items-start">
                  <RadioGroupItem value="invoice" id="invoice" />
                  <div className="ml-3 w-full">
                    <Label htmlFor="invoice" className="font-medium cursor-pointer flex items-center">
                      {getPaymentIcon("invoice")} <span className="ml-2">Email Invoice</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">Get an invoice by email to pay later</p>
                    {paymentMethod === 'invoice' && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 p-4 border rounded bg-gray-50"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="invoice-email">Email Address</Label>
                          <div className="relative">
                            <Input 
                              id="invoice-email" 
                              type="email" 
                              placeholder="your@email.com"
                              value={invoiceEmail}
                              onChange={(e) => setInvoiceEmail(e.target.value)}
                              className="pl-10"
                            />
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          We'll send you an invoice that you can pay online within 48 hours
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            </RadioGroup>
            
            <motion.div 
              variants={itemVariants}
              className="bg-secondary/50 p-4 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-brand-red">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="text-sm text-muted-foreground mt-1 flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-1" />
                <span>Secure checkout with Square</span>
              </div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="flex justify-between pt-4"
            >
              <Button 
                type="button" 
                variant="outline" 
                onClick={onPrevious}
                disabled={isProcessing}
                className="border-brand-red/20 hover:bg-brand-red/5"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              
              <Button 
                type="button" 
                className="bg-brand-red hover:bg-red-700 text-white min-w-[150px]"
                onClick={handleFinalSubmit}
                disabled={isProcessing || (paymentMethod === 'invoice' && !invoiceEmail) || (paymentMethod === 'card' && !cardFormComplete)}
              >
                {isProcessing ? 
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span> : 
                  'Complete Adoption'
                }
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PaymentMethods;
