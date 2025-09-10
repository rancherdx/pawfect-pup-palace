import { useEffect } from 'react';

// CORS configuration component to ensure proper headers for custom domain
const CorsConfig = () => {
  useEffect(() => {
    // Set up global CORS headers for fetch requests
    const originalFetch = window.fetch;
    
    window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
      const headers = new Headers(init?.headers);
      
      // Add CORS headers for cross-origin requests
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      
      return originalFetch(input, {
        ...init,
        headers,
        credentials: 'include'
      });
    };

    // Cleanup on unmount
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null; // This component doesn't render anything
};

export default CorsConfig;