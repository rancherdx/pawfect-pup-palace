import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, TestTube } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function NotificationSettings() {
  const {
    permission,
    isSubscribed,
    preferences,
    requestPermission,
    updatePreferences,
    sendTestNotification,
  } = usePushNotifications();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notification Settings
        </CardTitle>
        <CardDescription>
          Configure which events trigger push notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {permission === 'default' && (
          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground mb-4">
              Enable push notifications to receive real-time alerts for important events
            </p>
            <Button onClick={requestPermission}>
              <Bell className="mr-2 h-4 w-4" />
              Enable Notifications
            </Button>
          </div>
        )}

        {permission === 'denied' && (
          <div className="p-4 border rounded-lg bg-destructive/10">
            <p className="text-sm text-destructive">
              Notification permission denied. Please enable notifications in your browser settings.
            </p>
          </div>
        )}

        {permission === 'granted' && (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Site Visits</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when new visitors arrive on the site
                  </p>
                </div>
                <Switch
                  checked={preferences.site_visits}
                  onCheckedChange={(checked) => 
                    updatePreferences({ site_visits: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Form Submissions</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when users submit contact or adoption forms
                  </p>
                </div>
                <Switch
                  checked={preferences.form_submissions}
                  onCheckedChange={(checked) => 
                    updatePreferences({ form_submissions: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New Orders</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when new puppy adoptions are placed
                  </p>
                </div>
                <Switch
                  checked={preferences.new_orders}
                  onCheckedChange={(checked) => 
                    updatePreferences({ new_orders: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Chat Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Notify when new chat messages arrive
                  </p>
                </div>
                <Switch
                  checked={preferences.chat_messages}
                  onCheckedChange={(checked) => 
                    updatePreferences({ chat_messages: checked })
                  }
                />
              </div>
            </div>

            <Button variant="outline" onClick={sendTestNotification}>
              <TestTube className="mr-2 h-4 w-4" />
              Send Test Notification
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
