// Disabled - Notification API not implemented
export const useNotifications = () => {
  return {
    notifications: [],
    unreadNotifications: [],
    unreadCount: 0,
    isLoading: false,
    markAsRead: () => {},
    markAllAsRead: () => {},
    isPending: false,
  };
};
