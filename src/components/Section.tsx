
import { ReactNode } from "react";

interface SectionProps {
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
  withPawPrintBg?: boolean;
  curved?: boolean;
}

const Section = ({ 
  title, 
  subtitle, 
  className = "", 
  children, 
  withPawPrintBg = false,
  curved = false
}: SectionProps) => {
  return (
    <section 
      className={`py-16 md:py-24 relative ${withPawPrintBg ? 'paw-print-bg' : ''} ${className} ${curved ? 'curved-section' : ''}`}
    >
      <div className="container mx-auto px-4 relative z-10">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4 relative inline-block">
                {title}
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-brand-red/50 rounded-full"></span>
              </h2>
            )}
            
            {subtitle && (
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}
        
        {children}
      </div>
      
      {/* Add curved bottom edge if needed */}
      {curved && (
        <div className="absolute bottom-0 left-0 w-full overflow-hidden z-10">
          <svg
            className="relative block w-full h-10 text-background"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 100"
            preserveAspectRatio="none"
          >
            <path
              fill="currentColor"
              d="M0,32L60,32C120,32,240,32,360,53.3C480,75,600,117,720,122.7C840,128,960,96,1080,80C1200,64,1320,64,1380,64L1440,64L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
            ></path>
          </svg>
        </div>
      )}
    </section>
  );
};

export default Section;
