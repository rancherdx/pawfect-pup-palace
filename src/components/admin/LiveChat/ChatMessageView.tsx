import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { Loader2, UserCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from './ChatManager'; // Import shared type
import { cn } from '@/lib/utils';
import useAdminNotificationSocket from "@/hooks/useAdminNotificationSocket"; // For real-time messages

interface ChatMessageViewProps {
  conversationId: string;
  currentAdminId: string | null; // To identify messages sent by this admin
}

const ChatMessageView = ({ conversationId, currentAdminId }: ChatMessageViewProps) => {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const {
    data: historyResponse,
    isLoading,
    isError,
    error,
    refetch: refetchMessages, // To manually refetch if needed after a reply
  } = useQuery<{ data: ChatMessage[] }, Error>({
    queryKey: ['conversationMessages', conversationId],
    queryFn: () => apiRequest<{ data: ChatMessage[] }>(`/admin/chat/sessions/${conversationId}/history`),
    enabled: !!conversationId,
  });

  // WebSocket listener for new messages
  useAdminNotificationSocket({
    onMessage: (payload) => {
      if (payload.type === 'chat_message_receive' && payload.data?.conversation_id === conversationId) {
        // Add message to cache if it's for the current conversation
        queryClient.setQueryData(['conversationMessages', conversationId], (oldData: any) => {
          if (!oldData || !oldData.data) return oldData;
          // Avoid adding duplicates if message already exists (e.g., from initial fetch after sending)
          if (oldData.data.find((m: ChatMessage) => m.id === payload.data.id)) {
            return oldData;
          }
          return {
            ...oldData,
            data: [...oldData.data, payload.data],
          };
        });
        // Also, if this message was from a visitor, the backend would have marked it as read for THIS admin.
        // However, the unread count on the ConversationList might need an update.
        // The backend GET history already marks as read, so this is more for live updates.
        // The most robust way is to have the backend send specific "unread status changed" events
        // or for ConversationList to refetch periodically / on certain triggers.
        // For now, new messages appearing here implies they are "read" in this view.
      }
      // When an admin (including current) sends a message, it's saved and then relayed to visitor.
      // It's also useful to see it immediately in this admin's view.
      // The current WebSocket setup broadcasts visitor messages to ALL admins.
      // Admin messages are sent to visitor. They are NOT broadcasted back to other admins via WS yet.
      // The `ReplyForm` will optimistically update or refetch.
    }
  });


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [historyResponse?.data]);

  useEffect(() => {
    // When conversationId changes, refetch messages and invalidate conversation list for unread counts
    if (conversationId) {
      refetchMessages();
      queryClient.invalidateQueries({ queryKey: ['adminConversations'] });
    }
  }, [conversationId, refetchMessages, queryClient]);


  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const messages = historyResponse?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
        <p className="ml-2 text-slate-500">Loading messages...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-red-500 flex flex-col items-center justify-center h-full">
         <AlertTriangle className="h-10 w-10 mb-2"/>
        <p>Error loading messages: {error?.message}</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return <div className="p-4 text-center text-slate-500 dark:text-slate-400 h-full flex items-center justify-center">
        No messages in this chat yet. Start the conversation!
    </div>;
  }

  return (
    <div className="space-y-4 h-full">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.sender_type === 'admin' && message.sender_id === currentAdminId ? 'justify-end'
            : message.sender_type === 'admin' ? 'justify-end' // Other admin messages also right-aligned for now
            : message.sender_type === 'visitor' || message.sender_type === 'user' ? 'justify-start'
            : 'justify-center' // System messages
          }`}
        >
          <div
            className={cn(
              "max-w-[70%] p-3 rounded-xl shadow-sm text-sm",
              message.sender_type === 'admin' && message.sender_id === currentAdminId ? "bg-brand-red text-white rounded-br-none dark:bg-red-700"
              : message.sender_type === 'admin' ? "bg-red-400 text-white rounded-br-none dark:bg-red-600" // Other admins
              : message.sender_type === 'visitor' || message.sender_type === 'user' ? "bg-slate-100 text-slate-800 rounded-bl-none dark:bg-slate-600 dark:text-slate-100"
              : "bg-amber-100 text-amber-700 dark:bg-amber-700/30 dark:text-amber-300 text-xs italic w-full text-center"
            )}
          >
            {message.sender_type !== 'system' && (
              <div className={cn("flex items-center mb-1 text-xs opacity-90", message.sender_type === 'admin' && message.sender_id === currentAdminId ? "text-red-100" : "text-slate-500 dark:text-slate-400")}>
                {message.sender_type === 'admin' ? <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> : <UserCircle className="h-3.5 w-3.5 mr-1.5"/>}
                <span>
                  {message.sender_type === 'admin' && message.sender_id === currentAdminId ? 'You (Admin)'
                   : message.sender_type === 'admin' ? `Admin ${message.sender_id.substring(0,6)}...`
                   : message.sender_type === 'user' ? `User ${message.sender_id.substring(0,6)}...` // TODO: Fetch actual user name
                   : `Visitor ${message.sender_id.substring(0,8)}...`}
                </span>
              </div>
            )}
            {/* Render HTML body */}
            <div
              className={cn("prose prose-sm dark:prose-invert max-w-none", {"prose-p:text-white dark:prose-p:text-red-50": message.sender_type === 'admin'})}
              dangerouslySetInnerHTML={{ __html: message.body_html || message.message_text }}
            />
            <p className={cn("text-xs opacity-70 mt-1.5 text-right", message.sender_type === 'admin' && message.sender_id === currentAdminId ? "text-red-100" : "text-slate-500 dark:text-slate-400")}>
              {formatDate(message.timestamp)}
            </p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageView;
