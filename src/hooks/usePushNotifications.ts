import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface NotificationPreferences {
  site_visits: boolean;
  form_submissions: boolean;
  new_orders: boolean;
  chat_messages: boolean;
}

export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    site_visits: false,
    form_submissions: true,
    new_orders: true,
    chat_messages: true,
  });

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setPreferences({
          site_visits: data.site_visits,
          form_submissions: data.form_submissions,
          new_orders: data.new_orders,
          chat_messages: data.chat_messages,
        });
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support notifications');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        await subscribeToPush();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const subscribeToPush = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (!('serviceWorker' in navigator)) {
        console.warn('Service Worker not supported');
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // For now, we'll just track that the user wants notifications
      // In production, you'd generate VAPID keys and subscribe to push service
      setIsSubscribed(true);
      toast.success('Push notifications enabled!');

      // Save preference
      await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
        });

    } catch (error) {
      console.error('Error subscribing to push:', error);
      toast.error('Failed to enable push notifications');
    }
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updated = { ...preferences, ...newPreferences };
      setPreferences(updated);

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...updated,
        });

      if (error) throw error;
      toast.success('Notification preferences updated');
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from GDS Puppies',
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
      });
    }
  };

  return {
    permission,
    isSubscribed,
    preferences,
    requestPermission,
    updatePreferences,
    sendTestNotification,
  };
};
