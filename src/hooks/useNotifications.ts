import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import { toast } from 'sonner';

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

  const markAsRead = (notificationId: string) => {
    markAsReadMutation.mutate([notificationId]);
  };

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