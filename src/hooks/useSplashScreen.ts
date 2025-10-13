import { useState, useEffect, useCallback } from 'react';

type SplashType = 'welcome' | 'puppies' | 'admin' | 'dashboard' | 'checkout';

interface UseSplashScreenOptions {
  storageKey?: string;
  showOnce?: boolean;
}

/**
 * Hook to manage splash screen visibility and state
 * @param type - Type of splash screen to show
 * @param options - Configuration options
 */
export const useSplashScreen = (
  type: SplashType,
  options: UseSplashScreenOptions = {}
) => {
  const { storageKey = `splash-${type}`, showOnce = false } = options;
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Check if splash should be shown
    if (showOnce) {
      const hasShown = localStorage.getItem(storageKey);
      if (hasShown) {
        setShowSplash(false);
        return;
      }
    }

    setShowSplash(true);
  }, [showOnce, storageKey]);

  const handleComplete = useCallback(() => {
    setShowSplash(false);
    if (showOnce) {
      localStorage.setItem(storageKey, 'true');
    }
  }, [showOnce, storageKey]);

  const resetSplash = useCallback(() => {
    localStorage.removeItem(storageKey);
    setShowSplash(true);
  }, [storageKey]);

  return {
    showSplash,
    setShowSplash,
    handleComplete,
    resetSplash,
  };
};
