import React, { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime?: number;
  renderTime?: number;
  memoryUsage?: number;
}

export const usePerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({});

  useEffect(() => {
    const measurePerformance = () => {
      // Navigation timing
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        setMetrics(prev => ({ ...prev, loadTime }));
      }

      // Memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize / 1048576; // Convert to MB
        setMetrics(prev => ({ ...prev, memoryUsage }));
      }
    };

    measurePerformance();
    
    // Measure render time
    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, renderTime }));
    };
  }, []);

  return metrics;
};

export const PerformanceMonitor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const metrics = usePerformance();
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metrics:', metrics);
    }
  }, [metrics]);

  return React.createElement(React.Fragment, null, children);
};