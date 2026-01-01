import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface StripeCardFormProps {
  amount: number;
  paymentType: "deposit" | "balance";
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export function StripeCardForm({
  amount,
  paymentType,
  onSuccess,
  onError,
  isProcessing,
  setIsProcessing,
}: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isReady, setIsReady] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
        redirect: "if_required",
      });

      if (error) {
        console.error("Payment error:", error);
        onError(error.message || "Payment failed");
        toast.error(error.message || "Payment failed");
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        onSuccess(paymentIntent.id);
        toast.success("Payment successful!");
      } else if (paymentIntent) {
        // Handle other statuses
        console.log("Payment status:", paymentIntent.status);
        if (paymentIntent.status === "requires_action") {
          // 3D Secure or additional authentication needed
          toast.info("Additional authentication required...");
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      onError("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-muted/30 rounded-lg border">
        <PaymentElement 
          onReady={() => setIsReady(true)}
          options={{
            layout: "tabs",
          }}
        />
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4" />
        <span>Your payment is secured with 256-bit SSL encryption</span>
      </div>

      <Button
        type="submit"
        className="w-full h-12 text-lg"
        disabled={!stripe || !elements || isProcessing || !isReady}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-5 w-5" />
            Pay {paymentType === "deposit" ? "Deposit" : "Balance"} ${amount.toLocaleString()}
          </>
        )}
      </Button>
    </form>
  );
}
