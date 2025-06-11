import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, ArrowRight, Inbox, Users, UserCircle } from 'lucide-react'; // Added UserCircle for contact icon

interface Conversation {
  id: string;
  contact_email: string;
  subject: string;
  last_message_at: number; // Unix timestamp
  last_message_snippet?: string;
  unread_count?: number;
  status: string; // 'open', 'closed', 'archived'
  user_id?: string | null; // If linked to a known user
  // Potentially add user_name if backend joins it
}

interface ConversationsApiResponse {
  data: Conversation[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

interface ConversationListProps {
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

const ConversationList = ({ selectedConversationId, onSelectConversation }: ConversationListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const conversationsPerPage = 15; // Or make this a prop

  const {
    data: response,
    isLoading,
    isError,
    error,
    isFetching
  } = useQuery<ConversationsApiResponse, Error>({
    queryKey: ['adminConversations', currentPage, conversationsPerPage],
    queryFn: () => apiRequest<ConversationsApiResponse>(`/admin/inbox/conversations?page=${currentPage}&limit=${conversationsPerPage}`),
    keepPreviousData: true,
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const conversations = response?.data || [];
  const pagination = response?.pagination;

  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="p-4 text-red-500">Error loading conversations: {error?.message}</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Conversations</h3>
        {/* TODO: Add search/filter controls here later */}
      </div>
      {conversations.length === 0 && !isLoading ? (
        <div className="flex-grow flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 p-4">
          <Inbox className="w-12 h-12 mb-2" />
          <p className="text-sm">No conversations found.</p>
        </div>
      ) : (
        <div className="flex-grow overflow-y-auto">
          {conversations.map((convo) => (
            <button
              key={convo.id}
              onClick={() => onSelectConversation(convo.id)}
              className={`w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-150 border-b border-gray-200 dark:border-gray-700/70
                          ${selectedConversationId === convo.id ? 'bg-brand-red/10 dark:bg-brand-red/20' : ''}`}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center truncate">
                   {convo.user_id ? <Users className="h-4 w-4 mr-1.5 text-blue-500 flex-shrink-0" /> : <UserCircle className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0" />}
                  <span className="font-semibold text-sm truncate text-gray-800 dark:text-gray-200" title={convo.contact_email}>
                    {convo.contact_email} {/* TODO: Show user name if available */}
                  </span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {formatDate(convo.last_message_at)}
                </span>
              </div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate" title={convo.subject}>
                {convo.subject || '(No Subject)'}
              </p>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate pr-2">
                  {convo.last_message_snippet || '...'}
                </p>
                {convo.unread_count && convo.unread_count > 0 && (
                  <Badge variant="default" className="h-5 px-2 text-xs bg-brand-red text-white">
                    {convo.unread_count}
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={pagination.currentPage <= 1 || isFetching}
            className="text-xs"
          >
            <ArrowLeft className="mr-1 h-3 w-3" /> Prev
          </Button>
          <span className="text-xs text-gray-600 dark:text-gray-400">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={pagination.currentPage >= pagination.totalPages || isFetching}
            className="text-xs"
          >
            Next <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConversationList;
