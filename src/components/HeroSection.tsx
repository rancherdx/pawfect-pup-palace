
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { motion } from "framer-motion";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  imageSrc: string;
  ctaText: string;
  ctaLink: string;
  overlay?: boolean;
  children?: ReactNode;
}

const HeroSection = ({
  title,
  subtitle,
  imageSrc,
  ctaText,
  ctaLink,
  overlay = true,
  children,
}: HeroSectionProps) => {
  return (
    <div className="hero-section relative">
      {/* Background Image with Parallax Effect */}
      <div 
        className="parallax-bg"
        style={{ 
          backgroundImage: `url(${imageSrc})`,
          backgroundAttachment: "fixed"
        }}
      />
      
      {/* Dark Overlay with gradient */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30 dark:from-black/70 dark:to-black/40 z-0" />
      )}

      {/* Floating paw prints */}
      <motion.div 
        className="absolute top-20 left-10" 
        animate={{ y: [0, -20, 0] }} 
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <PawPrint className="h-12 w-12 text-white/20" />
      </motion.div>
      
      <motion.div 
        className="absolute bottom-20 right-10"
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <PawPrint className="h-10 w-10 text-white/20" />
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-center items-center text-center py-24">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 [text-shadow:_0_2px_10px_rgb(0_0_0_/_40%)]"
        >
          {title}
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-white/90 max-w-2xl mb-8 [text-shadow:_0_1px_5px_rgb(0_0_0_/_40%)]"
        >
          {subtitle}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button 
            asChild 
            size="lg" 
            className="bg-brand-red hover:bg-red-700 text-white rounded-full group"
          >
            <Link to={ctaLink} className="flex items-center space-x-2">
              <PawPrint className="h-5 w-5 group-hover:animate-bounce" />
              <span>{ctaText}</span>
            </Link>
          </Button>
        </motion.div>

        {children}
      </div>
      
      {/* Curved bottom edge */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg
          className="relative block w-full h-10 text-background"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,32L60,26.7C120,21,240,11,360,16C480,21,600,43,720,42.7C840,43,960,21,1080,10.7C1200,0,1320,0,1380,0L1440,0L1440,100L1380,100C1320,100,1200,100,1080,100C960,100,840,100,720,100C600,100,480,100,360,100C240,100,120,100,60,100L0,100Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default HeroSection;
