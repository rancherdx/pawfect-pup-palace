
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PawPrint, Heart } from "lucide-react";

interface LoadingSplashProps {
  isLoading: boolean;
  onComplete?: () => void;
}

const LoadingSplash = ({ isLoading, onComplete }: LoadingSplashProps) => {
  const [progress, setProgress] = useState(0);
  const [showHearts, setShowHearts] = useState(false);

  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete?.();
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    // Show hearts animation after 1 second
    const heartsTimer = setTimeout(() => setShowHearts(true), 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(heartsTimer);
    };
  }, [isLoading, onComplete]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-brand-red via-red-500 to-red-600"
        >
          {/* Background Animation */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute opacity-10"
                animate={{
                  x: [0, Math.random() * 100 - 50],
                  y: [0, Math.random() * 100 - 50],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              >
                <PawPrint size={24 + Math.random() * 32} className="text-white" />
              </motion.div>
            ))}
          </div>

          {/* Main Content */}
          <div className="text-center z-10 max-w-md mx-auto px-6">
            {/* Logo Animation */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-8"
            >
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl"
                >
                  <PawPrint size={48} className="text-brand-red" />
                </motion.div>
                
                {/* Hearts Animation */}
                <AnimatePresence>
                  {showHearts && [...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{
                        scale: [0, 1, 0],
                        x: [0, (Math.random() - 0.5) * 200],
                        y: [0, -100 - Math.random() * 50],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeOut"
                      }}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    >
                      <Heart size={16} className="text-white fill-white" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* App Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-4xl font-bold text-white mb-2 font-quicksand"
            >
              GDS Puppies
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-white/90 mb-8 text-lg"
            >
              Finding Perfect Companions
            </motion.p>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="w-full max-w-xs mx-auto"
            >
              <div className="bg-white/20 rounded-full h-2 mb-4 overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              </div>
              
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-white/80 text-sm"
              >
                Loading your perfect companion...
              </motion.p>
            </motion.div>

            {/* Paw Prints Walking */}
            <div className="absolute bottom-20 left-0 right-0">
              <div className="relative h-8 overflow-hidden">
                <motion.div
                  className="absolute flex space-x-4"
                  animate={{ x: ["-100px", "calc(100vw + 100px)"] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, 0],
                      }}
                      transition={{
                        duration: 0.5,
                        delay: i * 0.1,
                        repeat: Infinity,
                      }}
                    >
                      <PawPrint size={20} className="text-white/60" />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingSplash;
