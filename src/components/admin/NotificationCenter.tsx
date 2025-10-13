import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const NotificationCenter = () => {
  const navigate = useNavigate();

  const { data: submissions = [] } = useQuery({
    queryKey: ['recent-form-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Recent Notifications
            {submissions.length > 0 && (
              <Badge variant="destructive">{submissions.length}</Badge>
            )}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin?tab=form-submissions')}>
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No pending form submissions</p>
        ) : (
          <div className="space-y-3">
            {submissions.map((submission: any) => (
              <div key={submission.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-medium text-sm">
                    New {submission.form_name.replace('_', ' ')} submission
                  </p>
                  <p className="text-xs text-muted-foreground">
                    From: {submission.user_email || 'Anonymous'} • {format(new Date(submission.created_at), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
