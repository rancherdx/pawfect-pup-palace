import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // To get JWT
import { toast } from 'sonner'; // For displaying notifications

interface NotificationPayload {
  type: string;
  data: any;
}

interface UseAdminNotificationSocketOptions {
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (payload: NotificationPayload) => void; // Callback for generic message handling
}

const WS_URL_BASE = '/ws/admin-notifications'; // Path defined in backend (worker/index.ts)
// In a real app, this base URL might come from env variables if worker is on different domain/port in dev
const RECONNECT_INTERVAL = 5000; // 5 seconds

const useAdminNotificationSocket = (options?: UseAdminNotificationSocketOptions) => {
  const { token, isAuthenticated, user } = useAuth(); // Assuming useAuth provides the JWT
  const [isConnected, setIsConnected] = useState(false);
  const webSocketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (!token || !isAuthenticated || !user?.roles?.includes('admin')) {
      console.log('Admin Notification WebSocket: No token, not authenticated, or not admin. Skipping connection.');
      return;
    }
    if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
      console.log('Admin Notification WebSocket: Already connected.');
      return;
    }

    // Clear any existing reconnect timer
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${WS_URL_BASE}?token=${token}`;
    console.log('Admin Notification WebSocket: Attempting to connect to', wsUrl);

    const ws = new WebSocket(wsUrl);
    webSocketRef.current = ws;

    ws.onopen = (event) => {
      console.log('Admin Notification WebSocket: Connected.');
      setIsConnected(true);
      options?.onOpen?.(event);
      // Reset reconnect timer on successful connection
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const payload: NotificationPayload = JSON.parse(event.data as string);
        console.log('Admin Notification WebSocket: Message received:', payload);

        // Specific handling for 'new_visit' for toast
        if (payload.type === 'new_visit' && payload.data) {
          const { visitor_id, user_id, page_url, city, country } = payload.data;
          const visitorName = user_id ? `User ${user_id.substring(0,6)}...` : `Visitor ${visitor_id.substring(0,6)}...`;
          const location = city && country ? `${city}, ${country}` : (city || country || 'Unknown location');

          toast.info(
            `New site visit: ${visitorName} on ${page_url}`,
            {
              description: `From: ${location}. Timestamp: ${new Date(payload.data.timestamp * 1000).toLocaleTimeString()}`,
              // TODO: Add onClick handler for toast to navigate to user activity/chat later
              // onClick: () => { /* navigate to relevant page */ }
            }
          );
        }

        options?.onMessage?.(payload); // Generic message handler
      } catch (err) {
        console.error('Admin Notification WebSocket: Error parsing message or in onMessage handler:', err);
      }
    };

    ws.onerror = (event) => {
      console.error('Admin Notification WebSocket: Error:', event);
      setIsConnected(false);
      options?.onError?.(event);
    };

    ws.onclose = (event) => {
      console.log('Admin Notification WebSocket: Disconnected.', event.code, event.reason);
      setIsConnected(false);
      options?.onClose?.(event);
      // Attempt to reconnect if not explicitly closed by client (e.g. logout)
      // Avoid reconnecting for codes like 1000 (normal closure) or auth failure codes if known
      if (event.code !== 1000 && event.code !== 1008 /* Policy Violation, e.g. auth failed */) {
        console.log(`Admin Notification WebSocket: Attempting to reconnect in ${RECONNECT_INTERVAL / 1000}s...`);
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current); // Clear existing before setting new
        reconnectTimerRef.current = setTimeout(connect, RECONNECT_INTERVAL);
      }
    };
  }, [token, isAuthenticated, user, options]);

  useEffect(() => {
    if (token && isAuthenticated && user?.roles?.includes('admin')) {
      connect();
    } else {
      // If auth state changes to unauthenticated/non-admin, close WebSocket
      if (webSocketRef.current) {
        console.log('Admin Notification WebSocket: Closing due to auth changes.');
        webSocketRef.current.close(1000, "User logged out or permissions changed"); // Normal closure
      }
       if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    }

    return () => {
      // Cleanup on component unmount
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (webSocketRef.current) {
        console.log('Admin Notification WebSocket: Closing on component unmount.');
        webSocketRef.current.close(1000, "Component unmounted");
        webSocketRef.current = null;
      }
    };
  }, [token, isAuthenticated, user, connect]);

  return {
    isConnected,
    send: (message: string | ArrayBufferLike | Blob | ArrayBufferView) => {
      if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
        webSocketRef.current.send(message);
      } else {
        console.error('Admin Notification WebSocket: Not connected. Cannot send message.');
      }
    },
    // Manually trigger connect/disconnect if needed outside of auth changes
    manualConnect: connect,
    manualDisconnect: () => {
        if (webSocketRef.current) {
            webSocketRef.current.close(1000, "Manual disconnect");
        }
         if (reconnectTimerRef.current) { // also clear reconnect timer on manual disconnect
            clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
    }
  };
};

export default useAdminNotificationSocket;
