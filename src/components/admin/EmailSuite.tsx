import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Send, FileText, Settings, Plug } from "lucide-react";
import EmailTemplatesManager from "./EmailTemplatesManager";
import EmailIntegrationsPanel from "./EmailIntegrationsPanel";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function EmailSuite() {
  const [activeTab, setActiveTab] = useState("outbox");

  const { data: sentEmails = [] } = useQuery({
    queryKey: ["sent-emails"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sent_emails_log")
        .select("*")
        .order("sent_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Email Suite</h2>
        <p className="text-muted-foreground">Manage email templates, integrations, and history</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="inbox">
            <Mail className="h-4 w-4 mr-2" />
            Inbox
          </TabsTrigger>
          <TabsTrigger value="outbox">
            <Send className="h-4 w-4 mr-2" />
            Outbox
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Plug className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inbox</CardTitle>
              <CardDescription>Incoming emails (coming soon)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Email receiving functionality will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outbox" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sent Emails</CardTitle>
              <CardDescription>History of emails sent from the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sentEmails.length === 0 ? (
                  <p className="text-muted-foreground">No emails sent yet.</p>
                ) : (
                  sentEmails.map((email) => (
                    <div
                      key={email.id}
                      className="border rounded-lg p-4 hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <p className="font-medium">{email.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            To: {email.recipient_email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(email.sent_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="ml-4">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              email.status === "sent"
                                ? "bg-green-100 text-green-800"
                                : email.status === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {email.status}
                          </span>
                        </div>
                      </div>
                      {email.error_message && (
                        <p className="text-sm text-destructive mt-2">{email.error_message}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <EmailTemplatesManager />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Settings</CardTitle>
              <CardDescription>Global email configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Global email settings (sender name, reply-to) will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <EmailIntegrationsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
