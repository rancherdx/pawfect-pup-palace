import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { ReactNode } from "react";

// Initialize Stripe with publishable key
// Note: This key should be the publishable key, not the secret key
const stripePromise = loadStripe("pk_test_placeholder"); // Will be replaced with real key

interface StripeProviderProps {
  children: ReactNode;
  clientSecret?: string;
}

export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const options = clientSecret ? {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#E53E3E",
        colorBackground: "#ffffff",
        colorText: "#1a1a1a",
        colorDanger: "#dc2626",
        fontFamily: "system-ui, sans-serif",
        borderRadius: "8px",
      },
    },
  } : undefined;

  if (!clientSecret) {
    // Return children without Elements wrapper if no clientSecret yet
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
