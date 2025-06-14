import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PawPrint, Heart, Gift } from "lucide-react";
import { useHolidayTheme } from "@/contexts/HolidayThemeContext";

interface LoadingSplashProps {
  isLoading: boolean;
  onComplete?: () => void;
}

const holidayContent = {
  juneteenth: {
    message: "Celebrating Freedom & Family",
    sub: "Juneteenth - Freedom Day",
    icon: (size: number) => (
      <Gift size={size} className="text-accent" />
    ),
    extra: (
      <div className="mt-4 text-green-400 font-bold animate-pulse">
        ❤️ Pan-African Pride • Love • Togetherness
      </div>
    )
  },
  fathersday: {
    message: "Happy Father's Day!",
    sub: "Honoring Puppy Dads & Human Dads everywhere",
    icon: (size: number) => (
      <span role="img" aria-label="tie" className="text-yellow-400">👔</span>
    ),
    extra: (
      <div className="mt-4 text-yellow-300 font-medium animate-wiggle">
        "Find the perfect furry companion for Dad!"
      </div>
    )
  },
  none: {
    message: "Finding Perfect Companions",
    sub: "",
    icon: (size: number) => (
      <PawPrint size={size} className="text-brand-red" />
    ),
    extra: null,
  }
};

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

  const { holiday, colors } = useHolidayTheme();
  const holidayProps = holidayContent[holiday] || holidayContent.none;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ 
            background: holiday === "juneteenth"
              ? "linear-gradient(135deg,#E53E3E 50%,#1A1A1A 90%,#228B22 100%)"
              : holiday === "fathersday"
              ? "linear-gradient(140deg, #223A5E 60%, #795548 100%)"
              : "linear-gradient(135deg, #E53E3E 0%, #FFD700 100%)"
          }}
        >
          {/* Background Animation */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
                <PawPrint size={24 + Math.random() * 32}
                  className={holiday === 'juneteenth'
                    ? "text-green-600"
                    : holiday === 'fathersday'
                      ? "text-blue-300"
                      : "text-white"}
                />
              </motion.div>
            ))}
          </div>

          {/* Main Content */}
          <div className="text-center z-10 max-w-md mx-auto px-6">
            {/* Holiday-specific Icon and Main Logo */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-8"
            >
              <div className="relative flex flex-col items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl"
                >
                  {holidayProps.icon(48)}
                </motion.div>
                {holidayProps.extra}
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-4xl font-bold"
              style={{
                color: colors.primary,
                textShadow: "0 2px 8px rgba(0,0,0,0.2)",
                fontFamily: "'Quicksand', sans-serif"
              }}
            >
              {holiday === "juneteenth"
                ? "GDS Puppies: Juneteenth"
                : holiday === "fathersday"
                  ? "GDS Puppies: Father's Day"
                  : "GDS Puppies"}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="mb-8 text-lg"
              style={{ color: colors.text }}
            >
              {holidayProps.message}
            </motion.p>
            {holidayProps.sub && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="text-base font-semibold mb-4"
                style={{ color: colors.accent }}
              >
                {holidayProps.sub}
              </motion.div>
            )}
            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="w-full max-w-xs mx-auto"
            >
              <div className="bg-white/20 rounded-full h-2 mb-4 overflow-hidden">
                <motion.div
                  className="h-full rounded-full shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{ background: colors.primary }}
                />
              </div>
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-white/80 text-sm"
              >
                {holiday === "juneteenth"
                  ? "Celebrating freedom for all pups & people..."
                  : holiday === "fathersday"
                  ? "Sending puppy love to all dads!"
                  : "Loading your perfect companion..."}
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
