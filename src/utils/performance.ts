// Performance monitoring utilities

export interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
  type: 'navigation' | 'resource' | 'paint' | 'custom';
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private observers: PerformanceObserver[] = [];

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.addMetric({
              name: entry.name,
              duration: entry.duration,
              timestamp: entry.startTime,
              type: 'navigation'
            });
          });
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);
      } catch (e) {
        console.warn('Navigation observer not supported');
      }

      // Observe paint timing
      try {
        const paintObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.addMetric({
              name: entry.name,
              duration: entry.startTime,
              timestamp: entry.startTime,
              type: 'paint'
            });
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(paintObserver);
      } catch (e) {
        console.warn('Paint observer not supported');
      }

      // Observe resource timing
      try {
        const resourceObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            // Only track significant resources
            const resourceEntry = entry as PerformanceResourceTiming;
            if (entry.duration > 100 || (resourceEntry.transferSize && resourceEntry.transferSize > 50000)) {
              this.addMetric({
                name: entry.name,
                duration: entry.duration,
                timestamp: entry.startTime,
                type: 'resource'
              });
            }
          });
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);
      } catch (e) {
        console.warn('Resource observer not supported');
      }
    }
  }

  addMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);
    
    // Keep only last 100 metrics to prevent memory issues
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Log slow operations
    if (metric.duration > 1000) {
      console.warn('Slow operation detected:', metric);
    }
  }

  // Custom timing measurement
  startTiming(name: string): () => void {
    const startTime = performance.now();
    return () => {
      const duration = performance.now() - startTime;
      this.addMetric({
        name,
        duration,
        timestamp: startTime,
        type: 'custom'
      });
    };
  }

  getMetrics(type?: PerformanceMetrics['type']): PerformanceMetrics[] {
    return type ? this.metrics.filter(m => m.type === type) : this.metrics;
  }

  getAverageLoadTime(): number {
    const navMetrics = this.metrics.filter(m => m.type === 'navigation');
    if (navMetrics.length === 0) return 0;
    
    const total = navMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / navMetrics.length;
  }

  getLargestContentfulPaint(): number {
    const paintMetrics = this.metrics.filter(m => 
      m.type === 'paint' && m.name === 'largest-contentful-paint'
    );
    return paintMetrics.length > 0 ? paintMetrics[0].duration : 0;
  }

  getSlowResources(): PerformanceMetrics[] {
    return this.metrics.filter(m => 
      m.type === 'resource' && m.duration > 1000
    );
  }

  // Export metrics for analytics
  exportMetrics(): string {
    return JSON.stringify({
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      metrics: this.metrics,
      vitals: {
        averageLoadTime: this.getAverageLoadTime(),
        largestContentfulPaint: this.getLargestContentfulPaint(),
        slowResourcesCount: this.getSlowResources().length
      }
    });
  }

  dispose() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics = [];
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Hook for React components to measure render performance
export const usePerformanceTracking = (componentName: string) => {
  const measureRender = () => {
    return performanceMonitor.startTiming(`${componentName}_render`);
  };

  return { measureRender };
};

// Web Vitals measurement
export const measureWebVitals = () => {
  // Measure CLS (Cumulative Layout Shift)
  if ('PerformanceObserver' in window) {
    try {
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (entry.value) {
            performanceMonitor.addMetric({
              name: 'cumulative-layout-shift',
              duration: entry.value,
              timestamp: entry.startTime,
              type: 'custom'
            });
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS measurement not supported');
    }
  }

  // Report to console in development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      console.group('Performance Metrics');
      console.log('Average Load Time:', performanceMonitor.getAverageLoadTime().toFixed(2), 'ms');
      console.log('LCP:', performanceMonitor.getLargestContentfulPaint().toFixed(2), 'ms');
      console.log('Slow Resources:', performanceMonitor.getSlowResources().length);
      console.groupEnd();
    }, 5000);
  }
};
