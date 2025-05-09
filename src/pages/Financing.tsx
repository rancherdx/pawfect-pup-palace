
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, CheckCircle, ArrowRight } from "lucide-react";
import PaymentMethodCard from "@/components/financing/PaymentMethodCard";

const Financing = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("payment-plans");

  const paymentPlans = [
    {
      id: "plan-1",
      title: "Pay in Full",
      description: "Pay the full amount upfront and receive a 5% discount.",
      terms: "No additional fees. Full payment required before puppy pickup.",
      discount: "5% discount applied",
      recommended: false,
      buttonText: "Choose Plan"
    },
    {
      id: "plan-2",
      title: "50/50 Payment Plan",
      description: "50% deposit upfront, 50% due before puppy pickup.",
      terms: "No interest. Second payment due 1 week before pickup.",
      discount: "No discount",
      recommended: true,
      buttonText: "Choose Plan"
    },
    {
      id: "plan-3",
      title: "Monthly Payments",
      description: "Spread payments over 6 months with our financing partners.",
      terms: "Subject to credit approval. Terms and rates may vary.",
      discount: "No discount",
      recommended: false,
      buttonText: "Apply Now"
    }
  ];

  const paymentMethods = [
    {
      id: "credit-card",
      name: "Credit Card",
      description: "Visa, Mastercard, American Express, Discover",
      fee: "3% processing fee",
      icon: "credit-card"
    },
    {
      id: "bank-transfer",
      name: "Bank Transfer",
      description: "Direct bank transfer to our account",
      fee: "No fees",
      icon: "building-bank"
    },
    {
      id: "paypal",
      name: "PayPal",
      description: "Fast and secure online payment",
      fee: "3% processing fee",
      icon: "paypal"
    },
    {
      id: "apple-pay",
      name: "Apple Pay",
      description: "Quick and convenient mobile payment",
      fee: "No fees",
      icon: "apple"
    }
  ];

  const handleApplyForFinancing = (planId: string) => {
    // In a real application, this would navigate to a financing application form
    navigate(`/checkout?plan=${planId}`);
  };

  return (
    <div>
      <HeroSection
        title="Financing Options"
        subtitle="Flexible payment plans to help you bring home your new puppy"
        imageSrc="https://images.unsplash.com/photo-1601312540037-094e66dc560d?ixlib=rb-4.0.3"
        ctaText="Contact Us"
        ctaLink="/contact"
      />

      <Section>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="payment-plans">Payment Plans</TabsTrigger>
              <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="payment-plans" className="space-y-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-3xl font-bold mb-4">Flexible Payment Options</h2>
              <p className="text-muted-foreground">
                We understand that bringing a new puppy home is a significant investment. That's why we offer flexible payment plans to make it easier for you to welcome your new family member.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paymentPlans.map((plan) => (
                <Card key={plan.id} className={`overflow-hidden ${plan.recommended ? 'border-primary shadow-lg' : ''}`}>
                  {plan.recommended && (
                    <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                      Recommended
                    </div>
                  )}
                  <CardContent className="p-6 space-y-4">
                    <h3 className="text-2xl font-bold">{plan.title}</h3>
                    <p>{plan.description}</p>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Terms:</div>
                      <p className="text-sm">{plan.terms}</p>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Discount:</div>
                      <p className="text-sm">{plan.discount}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 p-6">
                    <Button 
                      className="w-full" 
                      onClick={() => handleApplyForFinancing(plan.id)}
                      variant={plan.recommended ? "default" : "outline"}
                    >
                      {plan.buttonText}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Important Information</AlertTitle>
              <AlertDescription>
                All financing options require a non-refundable deposit to reserve your puppy. Financing is subject to approval and terms may vary based on your credit history.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="payment-methods" className="space-y-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <h2 className="text-3xl font-bold mb-4">Accepted Payment Methods</h2>
              <p className="text-muted-foreground">
                We accept various payment methods for your convenience. Choose the option that works best for you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paymentMethods.map((method) => (
                <PaymentMethodCard 
                  key={method.id} 
                  name={method.name}
                  description={method.description}
                  icon={method.icon}
                  fee={method.fee}
                />
              ))}
            </div>

            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Secure Payments</AlertTitle>
              <AlertDescription className="text-green-700">
                All payment information is encrypted and securely processed. We never store your full payment details on our servers.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
        
        <div className="mt-12 text-center">
          <h3 className="text-xl font-bold mb-4">Have Questions About Financing?</h3>
          <p className="mb-6 max-w-2xl mx-auto">
            Our team is ready to help you find the perfect financing solution for your new puppy.
            Contact us for personalized assistance.
          </p>
          <Button asChild size="lg">
            <a href="/contact">Contact Us</a>
          </Button>
        </div>
      </Section>
    </div>
  );
};

export default Financing;
