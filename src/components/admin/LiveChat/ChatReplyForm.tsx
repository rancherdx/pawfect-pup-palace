import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import useAdminNotificationSocket from '@/hooks/useAdminNotificationSocket'; // To send messages

interface ChatReplyFormProps {
  conversationId: string; // This is effectively the visitorId
  adminId: string | null;   // ID of the currently logged-in admin
}

const ChatReplyForm = ({ conversationId, adminId }: ChatReplyFormProps) => {
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false); // Local sending state

  // The hook is primarily for receiving messages. For sending, we use its 'send' method.
  // The hook needs to be active for 'send' to work (i.e. connected).
  // AdminDashboard should ensure the hook is active.
  const { send: sendWebSocketMessage, isConnected } = useAdminNotificationSocket();

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !conversationId || !adminId) {
      toast.warning("Cannot send an empty reply or missing required IDs.");
      return;
    }
    if (!isConnected) {
      toast.error("Not connected to chat server. Please wait or refresh.");
      return;
    }

    setIsSending(true);

    const messagePayload = {
      type: 'chat_message_send',
      payload: {
        conversation_id: conversationId, // Target visitor's conversation/session ID
        message_text: replyText,
        // sender_id and sender_type will be set by the backend based on the admin's authenticated WebSocket session
      },
    };

    try {
      sendWebSocketMessage(JSON.stringify(messagePayload));
      // Optimistic UI update could be done here by parent if needed,
      // but WebSocket roundtrip or query invalidation in MessageView (on new message) is more robust.
      // For now, admin will see their message when it's echoed or fetched after successful save by backend.
      // The `ChatMessageView` component's WebSocket listener will pick up the message if the backend relays it back to admins,
      // or when it's saved and history is refetched.
      // A more direct approach: after sending, the backend could send a 'message_sent_confirmation' to the sending admin.
      // Or, the `ChatMessageView` updates its own cache upon receiving a message from anyone including current admin.

      // The `ChatMessageView` component's `useAdminNotificationSocket` `onMessage` handler
      // might need to be updated to handle messages sent by the *current* admin if the backend
      // doesn't echo them back or if a specific "message sent by you" confirmation isn't implemented.
      // For now, we assume the message will appear via the existing 'chat_message_receive' logic
      // if the backend relays it to all admins, or if `ChatMessageView` refetches.
      // The current backend `index.ts` relays admin messages to the specific visitor, not back to admins.
      // So, an optimistic update or a refetch strategy in ChatMessageView upon successful send from this form is good.
      // For simplicity, we'll rely on `ChatMessageView`'s refetch or its own WS listener.
      // Let's add a TODO there.
      // The most direct way is to have the `ChatMessageView` listen for messages sent by this admin too.

      setReplyText(''); // Clear input after sending
      toast.success("Reply sent.");
      // Consider queryClient.invalidateQueries(['conversationMessages', conversationId]) if not relying on WS echo for self.
    } catch (error: any) {
      console.error("Error sending reply:", error);
      toast.error(`Failed to send reply: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmitReply} className="space-y-3">
      <Textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Type your reply to the visitor..."
        rows={4}
        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-brand-red focus:border-brand-red dark:bg-gray-700 dark:text-gray-200"
        disabled={isSending || !isConnected}
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSending || !replyText.trim() || !isConnected}
          className="bg-brand-red hover:bg-red-700 text-white"
        >
          {isSending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Send Reply
        </Button>
      </div>
      {!isConnected && <p className="text-xs text-red-500 text-center mt-1">Chat disconnected. Please check your connection.</p>}
    </form>
  );
};

export default ChatReplyForm;
