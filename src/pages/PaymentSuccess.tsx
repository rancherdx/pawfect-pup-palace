import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Home, User, Calendar, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";

interface PurchaseDetails {
  id: string;
  customer_name: string;
  customer_email: string;
  total_price: number;
  deposit_amount: number;
  remaining_amount: number;
  status: string;
  due_date: string;
  puppies?: {
    name: string;
    breed: string;
    photo_url: string | null;
  };
}

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [purchase, setPurchase] = useState<PurchaseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  
  const paymentIntent = searchParams.get("payment_intent");
  const purchaseId = searchParams.get("purchase_id");

  useEffect(() => {
    // Fire confetti on mount
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#E53E3E", "#F56565", "#FC8181", "#FED7D7"],
    });

    // Fetch purchase details
    const fetchPurchase = async () => {
      if (!purchaseId && !paymentIntent) {
        setLoading(false);
        return;
      }

      try {
        let query = supabase
          .from("puppy_purchases")
          .select("*, puppies(name, breed, photo_url)");

        if (purchaseId) {
          query = query.eq("id", purchaseId);
        } else if (paymentIntent) {
          query = query.eq("stripe_payment_intent_id", paymentIntent);
        }

        const { data, error } = await query.single();

        if (error) {
          console.error("Error fetching purchase:", error);
        } else {
          setPurchase(data);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchase();
  }, [purchaseId, paymentIntent]);

  const isDepositPayment = purchase?.status === "deposit_paid";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4"
          >
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Payment Successful!
          </h1>
          <p className="text-muted-foreground">
            {isDepositPayment 
              ? "Your deposit has been received. Your puppy is now reserved!"
              : "Congratulations! Your payment is complete."}
          </p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-pulse">Loading purchase details...</div>
            </CardContent>
          </Card>
        ) : purchase ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Order Confirmation</span>
              </CardTitle>
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
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Price</span>
                  <span className="font-medium">${purchase.total_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-green-600">
                  <span>Deposit Paid</span>
                  <span className="font-medium">${purchase.deposit_amount.toLocaleString()}</span>
                </div>
                {purchase.remaining_amount > 0 && (
                  <>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Balance Due</span>
                        <span className="font-bold text-lg">
                          ${purchase.remaining_amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Due by {new Date(purchase.due_date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Confirmation Email Notice */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                <p className="text-blue-800 dark:text-blue-200">
                  📧 A confirmation email has been sent to <strong>{purchase.customer_email}</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Your payment was processed successfully.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Next Steps */}
        {isDepositPayment && purchase?.remaining_amount && purchase.remaining_amount > 0 && (
          <Card className="mb-6 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                  <span>We'll contact you to schedule a meet & greet with {purchase.puppies?.name || "your puppy"}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                  <span>Complete any remaining paperwork and health checks</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
                  <span>Pay the remaining balance of ${purchase.remaining_amount.toLocaleString()} by {new Date(purchase.due_date).toLocaleDateString()}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</span>
                  <span>Take your new furry friend home! 🎉</span>
                </li>
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild className="flex-1">
            <Link to="/dashboard">
              <User className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
