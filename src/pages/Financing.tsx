
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  CreditCard, 
  Apple, 
  Banknote, 
  PawPrint, 
  ArrowRight, 
  ClipboardCheck,
  Calendar,
  Heart,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Section from "@/components/Section";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import StudServiceCard from "@/components/financing/StudServiceCard";
import PaymentMethodCard from "@/components/financing/PaymentMethodCard";

const Financing = () => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [studDogs, setStudDogs] = useState([
    {
      id: "stud1",
      name: "Max",
      breed: "German Shepherd",
      age: 3,
      certifications: ["AKC Registered", "OFA Hip Certified", "Health Tested"],
      temperament: "Confident, Loyal, Intelligent",
      price: 800,
      image: "/placeholder.svg"
    },
    {
      id: "stud2",
      name: "Duke",
      breed: "German Shepherd",
      age: 4,
      certifications: ["AKC Registered", "OFA Hip Certified", "Health Tested"],
      temperament: "Calm, Protective, Trainable",
      price: 950,
      image: "/placeholder.svg"
    }
  ]);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      window.open("https://terracepets.com/apply", "_blank");
      setCountdown(null);
    }
  }, [countdown]);

  const handleApplyNow = () => {
    setCountdown(5);
  };

  const paymentMethods = [
    { 
      name: "Credit/Debit Cards", 
      icon: <CreditCard className="h-8 w-8 text-brand-red" />,
      description: "We accept all major credit and debit cards including Visa, Mastercard, American Express, and Discover."
    },
    { 
      name: "Cash", 
      icon: <Banknote className="h-8 w-8 text-green-600" />,
      description: "Cash payments are accepted for in-person transactions at our location."
    },
    { 
      name: "Apple Pay", 
      icon: <Apple className="h-8 w-8 text-black" />,
      description: "Quick and secure payments using Apple Pay are available for in-person transactions."
    },
    { 
      name: "Cash App Pay", 
      icon: <CreditCard className="h-8 w-8 text-green-500" />,
      description: "Send payments easily through Cash App for convenient transactions."
    },
    { 
      name: "PayPal", 
      icon: <CreditCard className="h-8 w-8 text-blue-600" />,
      description: "Secure online payments via PayPal are accepted for deposits and full payments."
    },
    { 
      name: "Afterpay", 
      icon: <CreditCard className="h-8 w-8 text-purple-600" />,
      description: "Split your payment into 4 interest-free installments with Afterpay."
    }
  ];

  return (
    <>
      <Section 
        title="Financing & Payment Options" 
        subtitle="Flexible ways to bring home your new family member"
        variant="litter"
        withPawPrintBg
      >
        <div className="max-w-6xl mx-auto">
          {/* Payment Methods Section */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 flex items-center">
              <CreditCard className="mr-2 text-brand-red" />
              Accepted Payment Methods
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paymentMethods.map((method, index) => (
                <PaymentMethodCard 
                  key={index}
                  name={method.name}
                  icon={method.icon}
                  description={method.description}
                />
              ))}
            </div>
          </div>

          {/* Financing Section */}
          <div className="mb-16">
            <Card className="overflow-hidden border-2 border-brand-red/20 shadow-puppy">
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20">
                <CardTitle className="flex items-center text-2xl">
                  <img 
                    src="/placeholder.svg" 
                    alt="Terrace Pets Logo" 
                    className="h-10 w-10 mr-3" 
                  />
                  Financing with Terrace Pets
                </CardTitle>
                <CardDescription>
                  Flexible financing options to help bring home your perfect companion
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="flex flex-col items-center text-center p-4 bg-accent/50 rounded-lg">
                    <ClipboardCheck className="h-10 w-10 text-brand-red mb-3" />
                    <h3 className="font-semibold mb-2">Simple Application</h3>
                    <p className="text-sm text-muted-foreground">Quick online application with fast approval decisions</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 bg-accent/50 rounded-lg">
                    <Calendar className="h-10 w-10 text-brand-red mb-3" />
                    <h3 className="font-semibold mb-2">Flexible Terms</h3>
                    <p className="text-sm text-muted-foreground">Various repayment options to fit your budget</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-4 bg-accent/50 rounded-lg">
                    <Heart className="h-10 w-10 text-brand-red mb-3" />
                    <h3 className="font-semibold mb-2">Dedicated Support</h3>
                    <p className="text-sm text-muted-foreground">Expert assistance throughout the financing process</p>
                  </div>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  <p>
                    Terrace Pets offers specialized pet financing options designed to help you bring home your new
                    family member with manageable monthly payments. Their services include:
                  </p>
                  <ul className="space-y-2 my-4">
                    <li className="flex items-start">
                      <PawPrint className="h-5 w-5 text-brand-red mr-2 mt-0.5 flex-shrink-0" />
                      <span>Competitive interest rates for qualified applicants</span>
                    </li>
                    <li className="flex items-start">
                      <PawPrint className="h-5 w-5 text-brand-red mr-2 mt-0.5 flex-shrink-0" />
                      <span>Financing options for puppies, supplies, and training</span>
                    </li>
                    <li className="flex items-start">
                      <PawPrint className="h-5 w-5 text-brand-red mr-2 mt-0.5 flex-shrink-0" />
                      <span>Quick decision process, often within minutes</span>
                    </li>
                    <li className="flex items-start">
                      <PawPrint className="h-5 w-5 text-brand-red mr-2 mt-0.5 flex-shrink-0" />
                      <span>No prepayment penalties</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="bg-secondary/50 flex justify-center py-6">
                <div className="text-center">
                  {countdown !== null ? (
                    <div className="mb-2 text-lg font-semibold">
                      Redirecting in {countdown} seconds...
                    </div>
                  ) : (
                    <Button 
                      onClick={handleApplyNow} 
                      size="lg" 
                      className="bg-brand-red hover:bg-red-700 text-white"
                    >
                      Apply Now <ArrowRight className="ml-2" />
                    </Button>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    You'll be redirected to the Terrace Pets application page
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>

          {/* Stud Service Section */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center">
                <Award className="mr-2 text-brand-red" />
                Stud Services
              </h2>
              <Link to="/contact">
                <Button variant="outline" className="flex items-center">
                  Request Stud Service <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {studDogs.map(dog => (
                <StudServiceCard key={dog.id} dog={dog} />
              ))}
            </div>

            <div className="bg-secondary/50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <ClipboardCheck className="mr-2 text-brand-red" />
                Stud Service Request Process
              </h3>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-brand-red text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">1</div>
                  <div>
                    <strong>Contact Us</strong>
                    <p className="text-muted-foreground">Submit your initial request through our contact form including details about your female dog.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-brand-red text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">2</div>
                  <div>
                    <strong>Health Verification</strong>
                    <p className="text-muted-foreground">We'll request health records and certifications for your dog to ensure a healthy match.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-brand-red text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">3</div>
                  <div>
                    <strong>Scheduling</strong>
                    <p className="text-muted-foreground">Once approved, we'll schedule the service based on your dog's heat cycle and availability.</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-brand-red text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">4</div>
                  <div>
                    <strong>Service & Follow-up</strong>
                    <p className="text-muted-foreground">After the service, we provide follow-up support and guidance throughout the pregnancy.</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
};

export default Financing;
