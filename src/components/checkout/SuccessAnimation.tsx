
import { useEffect, useState } from "react";
import { HeartHandshake, PawPrint, Dog, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";

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

const boneShape = {
  draw: (ctx: any) => {
    ctx.beginPath();
    // Draw bone shape
    ctx.arc(0, -6, 6, 0, Math.PI * 2);
    ctx.arc(0, 6, 6, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
};

const pawShape = {
  draw: (ctx: any) => {
    ctx.beginPath();
    // Draw paw shape - main pad
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    // Draw toe pads
    ctx.arc(-5, -7, 3, 0, Math.PI * 2);
    ctx.arc(0, -9, 3, 0, Math.PI * 2); 
    ctx.arc(5, -7, 3, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
  }
};

const SuccessAnimation = ({ puppy, returnHome, viewProfile }: SuccessAnimationProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    // Trigger confetti after a short delay
    const timer = setTimeout(() => {
      setShowConfetti(true);
      
      // Launch bone and paw-shaped confetti
      const duration = 4 * 1000;
      const end = Date.now() + duration;
      
      const colors = ['#ff6b6b', '#ffffff', '#343a40', '#E53E3E'];
      
      (function frame() {
        // Standard confetti
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
          shapes: [boneShape, 'circle']
        });
        
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
          shapes: [pawShape, 'circle']
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
          <motion.div 
            className="rounded-full bg-green-100 p-5 shadow-xl"
            animate={{ rotate: [0, 10, -10, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <HeartHandshake className="h-16 w-16 text-brand-red" />
          </motion.div>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-brand-red to-red-600 bg-clip-text text-transparent">
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
            <Card className="overflow-hidden max-w-md mx-auto shadow-lg rounded-[calc(var(--radius)*1.5)]">
              <CardContent className="p-0">
                <div className="aspect-video w-full overflow-hidden">
                  <motion.img 
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    src={puppy.image} 
                    alt={puppy.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: [0.9, 1.05, 1] }}
                    transition={{ duration: 1.5, delay: 1 }}
                  >
                    <h3 className="text-2xl font-bold">{puppy.name}</h3>
                    <p className="text-muted-foreground">{puppy.breed}</p>
                  </motion.div>
                  
                  <div className="mt-4 flex items-center justify-center space-x-3">
                    <motion.div 
                      className="p-2 bg-brand-red/10 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 1, repeat: Infinity, repeatType: "mirror" }}
                    >
                      <PawPrint className="h-5 w-5 text-brand-red" />
                    </motion.div>
                    <motion.div 
                      className="p-2 bg-brand-red/10 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 1, delay: 0.2, repeat: Infinity, repeatType: "mirror" }}
                    >
                      <Dog className="h-5 w-5 text-brand-red" />
                    </motion.div>
                    <motion.div 
                      className="p-2 bg-brand-red/10 rounded-full"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 1, delay: 0.4, repeat: Infinity, repeatType: "mirror" }}
                    >
                      <PawPrint className="h-5 w-5 text-brand-red" />
                    </motion.div>
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
              className="rounded-full border-brand-red/30 hover:bg-brand-red/5"
            >
              Return to Home
            </Button>
            
            <Button
              className="bg-brand-red hover:bg-red-700 text-white rounded-full group"
              size="lg"
              onClick={viewProfile}
            >
              View Puppy Profile 
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.div>
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SuccessAnimation;
