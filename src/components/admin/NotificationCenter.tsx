import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Bell, 
  BellRing, 
  Mail, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  X,
  Settings,
  Send,
  Users,
  Heart
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

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
 * @interface NotificationSettings
 * @description Defines the structure for user notification settings.
 */
interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  new_inquiries: boolean;
  puppy_applications: boolean;
  payment_notifications: boolean;
  system_alerts: boolean;
  marketing_updates: boolean;
}

/**
 * @component NotificationCenter
 * @description A comprehensive component for viewing and managing system notifications and user notification settings.
 * @returns {React.ReactElement} The rendered notification center interface.
 */
const NotificationCenter = () => {
  const [activeTab, setActiveTab] = useState("notifications");
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [composeData, setComposeData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    send_email: false,
    target_users: 'all' as 'all' | 'customers' | 'admins'
  });
  const queryClient = useQueryClient();

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => adminApi.getNotifications(),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 30000,
  });

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: () => adminApi.getNotificationSettings(),
    staleTime: 5 * 60 * 1000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notificationIds: string[]) => 
      adminApi.markNotificationsAsRead(notificationIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: Partial<NotificationSettings>) => 
      adminApi.updateNotificationSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast.success('Notification settings updated successfully!');
    },
    onError: (err: Error) => {
      toast.error(`Failed to update notification settings: ${err.message}`);
    }
  });

  const createNotificationMutation = useMutation({
    mutationFn: (data: typeof composeData) => 
      adminApi.createNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification sent successfully!');
      setShowComposeDialog(false);
      setComposeData({
        title: '',
        message: '',
        type: 'info',
        send_email: false,
        target_users: 'all'
      });
    },
    onError: (err: Error) => {
      toast.error(`Failed to send notification: ${err.message}`);
    }
  });

  const notificationsList: Notification[] = notifications || [];
  const notificationSettings: NotificationSettings = settings || {
    email_notifications: true,
    push_notifications: true,
    new_inquiries: true,
    puppy_applications: true,
    payment_notifications: true,
    system_alerts: true,
    marketing_updates: false,
  };

  const unreadCount = notificationsList.filter(n => !n.read).length;

  /**
   * Returns an icon component based on the notification type and priority.
   * @param {string} type - The type of the notification.
   * @param {string} priority - The priority of the notification.
   * @returns {React.ReactElement} A Lucide icon component.
   */
  const getNotificationIcon = (type: string, priority: string) => {
    if (priority === 'high') {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  /**
   * Returns a styled Badge component based on the notification type.
   * @param {string} type - The type of the notification.
   * @returns {React.ReactElement} A styled Badge component.
   */
  const getNotificationBadge = (type: string) => {
    const colors = {
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800'
    };
    return (
      <Badge className={colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  /**
   * Marks all unread notifications as read.
   */
  const handleMarkAllAsRead = () => {
    const unreadIds = notificationsList.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length > 0) {
      markAsReadMutation.mutate(unreadIds);
    }
  };

  /**
   * Marks a single notification as read.
   * @param {string} notificationId - The ID of the notification to mark as read.
   */
  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate([notificationId]);
  };

  /**
   * Toggles a specific notification setting.
   * @param {keyof NotificationSettings} setting - The setting to toggle.
   * @param {boolean} value - The new value for the setting.
   */
  const handleSettingToggle = (setting: keyof NotificationSettings, value: boolean) => {
    updateSettingsMutation.mutate({ [setting]: value });
  };

  /**
   * Handles the submission of the compose notification dialog.
   */
  const handleSendNotification = () => {
    if (!composeData.title.trim() || !composeData.message.trim()) {
      toast.error('Please fill in both title and message');
      return;
    }
    createNotificationMutation.mutate(composeData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold flex items-center">
          <div className="relative">
            <Bell className="mr-2 h-6 w-6" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 min-w-[1.2rem] h-5 flex items-center justify-center rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </div>
          Notification Center
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0 || markAsReadMutation.isPending}
          >
            Mark All Read
          </Button>
          <Button
            onClick={() => setShowComposeDialog(true)}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Send Notification
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">
            Notifications {unreadCount > 0 && `(${unreadCount})`}
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notificationsList.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No notifications yet</p>
                  </div>
                ) : (
                  notificationsList.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        !notification.read ? 'bg-blue-50 border-blue-200' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getNotificationIcon(notification.type, notification.priority)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{notification.title}</h4>
                              {getNotificationBadge(notification.type)}
                              {notification.priority === 'high' && (
                                <Badge variant="destructive">HIGH PRIORITY</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Mark Read
                            </Button>
                          )}
                          {notification.action_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(notification.action_url, '_blank')}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Notifications
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.email_notifications}
                  onCheckedChange={(checked) => handleSettingToggle('email_notifications', checked)}
                  disabled={updateSettingsMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <BellRing className="h-4 w-4" />
                    Push Notifications
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Show browser notifications
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.push_notifications}
                  onCheckedChange={(checked) => handleSettingToggle('push_notifications', checked)}
                  disabled={updateSettingsMutation.isPending}
                />
              </div>

              <hr />

              <div className="space-y-4">
                <h4 className="font-medium">Notification Types</h4>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      New Inquiries
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      Contact form submissions and puppy inquiries
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.new_inquiries}
                    onCheckedChange={(checked) => handleSettingToggle('new_inquiries', checked)}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Puppy Applications
                    </h5>
                    <p className="text-xs text-muted-foreground">
                      New adoption applications and updates
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.puppy_applications}
                    onCheckedChange={(checked) => handleSettingToggle('puppy_applications', checked)}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium">Payment Notifications</h5>
                    <p className="text-xs text-muted-foreground">
                      Payment confirmations and issues
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.payment_notifications}
                    onCheckedChange={(checked) => handleSettingToggle('payment_notifications', checked)}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium">System Alerts</h5>
                    <p className="text-xs text-muted-foreground">
                      System maintenance and security alerts
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.system_alerts}
                    onCheckedChange={(checked) => handleSettingToggle('system_alerts', checked)}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-medium">Marketing Updates</h5>
                    <p className="text-xs text-muted-foreground">
                      Product updates and marketing messages
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.marketing_updates}
                    onCheckedChange={(checked) => handleSettingToggle('marketing_updates', checked)}
                    disabled={updateSettingsMutation.isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compose Notification Dialog */}
      <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              Create and send a notification to users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={composeData.title}
                onChange={(e) => setComposeData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Notification title"
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={composeData.message}
                onChange={(e) => setComposeData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Notification message"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={composeData.type}
                  onChange={(e) => setComposeData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div>
                <Label htmlFor="target">Target Users</Label>
                <select
                  id="target"
                  value={composeData.target_users}
                  onChange={(e) => setComposeData(prev => ({ ...prev, target_users: e.target.value as any }))}
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                >
                  <option value="all">All Users</option>
                  <option value="customers">Customers Only</option>
                  <option value="admins">Admins Only</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="send_email"
                checked={composeData.send_email}
                onChange={(e) => setComposeData(prev => ({ ...prev, send_email: e.target.checked }))}
              />
              <Label htmlFor="send_email">Also send via email</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowComposeDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSendNotification}
                disabled={createNotificationMutation.isPending}
              >
                {createNotificationMutation.isPending ? 'Sending...' : 'Send Notification'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationCenter;