import { motion, AnimatePresence } from 'framer-motion';
import { PawPrint, Heart, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SplashScreenProps {
  type: 'welcome' | 'puppies' | 'admin' | 'dashboard' | 'checkout';
  onComplete?: () => void;
  duration?: number;
}

const splashConfig = {
  welcome: {
    icon: Heart,
    title: 'Welcome to GDS Puppies',
    subtitle: 'Find Your Perfect Companion',
    gradient: 'from-primary via-accent to-primary',
  },
  puppies: {
    icon: PawPrint,
    title: 'Meet Our Puppies',
    subtitle: 'Your new best friend awaits!',
    gradient: 'from-accent via-primary to-accent',
  },
  admin: {
    icon: Sparkles,
    title: 'Admin Dashboard',
    subtitle: 'Managing with love',
    gradient: 'from-primary via-secondary to-primary',
  },
  dashboard: {
    icon: Heart,
    title: 'Your Dashboard',
    subtitle: 'Welcome back!',
    gradient: 'from-accent via-primary to-accent',
  },
  checkout: {
    icon: PawPrint,
    title: 'Almost There!',
    subtitle: "Let's bring your puppy home",
    gradient: 'from-primary via-accent to-primary',
  },
};

export const SplashScreen = ({ type, onComplete, duration = 1500 }: SplashScreenProps) => {
  const [show, setShow] = useState(true);
  const config = splashConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => {
        onComplete?.();
      }, 500);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br ${config.gradient} bg-[length:200%_200%] animate-gradient-shift`}
        >
          <div className="text-center space-y-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 260,
                damping: 20,
                duration: 0.6
              }}
              className="flex justify-center"
            >
              <div className="relative">
                <Icon className="w-24 h-24 text-white drop-shadow-2xl" strokeWidth={1.5} />
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-white/20 rounded-full blur-2xl"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="space-y-2"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg font-heading">
                {config.title}
              </h1>
              <p className="text-xl text-white/90 font-display">
                {config.subtitle}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center gap-2"
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-3 h-3 bg-white rounded-full"
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
