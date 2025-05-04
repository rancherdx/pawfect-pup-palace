
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { HeartHandshake, PawPrint, Dog, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import confetti from "canvas-confetti";

interface PuppyData {
  name?: string;
  breed?: string;
  image?: string;
}

interface SuccessAnimationProps {
  puppy: PuppyData | undefined;
  returnHome: () => void;
  viewProfile: () => void;
}

const SuccessAnimation = ({ puppy, returnHome, viewProfile }: SuccessAnimationProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    // Trigger confetti after a short delay
    const timer = setTimeout(() => {
      setShowConfetti(true);
      
      // Launch bone-shaped confetti (simulated with regular confetti)
      const duration = 3 * 1000;
      const end = Date.now() + duration;
      
      const colors = ['#ff6b6b', '#ffffff', '#343a40'];
      
      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });
        
        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-2xl mx-auto text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <HeartHandshake className="h-16 w-16 text-brand-red" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-3">
          Congratulations!
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          {puppy?.name ? `${puppy.name} is` : "Your new puppy is"} ready to come home!
        </p>
        
        {puppy && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8"
          >
            <Card className="overflow-hidden max-w-md mx-auto">
              <CardContent className="p-0">
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={puppy.image} 
                    alt={puppy.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold">{puppy.name}</h3>
                  <p className="text-muted-foreground">{puppy.breed}</p>
                  
                  <div className="mt-4 flex items-center justify-center space-x-3">
                    <div className="p-2 bg-brand-red/10 rounded-full">
                      <PawPrint className="h-5 w-5 text-brand-red" />
                    </div>
                    <div className="p-2 bg-brand-red/10 rounded-full">
                      <Dog className="h-5 w-5 text-brand-red" />
                    </div>
                    <div className="p-2 bg-brand-red/10 rounded-full">
                      <PawPrint className="h-5 w-5 text-brand-red" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mb-8"
        >
          <p className="text-lg mb-6">
            We've created your account and profile for 
            {puppy?.name ? ` ${puppy.name}` : " your new puppy"}.
            <br />All adoption details have been sent to your email.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={returnHome}
            >
              Return to Home
            </Button>
            
            <Button
              className="bg-brand-red hover:bg-red-700 text-white"
              size="lg"
              onClick={viewProfile}
            >
              View Puppy Profile <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SuccessAnimation;
