import React, { useEffect, useState } from 'react';

/**
 * @interface PerformanceMetrics
 * @description Defines the structure for storing various performance metrics.
 */
interface PerformanceMetrics {
  loadTime?: number;
  renderTime?: number;
  memoryUsage?: number;
}

/**
 * @hook usePerformance
 * @description A custom React hook to measure and report web performance metrics like load time,
 * render time, and memory usage using the Performance API.
 * @returns {PerformanceMetrics} An object containing the collected performance metrics.
 */
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

/**
 * @component PerformanceMonitor
 * @description A component that utilizes the usePerformance hook to monitor performance
 * and log the metrics to the console in development mode.
 * @param {{ children: React.ReactNode }} props - The props for the component.
 * @returns {React.ReactNode} The children components wrapped by the monitor.
 */
export const PerformanceMonitor: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const metrics = usePerformance();
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metrics:', metrics);
    }
  }, [metrics]);

  return React.createElement(React.Fragment, null, children);
};