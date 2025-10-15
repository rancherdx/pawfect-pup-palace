import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient } from '@tanstack/react-query'
import App from './App.tsx'
import './index.css'
import { HelmetProvider } from 'react-helmet-async'

// Configure React Query with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Add playful puppy-themed fonts with optimized loading and font-display swap
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Fredoka+One:wght@400&family=Nunito:wght@300;400;500;600;700;800&family=Comfortaa:wght@300;400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap';
fontLink.media = 'print';
fontLink.onload = function(this: HTMLLinkElement) { this.media = 'all'; };
document.head.appendChild(fontLink);

// Preload critical font for faster FCP
const preloadFont = document.createElement('link');
preloadFont.rel = 'preload';
preloadFont.as = 'font';
preloadFont.type = 'font/woff2';
preloadFont.href = 'https://fonts.gstatic.com/s/nunito/v32/XRXV3I6Li01BKofINeaBTMnFcQ.woff2';
preloadFont.crossOrigin = 'anonymous';
document.head.appendChild(preloadFont);

// Add favicon
const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.href = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'%23E53E3E\' stroke=\'%23E53E3E\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Ccircle cx=\'12\' cy=\'13\' r=\'8\'/%3E%3Ccircle cx=\'13\' cy=\'11\' r=\'2\'/%3E%3Ccircle cx=\'9\' cy=\'9\' r=\'2\'/%3E%3Ccircle cx=\'15\' cy=\'9\' r=\'2\'/%3E%3Ccircle cx=\'18\' cy=\'13\' r=\'2\'/%3E%3Ccircle cx=\'6\' cy=\'13\' r=\'2\'/%3E%3C/svg%3E';
document.head.appendChild(favicon);

const root = createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

// Register Service Worker for PWA - deferred to not block initial render
if ('serviceWorker' in navigator) {
  // Delay SW registration until after FCP
  if (document.readyState === 'complete') {
    registerSW();
  } else {
    window.addEventListener('load', () => {
      // Additional delay to ensure FCP happens first
      setTimeout(registerSW, 100);
    });
  }
}

function registerSW() {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
      // Request notification permission for push notifications
      if ('Notification' in window && 'PushManager' in window) {
        // Don't request permission immediately - let user opt-in via UI
        console.log('Push notifications are supported');
      }
    })
    .catch(error => {
      console.log('ServiceWorker registration failed: ', error);
    });
}
