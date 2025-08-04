
import { useState, useEffect } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

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
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");
  
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
      description: "Verify your puppy selection",
      icon: <PawPrint className="h-4 w-4" />,
    },
    {
      title: "Adoption Questions",
      description: "Tell us about your home",
      icon: <Check className="h-4 w-4" />,
    },
    {
      title: "Add-ons",
      description: "Optional starter items",
      icon: <Gift className="h-4 w-4" />,
    },
    {
      title: "Payment",
      description: "Secure checkout",
      icon: <ArrowRight className="h-4 w-4" />,
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
      setSlideDirection("right");
      window.scrollTo(0, 0);
      setCurrentStep(current => current + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setSlideDirection("left");
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

  // Animation variants for page transitions
  const pageVariants = {
    initial: (direction: "left" | "right") => ({
      x: direction === "right" ? 100 : -100,
      opacity: 0
    }),
    in: {
      x: 0,
      opacity: 1
    },
    out: (direction: "left" | "right") => ({
      x: direction === "right" ? -100 : 100,
      opacity: 0
    })
  };

  const pageTransition = {
    type: "tween" as const,
    ease: "easeInOut" as const,
    duration: 0.3
  };

  const renderStepContent = () => {
    return (
      <AnimatePresence mode="wait" initial={false} custom={slideDirection}>
        <motion.div
          key={currentStep}
          custom={slideDirection}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {currentStep === 0 && (
            <PuppyConfirmation 
              puppy={adoptionData.puppy}
              onNext={handleNext}
            />
          )}
          {currentStep === 1 && (
            <AdoptionQuestions
              onDataChange={(value) => handleAdoptionDataChange('adoptionResponses', value)}
              data={adoptionData.adoptionResponses}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}
          {currentStep === 2 && (
            <AddonsSelection
              onDataChange={(value) => handleAdoptionDataChange('addons', value)}
              onPriceChange={(value) => handleAdoptionDataChange('totalAmount', value)}
              basePrice={selectedPuppy ? selectedPuppy.price : 0}
              selectedAddons={adoptionData.addons}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}
          {currentStep === 3 && (
            <PaymentMethods
              onDataChange={(value) => handleAdoptionDataChange('paymentMethod', value)}
              totalAmount={adoptionData.totalAmount}
              selectedMethod={adoptionData.paymentMethod}
              isProcessing={isProcessing}
              onComplete={handleCompleteCheckout}
              onPrevious={handlePrevious}
            />
          )}
        </motion.div>
      </AnimatePresence>
    );
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
    <div className="bg-gradient-to-b from-white to-gray-50">
      <Section className="py-8">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <PawPrint className="mr-2 h-6 w-6 text-brand-red" />
              <span className="bg-gradient-to-r from-brand-red to-red-700 bg-clip-text text-transparent">
                Puppy Adoption Process
              </span>
            </h1>
            <p className="text-muted-foreground">
              Complete these steps to bring your new family member home.
            </p>
          </motion.div>
          
          <CheckoutSteps 
            steps={steps} 
            currentStep={currentStep}
            onClick={(index) => {
              if (index < currentStep) {
                setSlideDirection("left");
                setCurrentStep(index);
                window.scrollTo(0, 0);
              }
            }}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 order-2 lg:order-1">
              <div className="sticky top-8">
                {selectedPuppy && currentStep > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    <Card className="overflow-hidden border-brand-red/20 shadow-md rounded-lg">
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
                          <div className="mt-2 flex justify-between items-center">
                            <span className="text-brand-red font-semibold">
                              ${selectedPuppy.price}
                            </span>
                            <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                              Available Now
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="mt-6 bg-brand-red/10 rounded-lg p-4 border border-brand-red/20">
                      <h4 className="font-medium text-brand-red flex items-center">
                        <Check className="h-4 w-4 mr-2" />
                        Why Adopt From Us
                      </h4>
                      <ul className="mt-2 space-y-2 text-sm">
                        <li className="flex items-start">
                          <span className="bg-brand-red/20 rounded-full p-0.5 mr-2 mt-0.5">
                            <Check className="h-3 w-3 text-brand-red" />
                          </span>
                          Health guarantee & vaccinations
                        </li>
                        <li className="flex items-start">
                          <span className="bg-brand-red/20 rounded-full p-0.5 mr-2 mt-0.5">
                            <Check className="h-3 w-3 text-brand-red" />
                          </span>
                          Professional training included
                        </li>
                        <li className="flex items-start">
                          <span className="bg-brand-red/20 rounded-full p-0.5 mr-2 mt-0.5">
                            <Check className="h-3 w-3 text-brand-red" />
                          </span>
                          Ongoing support after adoption
                        </li>
                      </ul>
                    </div>
                  </motion.div>
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
