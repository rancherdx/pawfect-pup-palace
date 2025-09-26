import React, { useEffect, useState } from 'react';
import { useHolidayTheme } from '@/contexts/HolidayThemeContext';

/**
 * Halloween decorative elements that appear across the site
 */
export const HalloweenDecorations = () => {
  const { holiday } = useHolidayTheme();
  const [showBat, setShowBat] = useState(false);
  const [ghostPosition, setGhostPosition] = useState({ x: 20, y: 20 });

  useEffect(() => {
    if (holiday !== 'halloween') return;

    // Random bat appearance
    const batInterval = setInterval(() => {
      setShowBat(true);
      setTimeout(() => setShowBat(false), 15000);
    }, 30000);

    // Ghost movement
    const ghostInterval = setInterval(() => {
      setGhostPosition({
        x: Math.random() * 80 + 10,
        y: Math.random() * 60 + 20,
      });
    }, 8000);

    return () => {
      clearInterval(batInterval);
      clearInterval(ghostInterval);
    };
  }, [holiday]);

  if (holiday !== 'halloween') return null;

  return (
    <>
      {/* Flying Bat */}
      {showBat && (
        <div className="fixed top-4 z-10 animate-fly-bat pointer-events-none">
          🦇
        </div>
      )}

      {/* Floating Ghost */}
      <div 
        className="fixed z-10 text-4xl transition-all duration-8000 ease-in-out floating-ghost opacity-70 pointer-events-none"
        style={{ 
          left: `${ghostPosition.x}%`, 
          top: `${ghostPosition.y}%` 
        }}
      >
        👻
      </div>

      {/* Corner Cobwebs */}
      <div className="fixed top-0 left-0 z-10 text-6xl opacity-20 pointer-events-none web-decoration">
        🕸️
      </div>
      <div className="fixed top-0 right-0 z-10 text-6xl opacity-20 pointer-events-none web-decoration" style={{ animationDelay: '2s' }}>
        🕸️
      </div>

      {/* Pumpkin in bottom corner */}
      <div className="fixed bottom-4 right-4 z-10 text-3xl animate-spin-pumpkin pointer-events-none">
        🎃
      </div>

      {/* Spider crawling occasionally */}
      <div className="fixed bottom-8 left-0 z-10 text-2xl animate-spider-crawl pointer-events-none opacity-60" style={{ animationDelay: '10s' }}>
        🕷️
      </div>
    </>
  );
};

/**
 * Halloween-themed loading spinner
 */
export const HalloweenSpinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl', 
    lg: 'text-6xl'
  };

  return (
    <div className={`${sizeClasses[size]} animate-spin-pumpkin`}>
      🎃
    </div>
  );
};

/**
 * Halloween-themed card wrapper
 */
export const SpookyCard = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => {
  return (
    <div 
      className={`relative overflow-hidden rounded-lg bg-card text-card-foreground shadow-halloween hover:shadow-spooky transition-all duration-300 ${className}`}
      {...props}
    >
      {/* Corner cobweb decoration */}
      <div className="absolute top-0 right-0 text-xl opacity-30 pointer-events-none">
        🕸️
      </div>
      {children}
    </div>
  );
};

export default HalloweenDecorations;