import React from 'react';
import Lenis from '@studio-freight/lenis';

export const useSmoothScroll = () => {
  React.useEffect(() => {
    // Defer smooth scroll initialization until after LCP to improve performance
    const initSmoothScroll = () => {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      return () => {
        lenis.destroy();
      };
    };

    // Delay initialization to prioritize LCP
    if (document.readyState === 'complete') {
      // Page already loaded, wait a bit more for LCP
      const timer = setTimeout(initSmoothScroll, 500);
      return () => clearTimeout(timer);
    } else {
      // Wait for load event
      const handleLoad = () => {
        setTimeout(initSmoothScroll, 500);
      };
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);
};
