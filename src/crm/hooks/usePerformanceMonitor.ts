import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  memoryUsage?: number;
  loadTime: number;
  renderTime: number;
  errorCount: number;
}

// Global performance tracking
let globalMetrics: PerformanceMetrics = {
  loadTime: 0,
  renderTime: 0,
  errorCount: 0,
};

// Track memory usage if available
const getMemoryUsage = (): number | undefined => {
  if ('memory' in performance && (performance as any).memory) {
    return (performance as any).memory.usedJSHeapSize / 1048576; // Convert to MB
  }
  return undefined;
};

// Monitor for memory leaks
const memoryLeakDetector = () => {
  const memoryUsage = getMemoryUsage();
  if (memoryUsage && memoryUsage > 100) { // Alert if over 100MB
    console.warn(`High memory usage detected: ${memoryUsage.toFixed(2)}MB`);
    
    // In production, you could send this to an analytics service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendToAnalytics('memory-warning', { usage: memoryUsage });
    }
  }
};

// Global error handler
const setupGlobalErrorHandling = () => {
  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    globalMetrics.errorCount++;
    
    // Prevent the error from causing a blank screen
    event.preventDefault();
  });

  // Catch JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('JavaScript error:', event.error);
    globalMetrics.errorCount++;
  });
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName?: string) => {
  const startTime = useRef(performance.now());
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      setupGlobalErrorHandling();
      isInitialized.current = true;
    }

    const loadEndTime = performance.now();
    globalMetrics.loadTime = loadEndTime - startTime.current;

    // Monitor memory every 30 seconds
    const memoryInterval = setInterval(memoryLeakDetector, 30000);

    // Track component render time
    const renderEndTime = performance.now();
    globalMetrics.renderTime = renderEndTime - startTime.current;

    if (componentName && globalMetrics.renderTime > 1000) {
      console.warn(`Slow render detected in ${componentName}: ${globalMetrics.renderTime.toFixed(2)}ms`);
    }

    return () => {
      clearInterval(memoryInterval);
    };
  }, [componentName]);

  // Function to get current metrics
  const getMetrics = (): PerformanceMetrics => {
    return {
      ...globalMetrics,
      memoryUsage: getMemoryUsage(),
    };
  };

  // Function to force garbage collection if available (development only)
  const forceGarbageCollection = () => {
    if (process.env.NODE_ENV === 'development' && 'gc' in window) {
      try {
        (window as any).gc();
        console.log('Forced garbage collection');
      } catch (error) {
        console.warn('Could not force garbage collection:', error);
      }
    }
  };

  return {
    getMetrics,
    forceGarbageCollection,
  };
};

// Utility to check if the app is in a bad state
export const checkAppHealth = (): boolean => {
  const metrics = {
    ...globalMetrics,
    memoryUsage: getMemoryUsage(),
  };

  // Check for concerning metrics
  const isUnhealthy = 
    (metrics.memoryUsage && metrics.memoryUsage > 150) || // Over 150MB
    metrics.errorCount > 10 || // More than 10 errors
    metrics.renderTime > 5000; // Render took over 5 seconds

  if (isUnhealthy) {
    console.warn('App health check failed:', metrics);
    return false;
  }

  return true;
};

// Auto-recovery function
export const attemptAutoRecovery = () => {
  console.log('Attempting auto-recovery...');
  
  try {
    // Clear any stored state that might be corrupted
    const keysToPreserve = ['user-preferences', 'auth-token'];
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && !keysToPreserve.includes(key)) {
        localStorage.removeItem(key);
      }
    }

    // Clear session storage
    sessionStorage.clear();

    // Reset global metrics
    globalMetrics = {
      loadTime: 0,
      renderTime: 0,
      errorCount: 0,
    };

    console.log('Auto-recovery completed');
    return true;
  } catch (error) {
    console.error('Auto-recovery failed:', error);
    return false;
  }
};

export default usePerformanceMonitor;
