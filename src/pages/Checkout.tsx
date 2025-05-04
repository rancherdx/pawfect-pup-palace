
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { PawPrint, Check, Gift, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Section from "@/components/Section";
import CheckoutSteps from "@/components/checkout/CheckoutSteps";
import AdoptionQuestions from "@/components/checkout/AdoptionQuestions";
import AddonsSelection from "@/components/checkout/AddonsSelection";
import PaymentMethods from "@/components/checkout/PaymentMethods";
import PuppyConfirmation from "@/components/checkout/PuppyConfirmation";
import SuccessAnimation from "@/components/checkout/SuccessAnimation";

// Mock puppy data (would come from API in production)
const puppiesData = [
  {
    id: "1",
    name: "Bella",
    breed: "Golden Retriever",
    age: "8 weeks",
    gender: "Female",
    price: 1200,
    image: "https://images.unsplash.com/photo-1615233500064-caa995e2f9dd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
  },
];

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const puppyId = searchParams.get("puppy") || "1";
  const selectedPuppy = puppiesData.find(p => p.id === puppyId);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  
  const [adoptionData, setAdoptionData] = useState({
    puppy: selectedPuppy,
    customerInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
    adoptionResponses: {},
    addons: [],
    paymentMethod: "",
    totalAmount: selectedPuppy ? selectedPuppy.price : 0,
  });

  const steps = [
    {
      title: "Confirm Puppy",
      description: "Confirm your puppy selection",
    },
    {
      title: "Adoption Questions",
      description: "Tell us about your home",
    },
    {
      title: "Add-ons",
      description: "Optional starter items",
    },
    {
      title: "Payment",
      description: "Secure checkout",
    },
  ];

  const handleAdoptionDataChange = (field: string, value: any) => {
    setAdoptionData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      window.scrollTo(0, 0);
      setCurrentStep(current => current + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      window.scrollTo(0, 0);
      setCurrentStep(current => current - 1);
    }
  };

  const handleCompleteCheckout = async () => {
    setIsProcessing(true);
    
    // This would be an API call in production
    // Simulating API call with timeout
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsComplete(true);
      toast({
        title: "Adoption Complete!",
        description: "Your new family member is ready to come home!",
      });
      
      // Create a creature profile
      console.log("Creating creature profile for:", adoptionData.puppy?.name);
      
      // Reset processing state
      setIsProcessing(false);
      
    } catch (error) {
      console.error("Error processing adoption:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <PuppyConfirmation 
            puppy={adoptionData.puppy}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <AdoptionQuestions
            onDataChange={(value) => handleAdoptionDataChange('adoptionResponses', value)}
            data={adoptionData.adoptionResponses}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 2:
        return (
          <AddonsSelection
            onDataChange={(value) => handleAdoptionDataChange('addons', value)}
            onPriceChange={(value) => handleAdoptionDataChange('totalAmount', value)}
            basePrice={selectedPuppy ? selectedPuppy.price : 0}
            selectedAddons={adoptionData.addons}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        );
      case 3:
        return (
          <PaymentMethods
            onDataChange={(value) => handleAdoptionDataChange('paymentMethod', value)}
            totalAmount={adoptionData.totalAmount}
            selectedMethod={adoptionData.paymentMethod}
            isProcessing={isProcessing}
            onComplete={handleCompleteCheckout}
            onPrevious={handlePrevious}
          />
        );
      default:
        return null;
    }
  };

  if (isComplete) {
    return (
      <Section className="py-12">
        <SuccessAnimation 
          puppy={adoptionData.puppy}
          returnHome={() => navigate("/")}
          viewProfile={() => navigate("/dashboard")}
        />
      </Section>
    );
  }

  return (
    <div>
      <Section className="py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <PawPrint className="mr-2 h-6 w-6 text-brand-red" />
              Puppy Adoption Checkout
            </h1>
            <p className="text-muted-foreground">
              Complete the steps below to bring your new family member home.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 order-2 lg:order-1">
              <div className="sticky top-8">
                <CheckoutSteps 
                  steps={steps} 
                  currentStep={currentStep}
                  onClick={(index) => {
                    if (index < currentStep) {
                      setCurrentStep(index);
                      window.scrollTo(0, 0);
                    }
                  }}
                />

                {selectedPuppy && currentStep > 0 && (
                  <Card className="mt-6 overflow-hidden border-brand-red/20">
                    <CardContent className="p-0">
                      <div className="aspect-video w-full overflow-hidden">
                        <img 
                          src={selectedPuppy.image} 
                          alt={selectedPuppy.name}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg">{selectedPuppy.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedPuppy.breed} • {selectedPuppy.age} • {selectedPuppy.gender}
                        </p>
                        <div className="mt-2 text-brand-red font-semibold">
                          ${selectedPuppy.price}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            
            <div className="lg:col-span-8 order-1 lg:order-2">
              {renderStepContent()}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default Checkout;
