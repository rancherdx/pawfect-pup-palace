import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import { toast } from 'sonner';

/**
 * @interface Notification
 * @description Defines the structure of a notification object.
 */
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
  priority: 'low' | 'medium' | 'high';
}

/**
 * @hook useNotifications
 * @description A custom hook for fetching and managing user notifications.
 * It provides the list of notifications, unread count, and functions to mark notifications as read.
 * @returns {{ notifications: Notification[], unreadNotifications: Notification[], unreadCount: number, isLoading: boolean, markAsRead: (notificationId: string) => void, markAllAsRead: () => void, isPending: boolean }} An object containing the notifications state and management functions.
 */
export const useNotifications = () => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => adminApi.getNotifications(),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 30000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationIds: string[]) => 
      adminApi.markNotificationsAsRead(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to mark as read: ${error.message}`);
    }
  });

  const unreadNotifications = notifications.filter((n: Notification) => !n.read);
  const unreadCount = unreadNotifications.length;

  /**
   * Marks a single notification as read.
   * @param {string} notificationId - The ID of the notification to mark as read.
   */
  const markAsRead = (notificationId: string) => {
    markAsReadMutation.mutate([notificationId]);
  };

  /**
   * Marks all unread notifications as read.
   */
  const markAllAsRead = () => {
    const unreadIds = unreadNotifications.map((n: Notification) => n.id);
    if (unreadIds.length > 0) {
      markAsReadMutation.mutate(unreadIds);
    }
  };

  return {
    notifications: notifications as Notification[],
    unreadNotifications: unreadNotifications as Notification[],
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    isPending: markAsReadMutation.isPending,
  };
};