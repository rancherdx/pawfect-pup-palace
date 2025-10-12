import { useState } from 'react';
import { Bell, BellRing, Check, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
  const { 
    notifications, 
    unreadNotifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);

  // Show only the 5 most recent notifications in dropdown
  const recentNotifications = notifications.slice(0, 5);

  const getBellIcon = () => {
    if (unreadCount === 0) {
      return <Bell className="h-5 w-5" />;
    }
    return <BellRing className="h-5 w-5 text-primary animate-pulse" />;
  };

  const getNotificationIcon = (type: string, priority: string) => {
    const iconClass = "h-4 w-4 flex-shrink-0";
    
    if (priority === 'high') {
      return <Bell className={`${iconClass} text-destructive`} />;
    }
    
    switch (type) {
      case 'success':
        return <Check className={`${iconClass} text-green-500`} />;
      case 'warning':
        return <Bell className={`${iconClass} text-yellow-500`} />;
      case 'error':
        return <X className={`${iconClass} text-red-500`} />;
      default:
        return <Bell className={`${iconClass} text-blue-500`} />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative rounded-full hover:bg-primary/10 transition-colors"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          {getBellIcon()}
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-destructive text-white text-xs px-1 min-w-[1.2rem] h-5 flex items-center justify-center rounded-full border-2 border-background">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0 bg-background border border-border shadow-lg z-50"
        sideOffset={5}
      >
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs h-8 px-2"
              >
                Mark all read
              </Button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto bg-background">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground bg-background">
              Loading notifications...
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="p-8 text-center bg-background">
              <Bell className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer bg-background ${
                    !notification.read ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                  }`}
                  onClick={() => {
                    // Notifications disabled - no action needed
                    if (notification.action_url) {
                      window.open(notification.action_url, '_blank');
                    }
                  }}
                >
                  <div className="flex gap-3">
                    {getNotificationIcon(notification.type, notification.priority)}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium leading-tight ${
                          !notification.read ? 'font-semibold' : ''
                        }`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center gap-1">
                          {notification.priority === 'high' && (
                            <Badge variant="destructive" className="text-xs px-1">
                              HIGH
                            </Badge>
                          )}
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 5 && (
          <div className="p-2 border-t bg-background">
            <Link to="/dashboard" onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="w-full text-sm" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                View All Notifications
              </Button>
            </Link>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationDropdown;