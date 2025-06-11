import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { Loader2, UserCircle, CheckCircle, AlertTriangle } from 'lucide-react'; // Added CheckCircle for outbound
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  direction: 'inbound' | 'outbound';
  contact_email: string; // For inbound, this is the sender. For outbound, the recipient.
  subject: string;
  body_html: string;
  created_at: number; // Unix timestamp
  status: string; // e.g. 'read', 'unread', 'sent', 'failed'
  user_id?: string | null; // For outbound, might be the admin user who sent it. For inbound, if linked to a system user.
}

interface MessageViewProps {
  conversationId: string;
}

const MessageView = ({ conversationId }: MessageViewProps) => {
  const queryClient = useQueryClient();

  const {
    data: messagesResponse,
    isLoading,
    isError,
    error
  } = useQuery<{ data: Message[] }, Error>({ // Assuming API returns { data: Message[] }
    queryKey: ['conversationMessages', conversationId],
    queryFn: () => apiRequest<{ data: Message[] }>(`/admin/inbox/conversations/${conversationId}`),
    enabled: !!conversationId,
  });

  // When messages are fetched or conversationId changes, invalidate the main conversations list query
  // to update unread counts, as fetching messages marks them as read on the backend.
  useEffect(() => {
    if (conversationId) {
      queryClient.invalidateQueries({ queryKey: ['adminConversations'] });
    }
  }, [messagesResponse, conversationId, queryClient]);


  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const messages = messagesResponse?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-10 w-10 animate-spin text-brand-red" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-red-500 flex flex-col items-center justify-center h-full">
        <AlertTriangle className="h-10 w-10 mb-2"/>
        <p>Error loading messages: {error?.message}</p>
        <p className="text-xs text-gray-400 mt-1">Conversation ID: {conversationId}</p>
      </div>
    );
  }

  if (messages.length === 0) {
    return <div className="p-4 text-center text-gray-500">No messages in this conversation yet.</div>;
  }

  return (
    <div className="space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xl lg:max-w-2xl p-3 rounded-lg shadow-md ${
              message.direction === 'outbound'
                ? 'bg-brand-red/10 dark:bg-brand-red/20 text-gray-800 dark:text-gray-200'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-300/50 dark:border-gray-600/50">
              <div className="flex items-center">
                {message.direction === 'inbound' ? (
                  <UserCircle className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
                ) : (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500 dark:text-green-400" />
                )}
                <span className="font-semibold text-sm">
                  {message.direction === 'inbound' ? message.contact_email : 'You (Admin)'}
                </span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(message.created_at)}
              </span>
            </div>

            {message.subject && (
                 <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">Subject: {message.subject}</p>
            )}

            {/* Render HTML body. Ensure proper sanitization if HTML is from untrusted external sources. */}
            {/* For internal system emails or trusted sources, this is generally okay. */}
            <div
              className="prose prose-sm dark:prose-invert max-w-none" // TailwindCSS Prose for nice HTML rendering
              dangerouslySetInnerHTML={{ __html: message.body_html }}
            />

            {message.status && message.direction === 'outbound' && (
                <div className="text-right mt-1">
                    <Badge variant={message.status === 'sent' ? 'default' : 'outline'} className="text-xs">
                        {message.status}
                    </Badge>
                </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageView;
