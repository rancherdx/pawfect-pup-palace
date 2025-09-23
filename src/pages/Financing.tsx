
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, CheckCircle, ArrowRight, ExternalLink } from "lucide-react";
import PaymentMethodCard from "@/components/financing/PaymentMethodCard";

/**
 * @component Financing
 * @description This page provides comprehensive information about the available payment and financing
 * options for adopting a puppy. It features a tabbed interface to switch between payment plans
 * and accepted payment methods. It also includes information about a third-party financing partner.
 *
 * @returns {JSX.Element} The rendered financing page.
 */
const Financing = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("payment-plans");

  /**
   * @constant paymentPlans
   * @description An array of objects defining the available payment plans.
   */
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
    }
  ];

  /**
   * @constant paymentMethods
   * @description An array of objects defining the accepted payment methods.
   */
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

  /**
   * @function handleApplyForFinancing
   * @description Navigates the user to the checkout page with the selected payment plan ID
   * included in the URL search parameters.
   * @param {string} planId - The ID of the selected payment plan.
   */
  const handleApplyForFinancing = (planId: string) => {
    navigate(`/checkout?plan=${planId}`);
  };

  return (
    <div>
      <HeroSection
        title="Payment Options"
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
              <h2 className="text-3xl font-bold mb-4">Our Payment Options</h2>
              <p className="text-muted-foreground">
                We offer several ways to pay for your new puppy, including flexible payment plans.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div className="bg-muted/50 rounded-lg p-6 mt-8">
              <h3 className="text-xl font-bold mb-4">Financing Through Terrace Pets</h3>
              <p className="mb-4">
                Need more flexible payment options? We've partnered with Terrace Pets to offer 
                financing solutions that make bringing home your puppy easier.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button asChild variant="outline">
                  <a href="https://demo.terracepets.com" target="_blank" rel="noopener noreferrer">
                    Learn More About Terrace Pets
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button asChild>
                  <a href="/contact">Contact Us About Financing</a>
                </Button>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Important Information</AlertTitle>
              <AlertDescription>
                All payment options require a non-refundable deposit to reserve your puppy. Financing through Terrace Pets is subject to approval and terms may vary based on your credit history.
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
          <h3 className="text-xl font-bold mb-4">Have Questions About Payments?</h3>
          <p className="mb-6 max-w-2xl mx-auto">
            Our team is ready to help you find the perfect payment solution for your new puppy.
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
