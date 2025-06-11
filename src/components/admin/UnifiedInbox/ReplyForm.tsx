import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ReplyFormProps {
  conversationId: string;
}

const ReplyForm = ({ conversationId }: ReplyFormProps) => {
  const [replyBody, setReplyBody] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: { body_html: string }) =>
      apiRequest(`/admin/inbox/conversations/${conversationId}/reply`, {
        method: 'POST',
        body: payload,
      }),
    onSuccess: () => {
      toast.success('Reply sent successfully!');
      setReplyBody('');
      // Invalidate both the messages for this conversation and the conversation list (to update snippet/unread)
      queryClient.invalidateQueries({ queryKey: ['conversationMessages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['adminConversations'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to send reply: ${error.message || 'Unknown error'}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) {
      toast.warning('Cannot send an empty reply.');
      return;
    }
    mutation.mutate({ body_html: replyBody });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={replyBody}
        onChange={(e) => setReplyBody(e.target.value)}
        placeholder="Type your reply here..."
        rows={5}
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red dark:bg-gray-700 dark:text-gray-200"
        disabled={mutation.isPending}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={mutation.isPending || !replyBody.trim()}
          className="bg-brand-red hover:bg-red-700 text-white"
        >
          {mutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Send Reply
        </Button>
      </div>
    </form>
  );
};

export default ReplyForm;
