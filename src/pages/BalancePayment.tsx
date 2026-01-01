import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { DollarSign, Calendar, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { StripeProvider } from "@/components/checkout/StripeProvider";
import { StripeCardForm } from "@/components/checkout/StripeCardForm";
import { toast } from "sonner";

interface PurchaseDetails {
  id: string;
  customer_name: string;
  customer_email: string;
  total_price: number;
  deposit_amount: number;
  remaining_amount: number;
  status: string;
  due_date: string;
  stripe_customer_id: string | null;
  puppies?: {
    id: string;
    name: string;
    breed: string;
    photo_url: string | null;
  };
}

export default function BalancePayment() {
  const { purchaseId } = useParams<{ purchaseId: string }>();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState<PurchaseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPurchase = async () => {
      if (!purchaseId) {
        setError("No purchase ID provided");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("puppy_purchases")
          .select("*, puppies(id, name, breed, photo_url)")
          .eq("id", purchaseId)
          .single();

        if (fetchError) {
          setError("Purchase not found");
          return;
        }

        if (data.status === "fully_paid") {
          setError("This purchase has already been paid in full");
          return;
        }

        if (data.remaining_amount <= 0) {
          setError("No balance remaining on this purchase");
          return;
        }

        setPurchase(data);
        
        // Create payment intent for balance
        await createPaymentIntent(data);
      } catch (err) {
        console.error("Error:", err);
        setError("Failed to load purchase details");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchase();
  }, [purchaseId]);

  const createPaymentIntent = async (purchaseData: PurchaseDetails) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke("stripe-create-payment-intent", {
        body: {
          puppyId: purchaseData.puppies?.id,
          puppyName: purchaseData.puppies?.name,
          puppyPrice: purchaseData.total_price,
          depositAmount: purchaseData.deposit_amount,
          paymentType: "balance",
          purchaseId: purchaseData.id,
          customerEmail: purchaseData.customer_email,
          customerName: purchaseData.customer_name,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to create payment intent");
      }

      setClientSecret(response.data.clientSecret);
    } catch (err) {
      console.error("Error creating payment intent:", err);
      setError("Failed to initialize payment. Please try again.");
    }
  };

  const handlePaymentSuccess = (paymentIntentId: string) => {
    navigate(`/payment-success?payment_intent=${paymentIntentId}&purchase_id=${purchaseId}`);
  };

  const handlePaymentError = (errorMessage: string) => {
    toast.error(errorMessage);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-4">
        <div className="max-w-md mx-auto text-center">
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={() => navigate("/dashboard")} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!purchase) {
    return null;
  }

  const daysUntilDue = Math.ceil(
    (new Date(purchase.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  const isOverdue = daysUntilDue < 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Complete Your Payment</CardTitle>
            <CardDescription>
              Pay the remaining balance for your puppy reservation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Puppy Info */}
            {purchase.puppies && (
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                {purchase.puppies.photo_url && (
                  <img
                    src={purchase.puppies.photo_url}
                    alt={purchase.puppies.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-lg">{purchase.puppies.name}</h3>
                  <p className="text-muted-foreground">{purchase.puppies.breed}</p>
                </div>
              </div>
            )}

            {/* Payment Summary */}
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Price</span>
                <span>${purchase.total_price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-green-600">
                <span>Deposit Paid</span>
                <span>-${purchase.deposit_amount.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Balance Due</span>
                  <span className="font-bold text-xl text-primary">
                    ${purchase.remaining_amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Due Date Warning */}
            <div className={`flex items-center gap-2 p-3 rounded-lg ${
              isOverdue 
                ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300" 
                : daysUntilDue <= 3 
                  ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
                  : "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
            }`}>
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                {isOverdue 
                  ? `Payment was due ${Math.abs(daysUntilDue)} days ago`
                  : daysUntilDue === 0
                    ? "Payment is due today"
                    : `Payment due in ${daysUntilDue} days (${new Date(purchase.due_date).toLocaleDateString()})`
                }
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientSecret ? (
              <StripeProvider clientSecret={clientSecret}>
                <StripeCardForm
                  amount={purchase.remaining_amount}
                  paymentType="balance"
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
              </StripeProvider>
            ) : (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2">Initializing payment...</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
