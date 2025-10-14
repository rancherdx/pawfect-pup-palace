import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";
import HalloweenDecorations from "@/components/HalloweenDecorations";
import { NavbarRedesigned } from "@/components/NavbarRedesigned";
import Footer from "@/components/Footer";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface AnimatedLayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
  centered?: boolean;
}

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
};

const pageTransition = {
  type: 'tween' as const,
  ease: "easeOut" as const,
  duration: 0.4
};

/**
 * Enhanced Layout component with animations, Halloween theming, and smooth transitions
 */
const AnimatedLayout = ({ children, fullWidth = false, centered = false }: AnimatedLayoutProps) => {
  const location = useLocation();
  const { holiday, holidayEnabled, resolvedTheme } = useTheme();
  const [fontSize, setFontSize] = useLocalStorage("gds-font-size", "normal");
  
  const showHalloweenDecorations = holidayEnabled && holiday === 'halloween';
  
  return (
    <motion.div 
      className={`flex flex-col min-h-screen bg-background text-foreground transition-colors duration-500 font-body ${showHalloweenDecorations ? 'halloween-bg' : 'paw-print-bg'}`}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {/* Halloween decorations overlay */}
      <AnimatePresence>
      {showHalloweenDecorations && <HalloweenDecorations />}
      </AnimatePresence>
      
      <NavbarRedesigned />
      
      <AnimatePresence mode="wait">
        <motion.main 
          key={location.pathname}
          className={`flex-grow ${!fullWidth && "container mx-auto px-4"} ${centered && "flex items-center justify-center"} relative z-10`}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      
      <Footer />
    </motion.div>
  );
};

export default AnimatedLayout;