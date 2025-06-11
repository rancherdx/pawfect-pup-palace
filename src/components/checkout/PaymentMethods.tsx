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
  onComplete: (paymentResult?: any) => void; // Modified to potentially pass payment result
  onPrevious: () => void;
  // Optional props that might come from a broader checkout context
  userId?: string;
  puppyId?: string;
  customerEmail?: string; // Email for receipt if not logged in or different from account
  isDeposit?: boolean; // If true, this payment will be an authorization only
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
  customerEmail: initialCustomerEmail,
  isDeposit = false // Default to false if not provided
}: PaymentMethodsProps) => {
  const [paymentMethod, setPaymentMethod] = useState(selectedMethod || "wallet");
  const [invoiceEmail, setInvoiceEmail] = useState(initialCustomerEmail || ""); // For invoice method
  // const [cardNumber, setCardNumber] = useState(""); // To track if card number is filled for sourceId simulation - REMOVED
  // const [cardFormComplete, setCardFormComplete] = useState(false); // REMOVED - Square element handles this
  const [isProcessing, setIsProcessing] = useState(false); // Local processing state
  const [squarePayments, setSquarePayments] = useState<any>(null); // To store the Square Payments SDK instance
  const [squareCard, setSquareCard] = useState<any>(null);
  const [squareAfterpay, setSquareAfterpay] = useState<any>(null);
  const [squareGooglePay, setSquareGooglePay] = useState<any>(null);
  const [squareApplePay, setSquareApplePay] = useState<any>(null);
  const [squareCashAppPay, setSquareCashAppPay] = useState<any>(null);

  const [isSquareSdkLoaded, setIsSquareSdkLoaded] = useState(false);
  const [isCardElementReady, setIsCardElementReady] = useState(false);
  const [isAfterpayReady, setIsAfterpayReady] = useState(false);
  const [isGooglePayReady, setIsGooglePayReady] = useState(false);
  const [isApplePayReady, setIsApplePayReady] = useState(false);
  const [isCashAppPayReady, setIsCashAppPayReady] = useState(false);

  // Puppy Credits State
  const [userCreditBalanceCents, setUserCreditBalanceCents] = useState<number | null>(null);
  const [applyPuppyCredits, setApplyPuppyCredits] = useState(false);
  const [creditsToApplyCents, setCreditsToApplyCents] = useState(0);
  const [isLoadingCreditBalance, setIsLoadingCreditBalance] = useState(false);

  // Calculated amount after credits
  const finalAmountToDisplay = applyPuppyCredits ? Math.max(0, totalAmount * 100 - creditsToApplyCents) / 100 : totalAmount;


  // Fetch user's puppy credit balance
  useEffect(() => {
    if (userId) {
      setIsLoadingCreditBalance(true);
      apiRequest<{ balance_cents: number }>(`/puppy-credits`, { method: 'GET' }) // Assuming apiRequest can handle this
        .then(data => {
          setUserCreditBalanceCents(data.balance_cents);
          // Optionally, pre-fill creditsToApply if balance is available
          if (data.balance_cents > 0 && applyPuppyCredits) {
             setCreditsToApplyCents(Math.min(data.balance_cents, Math.round(totalAmount * 100)));
          }
        })
        .catch(err => {
          console.error("Error fetching puppy credit balance:", err);
          toast.error("Could not load your puppy credit balance.");
          setUserCreditBalanceCents(0); // Assume 0 on error or if not found
        })
        .finally(() => setIsLoadingCreditBalance(false));
    }
  }, [userId, totalAmount, applyPuppyCredits]); // Re-evaluate if totalAmount or applyPuppyCredits changes

  // Initialize Square SDK and Payment Instances
  useEffect(() => {
    const loadSquareSdk = () => {
      const script = document.createElement('script');
      script.src = 'https://sandbox.web.squarecdn.com/v1/square.js'; // Use env var for prod/sandbox
      script.onload = async () => {
        if (!window.Square) {
          toast.error("Square SDK failed to load.");
          console.error("Square SDK not found on window.");
          return;
        }
        setIsSquareSdkLoaded(true);
        try {
          const payments = window.Square.payments(
            process.env.NEXT_PUBLIC_SQUARE_APP_ID || 'SQUARE_APPLICATION_ID_PLACEHOLDER',
            process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || 'SQUARE_LOCATION_ID_PLACEHOLDER'
          );
          setSquarePayments(payments);
        } catch (e: any) {
          console.error("Error initializing Square Payments SDK:", e);
          toast.error(`Error initializing Square Payments: ${e.message}`);
        }
      };
      script.onerror = () => {
        toast.error("Failed to load Square payment script.");
        console.error("Square script loading failed.");
      };
      document.body.appendChild(script);
      // Consider returning a cleanup function for the script if component can unmount before load.
    };

    if (!isSquareSdkLoaded) {
      loadSquareSdk();
    }
  }, [isSquareSdkLoaded]);

  // Effect for handling different payment method elements
  useEffect(() => {
    if (!squarePayments) return;

    // Cleanup function to destroy any active payment method elements
    const cleanupPaymentElements = () => {
      if (squareCard) {
        squareCard.destroy().catch((err: any) => console.error("Error destroying card:", err));
        setSquareCard(null);
        setIsCardElementReady(false);
      }
      if (squareAfterpay) {
        squareAfterpay.destroy().catch((err: any) => console.error("Error destroying Afterpay:", err));
        setSquareAfterpay(null);
        setIsAfterpayReady(false);
      }
      if (squareGooglePay) {
        squareGooglePay.destroy().catch((err: any) => console.error("Error destroying Google Pay:", err));
        setSquareGooglePay(null);
        setIsGooglePayReady(false);
      }
      if (squareApplePay) {
        squareApplePay.destroy().catch((err: any) => console.error("Error destroying Apple Pay:", err));
        setSquareApplePay(null);
        setIsApplePayReady(false);
      }
      if (squareCashAppPay) {
        squareCashAppPay.destroy().catch((err: any) => console.error("Error destroying Cash App Pay:", err));
        setSquareCashAppPay(null);
        setIsCashAppPayReady(false);
      }
    };

    const initializePaymentMethod = async () => {
      cleanupPaymentElements();

      const commonPaymentRequest = {
        countryCode: 'US', // Example, should be dynamic or configurable
        currencyCode: 'USD', // Example, should be dynamic
        total: {
          label: 'Total Puppy Price', // Example
          amount: (totalAmount || 0).toFixed(2), // Ensure totalAmount is a string with 2 decimal places
          pending: false,
        },
      };

      if (paymentMethod === "card") {
        try {
          const card = await squarePayments.card();
          await card.attach('#card-container');
          card.addEventListener('validityChanged', (event: any) => {
            setIsCardElementReady(event.detail.isValid);
          });
          setSquareCard(card);
        } catch (e: any) {
          console.error("Error initializing Square Card:", e);
          toast.error(`Error initializing card payment form: ${e.message}`);
        }
      } else if (paymentMethod === "afterpay") {
        if (totalAmount < 1) {
            toast.info("Afterpay is available for orders over $1.");
            setIsAfterpayReady(false);
            return;
        }
        try {
          const afterpayClearpay = await squarePayments.afterpayClearpay();
          await afterpayClearpay.attach('#afterpay-button-container');
          afterpayClearpay.addEventListener('tokenization', async (event: any) => {
            if (event.detail.status === 'OK' && event.detail.token) {
              await processTokenizedPayment(event.detail.token, 'afterpay_clearpay');
            } else {
              toast.error(event.detail.errors?.map((err: any) => err.message).join(" ") || "Afterpay tokenization failed.");
              setIsProcessing(false);
            }
          });
          setSquareAfterpay(afterpayClearpay);
          setIsAfterpayReady(true);
        } catch (e: any) {
          console.error("Error initializing Afterpay:", e);
          toast.error(`Error initializing Afterpay: ${e.message}`);
          setIsAfterpayReady(false);
        }
      } else if (paymentMethod === "wallet") {
        // Google Pay
        try {
          const googlePay = await squarePayments.googlePay(commonPaymentRequest);
          await googlePay.attach('#google-pay-button');
           googlePay.addEventListener('tokenization', async (event: any) => {
            if (event.detail.status === 'OK' && event.detail.token) {
              await processTokenizedPayment(event.detail.token, 'google_pay');
            } else {
              toast.error(event.detail.errors?.map((err: any) => err.message).join(" ") || "Google Pay tokenization failed.");
              setIsProcessing(false);
            }
          });
          setSquareGooglePay(googlePay);
          setIsGooglePayReady(true); // Assume ready, SDK handles button display if not usable.
        } catch (e: any) {
          console.error("Error initializing Google Pay:", e);
          // Don't toast error for Google Pay if it's just not available on the browser/device
          if (e.name !== 'PaymentMethodUnsupportedError') {
            toast.error(`Error initializing Google Pay: ${e.message}`);
          }
          setIsGooglePayReady(false);
        }
        // Apple Pay
        try {
          // TODO: Apple Pay domain verification is required for production.
          // This involves hosting a file on your domain at a specific path.
          // See Square documentation for Apple Pay setup.
          const applePay = await squarePayments.applePay(commonPaymentRequest);
          await applePay.attach('#apple-pay-button');
           applePay.addEventListener('tokenization', async (event: any) => {
            if (event.detail.status === 'OK' && event.detail.token) {
              await processTokenizedPayment(event.detail.token, 'apple_pay');
            } else {
              toast.error(event.detail.errors?.map((err: any) => err.message).join(" ") || "Apple Pay tokenization failed.");
              setIsProcessing(false);
            }
          });
          setSquareApplePay(applePay);
          setIsApplePayReady(true); // Assume ready.
        } catch (e: any) {
          console.error("Error initializing Apple Pay:", e);
           if (e.name !== 'PaymentMethodUnsupportedError') {
            toast.error(`Error initializing Apple Pay: ${e.message}`);
          }
          setIsApplePayReady(false);
        }

        // Cash App Pay
        try {
          // TODO: Review Square documentation for any specific requirements or options for CashAppPay.
          // This implementation assumes it's similar to other wallet buttons.
          const cashAppPay = await squarePayments.cashAppPay(commonPaymentRequest); // Might need specific request object
          await cashAppPay.attach('#cash-app-pay-button');
          cashAppPay.addEventListener('tokenization', async (event: any) => {
            if (event.detail.status === 'OK' && event.detail.token) {
              await processTokenizedPayment(event.detail.token, 'cash_app_pay');
            } else {
              toast.error(event.detail.errors?.map((err: any) => err.message).join(" ") || "Cash App Pay tokenization failed.");
              setIsProcessing(false);
            }
          });
          setSquareCashAppPay(cashAppPay);
          setIsCashAppPayReady(true);
        } catch (e: any) {
          console.error("Error initializing Cash App Pay:", e);
          if (e.name !== 'PaymentMethodUnsupportedError' && e.name !== 'PaymentMethodNotAvailable') { // Square might use different error names
            toast.error(`Error initializing Cash App Pay: ${e.message}`);
          }
          setIsCashAppPayReady(false);
        }
      }
    };

    initializePaymentMethod();

    return () => {
      cleanupPaymentElements();
    };
  }, [paymentMethod, squarePayments, totalAmount]); // Add totalAmount as Afterpay might depend on it

  useEffect(() => {
    onDataChange(paymentMethod);
  }, [paymentMethod, onDataChange]);
  
  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "wallet": return <Smartphone className="h-5 w-5 text-brand-red" />;
      case "card": return <CreditCard className="h-5 w-5 text-brand-red" />;
      case "invoice": return <Mail className="h-5 w-5 text-brand-red" />;
      case "afterpay": return <Clock className="h-5 w-5 text-brand-red" />;
      default: return null;
    }
  };

  // This function will be called by Card and other tokenization methods
  const processTokenizedPayment = async (sourceId: string, methodType: string) => {
    setIsProcessing(true);

    // Original amount before any credits
    const originalAmountCents = Math.round(totalAmount * 100);
    let amountToChargeSquareCents = originalAmountCents;
    let actualCreditsAppliedCents = 0;

    if (applyPuppyCredits && creditsToApplyCents > 0 && userId && userCreditBalanceCents !== null) {
      actualCreditsAppliedCents = Math.min(creditsToApplyCents, userCreditBalanceCents, originalAmountCents);
      amountToChargeSquareCents = originalAmountCents - actualCreditsAppliedCents;
    }

    const currency = "USD"; // Assuming USD, should be dynamic if supporting multiple currencies

    const payload: any = {
      sourceId, // This will be null if amountToChargeSquareCents is 0, handled below
      amount: amountToChargeSquareCents, // This is the net amount for Square
      originalAmount: originalAmountCents, // For backend to know gross
      currency,
      paymentMethodType: methodType
    };

    if (userId) payload.userId = userId;
    if (puppyId) payload.puppyId = puppyId;
    if (initialCustomerEmail) payload.customerEmail = initialCustomerEmail;
    if (isDeposit) payload.authorizeOnly = true;
    if (actualCreditsAppliedCents > 0) {
      payload.puppy_credits_to_apply = actualCreditsAppliedCents;
    }

    // If fully paid by credits, sourceId might not be needed/available for Square.
    // The backend processPayment will handle this: if amount is 0 and puppy_credits_to_apply covers total, it skips Square.
    if (amountToChargeSquareCents <= 0 && actualCreditsAppliedCents > 0) {
        // Override payload for credit-only payment if sourceId was from a method not meant for $0 auth (like Afterpay)
        // For card, a $0 auth might be fine if Square supports it, but generally we'd skip Square.
        // The backend will handle the "skip Square" logic if amount is <=0 and credits are applied.
        // We still need a sourceId if the method requires it (e.g. card for $0 auth if supported),
        // but for clarity, if the payment method requires a specific button (like afterpay, wallets),
        // those buttons might not even render or allow tokenization if the amount is $0.
        // For now, we send sourceId if available, and let backend decide.
        // If a payment method like Afterpay cannot process $0, this flow would need adjustment
        // to not even attempt tokenization for that method if credits cover the full amount.
        console.log("Amount to charge Square is $0 or less. Backend will handle as credit-only or $0 auth.");
        // Ensure sourceId is still passed if available, backend decides if it's used.
        payload.sourceId = sourceId; // Keep it, backend logic for amount <= 0 will take precedence.
    } else if (!sourceId && amountToChargeSquareCents > 0) {
      // This case should ideally not happen if UI disables payment if sourceId is needed but not available
      toast.error("Payment token is missing for non-credit payment.");
      setIsProcessing(false);
      return;
    }


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
        toast.success(`Payment via ${methodType.replace('_', ' ')} successful!`);
        onComplete(data);
      } else {
        console.error('Payment failed:', data);
        toast.error(`Payment failed: ${data.details || data.error || 'Please try again.'}`);
      }
    } catch (error: any) {
      console.error('Network or unexpected error during payment:', error);
      toast.error(`An error occurred: ${error.message || 'Please check your connection and try again.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalSubmit = async () => {
    // This function is now primarily for card payments or methods that don't have their own button.
    // Afterpay, ApplePay, GooglePay will trigger processTokenizedPayment via their own event listeners.
    if (paymentMethod === 'card') {
      if (!squareCard || !isCardElementReady) {
        toast.error("Card details are not complete or payment form not ready.");
        return; // No need to set isProcessing(false) as it's not set true yet for this path
      }
      setIsProcessing(true); // Set processing true here for card tokenization
      try {
        const result = await squareCard.tokenize();
        if (result.status === 'OK' && result.token) {
          // `processTokenizedPayment` will construct the full payload including credits.
          await processTokenizedPayment(result.token, 'card');
        } else {
          let errorMessage = "Failed to tokenize card. Please check your card details.";
          if (result.errors && result.errors.length > 0) {
            errorMessage = result.errors.map((err: any) => err.message).join(" ");
          }
          toast.error(errorMessage);
          setIsProcessing(false); // Stop processing on tokenization error
        }
      } catch (e: any) {
        console.error("Error tokenizing card:", e);
        toast.error(`Error processing card: ${e.message}`);
        setIsProcessing(false); // Stop processing on tokenization error
      }
    } else if (paymentMethod === 'invoice') {
      setIsProcessing(true);
      if (!invoiceEmail || !/^\S+@\S+\.\S+$/.test(invoiceEmail)) {
        toast.error("Please enter a valid email address for the invoice.");
        setIsProcessing(false);
        return;
      }
      console.log(`TODO: Implement backend call for Email Invoice to: ${invoiceEmail}`);
      toast.info(`Invoice will be sent to ${invoiceEmail}. (This is a placeholder)`);
      onComplete({ paymentMethod: 'invoice', email: invoiceEmail, status: 'pending' });
      setIsProcessing(false);
    } else if (paymentMethod === 'afterpay') {
      // Afterpay is handled by its own button and tokenization listener.
      // The main "Complete Adoption" button should ideally be hidden or disabled for Afterpay.
      // If somehow clicked, we can inform the user or attempt to trigger Afterpay if not already shown.
      if (!isAfterpayReady && totalAmount < 1) {
         toast.info("Afterpay is available for orders over $1.");
      } else if (!isAfterpayReady) {
         toast.info("Afterpay is not yet available. Please wait or select another method.");
      } else {
         toast.info("Please use the Afterpay button to proceed.");
      }
      // No setIsProcessing(true) here as Afterpay has its own flow.
    } else {
      // Fallback for other methods not yet fully implemented
      setIsProcessing(true);
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
              {/* Puppy Credits Application Section */}
              {userId && userCreditBalanceCents !== null && userCreditBalanceCents > 0 && (
                <motion.div variants={itemVariants} className="border rounded-lg p-4 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="apply-credits-checkbox" className="font-medium flex items-center text-amber-700 dark:text-amber-300">
                        <DollarSign className="mr-2 h-5 w-5" />
                        Use Puppy Credits
                      </Label>
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        Available balance: ${(userCreditBalanceCents / 100).toFixed(2)}
                      </p>
                    </div>
                    <Checkbox
                      id="apply-credits-checkbox"
                      checked={applyPuppyCredits}
                      onCheckedChange={(checked) => {
                        const isChecked = checked === true;
                        setApplyPuppyCredits(isChecked);
                        if (isChecked) {
                          setCreditsToApplyCents(Math.min(userCreditBalanceCents, Math.round(totalAmount * 100)));
                        } else {
                          setCreditsToApplyCents(0);
                        }
                      }}
                      className="border-amber-400 data-[state=checked]:bg-amber-500"
                    />
                  </div>
                  {applyPuppyCredits && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                      className="mt-4"
                    >
                      <Label htmlFor="credits-to-apply">Amount to apply (in cents)</Label>
                      <Input
                        id="credits-to-apply"
                        type="number"
                        value={creditsToApplyCents}
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          if (isNaN(val)) {
                            setCreditsToApplyCents(0);
                          } else {
                            setCreditsToApplyCents(Math.min(val, userCreditBalanceCents, Math.round(totalAmount * 100)));
                          }
                        }}
                        max={Math.min(userCreditBalanceCents, Math.round(totalAmount * 100))}
                        className="w-full mt-1 border-amber-300 focus:border-amber-500"
                      />
                       <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                        You are applying ${(creditsToApplyCents / 100).toFixed(2)} from your credit balance.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              )}


              {/* Wallet Option */}
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
                    <p className="text-sm text-muted-foreground">Apple Pay, Google Pay, Cash App Pay.</p>
                    {paymentMethod === 'wallet' && (
                       <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 p-4 border rounded bg-gray-50 space-y-3"
                      >
                        <div id="apple-pay-button"></div>
                        <div id="google-pay-button"></div>
                        <div id="cash-app-pay-button"></div>
                        {/* TODO: Add specific loading/unavailable messages for Cash App Pay if needed */}

                        {!isSquareSdkLoaded && (
                           <p className="text-xs text-muted-foreground">Loading payment options...</p>
                        )}
                        {isSquareSdkLoaded && !squarePayments && (
                           <p className="text-xs text-red-500">Could not initialize payment provider.</p>
                        )}
                        {isSquareSdkLoaded && squarePayments && !isGooglePayReady && !isApplePayReady && !isCashAppPayReady && (
                          <p className="text-xs text-muted-foreground">
                            No digital wallets detected or available on this browser/device.
                          </p>
                        )}
                        {isApplePayReady && (
                           <p className="mt-1 text-xs text-muted-foreground">
                            Note: Apple Pay domain verification is required for production.
                           </p>
                        )}
                        {/* TODO: Add comment about enabling Cash App Pay in Square Dashboard if necessary */}
                        {isCashAppPayReady && (
                           <p className="mt-1 text-xs text-muted-foreground">
                            Ensure Cash App Pay is enabled in your Square Dashboard.
                           </p>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
              
              {/* Afterpay Option */}
              <motion.div 
                variants={itemVariants}
                className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-brand-red/30 ${paymentMethod === 'afterpay' ? 'border-brand-red bg-brand-red/5' : 'border-gray-200'}`}
              >
                <div className="flex items-start">
                  <RadioGroupItem value="afterpay" id="afterpay" />
                  <div className="ml-3 w-full"> {/* Added w-full for container */}
                    <Label htmlFor="afterpay" className="font-medium cursor-pointer flex items-center">
                      {getPaymentIcon("afterpay")} <span className="ml-2">Buy Now, Pay Later</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">Pay in installments with Afterpay.</p>
                    {paymentMethod === 'afterpay' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 p-4 border rounded bg-gray-50"
                      >
                        {/* Container for the Afterpay button */}
                        <div id="afterpay-button-container">
                          {/* Afterpay button will be attached here by the SDK */}
                        </div>
                        {!isSquareSdkLoaded && (
                           <p className="mt-2 text-xs text-muted-foreground">Loading payment options...</p>
                        )}
                        {isSquareSdkLoaded && !squarePayments && (
                           <p className="mt-2 text-xs text-red-500">Could not initialize payment provider. Try refreshing.</p>
                        )}
                        {isSquareSdkLoaded && squarePayments && !isAfterpayReady && totalAmount < 1 && (
                           <p className="mt-2 text-xs text-orange-500">Afterpay is available for orders over $1.</p>
                        )}
                        {isSquareSdkLoaded && squarePayments && !isAfterpayReady && totalAmount >= 1 && (
                           <p className="mt-2 text-xs text-muted-foreground">Initializing Afterpay...</p>
                        )}
                         <p className="mt-2 text-xs text-muted-foreground">
                          * You will be redirected to Afterpay to complete your purchase.
                        </p>
                         {/* Add a comment about enabling Afterpay in Square Dashboard */}
                         {/* TODO: Remember to enable Afterpay in your Square Dashboard and meet eligibility requirements. */}
                      </motion.div>
                    )}
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
                        {/* This is where the Square Card Element will be mounted */}
                        <div id="card-container" className="min-h-[100px] p-1 border border-gray-300 rounded">
                          {/* Square Card Element will attach here */}
                        </div>
                        {!isSquareSdkLoaded && paymentMethod === 'card' && (
                           <p className="mt-2 text-xs text-muted-foreground">Loading payment form...</p>
                        )}
                        {isSquareSdkLoaded && !squareCard && paymentMethod === 'card' && (
                           <p className="mt-2 text-xs text-red-500">Could not initialize payment form. Try refreshing.</p>
                        )}
                         <p className="mt-2 text-xs text-muted-foreground">
                          * Secured by Square's payment processing.
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
                <span>Order Total:</span>
                <span className="text-brand-red/80 line-through">${totalAmount.toFixed(2)}</span>
              </div>
              {applyPuppyCredits && creditsToApplyCents > 0 && (
                <div className="flex justify-between font-medium text-sm text-amber-700 dark:text-amber-300">
                  <span>Credits Applied:</span>
                  <span>-${(creditsToApplyCents / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl mt-1">
                <span>Amount Due:</span>
                <span className="text-brand-red">${finalAmountToDisplay.toFixed(2)}</span>
              </div>

              <div className="text-sm text-muted-foreground mt-2 flex items-center">
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
                disabled={
                  isProcessing ||
                  (paymentMethod === 'invoice' && !invoiceEmail) ||
                  (paymentMethod === 'card' && (!isCardElementReady || !squareCard)) ||
                  (paymentMethod === 'afterpay' && !isAfterpayReady) ||
                  (paymentMethod === 'wallet' && !isApplePayReady && !isGooglePayReady && !isCashAppPayReady) // Disable if no wallet ready
                }
                // Hide this button if payment method is Afterpay/Wallet and any wallet is ready
                className={`bg-brand-red hover:bg-red-700 text-white min-w-[150px] ${
                  ((paymentMethod === 'afterpay' && isAfterpayReady) || (paymentMethod === 'wallet' && (isApplePayReady || isGooglePayReady || isCashAppPayReady))) ? 'hidden' : ''
                }`}
              >
                {isProcessing && (paymentMethod === 'card' || paymentMethod === 'invoice') ?
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing {paymentMethod === 'card' ? 'Card' : 'Invoice'}...
                  </span> : isProcessing ?
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
