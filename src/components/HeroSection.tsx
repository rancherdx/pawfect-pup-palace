
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { PawPrint } from "lucide-react";

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
        style={{ backgroundImage: `url(${imageSrc})` }}
      />
      
      {/* Dark Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-black/40 dark:bg-black/60 z-0" />
      )}

      {/* Floating paw prints */}
      <div className="absolute top-20 left-10 animate-float">
        <PawPrint className="h-12 w-12 text-white/20" />
      </div>
      <div className="absolute bottom-20 right-10 animate-float animation-delay-2000">
        <PawPrint className="h-10 w-10 text-white/20" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-center items-center text-center py-24">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 [text-shadow:_0_2px_10px_rgb(0_0_0_/_40%)]">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-8 [text-shadow:_0_1px_5px_rgb(0_0_0_/_40%)]">
          {subtitle}
        </p>
        
        <Button 
          asChild 
          size="lg" 
          className="bg-brand-red hover:bg-red-700 text-white btn-bounce"
        >
          <Link to={ctaLink}>{ctaText}</Link>
        </Button>

        {children}
      </div>
    </div>
  );
};

export default HeroSection;
