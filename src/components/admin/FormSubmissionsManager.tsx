import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Eye, CheckCircle, Clock, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface FormSubmission {
  id: string;
  form_name: string;
  form_data: any;
  user_email: string | null;
  user_id: string | null;
  status: string;
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

export const FormSubmissionsManager: React.FC = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: submissions = [] } = useQuery({
    queryKey: ['form-submissions', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FormSubmission[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('form_submissions')
        .update({
          status,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['form-submissions'] });
      toast.success('Status updated');
      setSelectedSubmission(null);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'reviewed':
        return <Badge variant="outline"><Eye className="h-3 w-3 mr-1" />Reviewed</Badge>;
      case 'completed':
        return <Badge><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getFormNameDisplay = (formName: string) => {
    return formName
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Form Submissions</h2>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewed">Reviewed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {submissions.map((submission) => (
          <Card key={submission.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedSubmission(submission)}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">
                    {getFormNameDisplay(submission.form_name)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {submission.user_email || 'Anonymous'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(submission.status)}
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(submission.created_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {submissions.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No form submissions found
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSubmission && getFormNameDisplay(selectedSubmission.form_name)}
            </DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedSubmission.status)}</div>
                </div>
                <div>
                  <span className="font-semibold">Submitted:</span>
                  <div className="mt-1 text-sm">
                    {format(new Date(selectedSubmission.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                </div>
              </div>

              {selectedSubmission.user_email && (
                <div>
                  <span className="font-semibold">Email:</span>
                  <div className="mt-1">{selectedSubmission.user_email}</div>
                </div>
              )}

              <div>
                <span className="font-semibold">Form Data:</span>
                <Card className="mt-2">
                  <CardContent className="pt-4">
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(selectedSubmission.form_data, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() =>
                    updateStatusMutation.mutate({
                      id: selectedSubmission.id,
                      status: 'reviewed',
                    })
                  }
                  disabled={selectedSubmission.status === 'reviewed'}
                >
                  Mark as Reviewed
                </Button>
                <Button
                  onClick={() =>
                    updateStatusMutation.mutate({
                      id: selectedSubmission.id,
                      status: 'completed',
                    })
                  }
                  disabled={selectedSubmission.status === 'completed'}
                >
                  Mark as Completed
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};