import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Wrench, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Maintenance = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("We're currently performing maintenance. Please check back soon!");

  useEffect(() => {
    // Fetch custom maintenance message
    const fetchMessage = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'maintenance_mode')
        .maybeSingle();
      
      if (data?.value && typeof data.value === 'object' && 'message' in data.value) {
        const settings = data.value as { message?: string };
        if (settings.message) {
          setMessage(settings.message);
        }
      }
    };

    fetchMessage();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full text-center space-y-8"
      >
        {/* Animated wrench icon */}
        <motion.div
          animate={{
            rotate: [0, -10, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1,
          }}
          className="flex justify-center"
        >
          <div className="p-6 bg-primary/10 rounded-full">
            <Wrench className="h-24 w-24 text-primary" />
          </div>
        </motion.div>

        {/* Main message */}
        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold text-foreground"
          >
            Under Maintenance
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto"
          >
            {message}
          </motion.p>
        </div>

        {/* Animated progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ width: "50%" }}
            />
          </div>
        </motion.div>

        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <p className="text-sm text-muted-foreground">
            We're working hard to improve your experience. This should only take a few minutes.
          </p>
          
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary/5"
              style={{
                width: Math.random() * 300 + 100,
                height: Math.random() * 300 + 100,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Maintenance;
