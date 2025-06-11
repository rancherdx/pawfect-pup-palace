import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, Users, MessageSquare, Check, ShieldAlert, LogIn } from 'lucide-react';
import { ChatSession } from './ChatManager'; // Import shared type
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
// We'll need useAdminNotificationSocket for real-time updates later
// import useAdminNotificationSocket from "@/hooks/useAdminNotificationSocket";


interface ChatSessionsApiResponse {
  data: ChatSession[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
  };
}

interface ChatSessionListProps {
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  currentAdminId: string | null;
}

const ChatSessionList = ({ selectedSessionId, onSelectSession, currentAdminId }: ChatSessionListProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<'pending' | 'active' | 'closed' | 'all'>('pending');
  const sessionsPerPage = 20;
  const queryClient = useQueryClient();

  const fetchChatSessions = async ({ queryKey }: any): Promise<ChatSessionsApiResponse> => {
    const [_key, page, limit, status] = queryKey;
    let url = `/admin/chat/sessions?page=${page}&limit=${limit}`;
    if (status !== 'all') {
      url += `&status=${status}`;
    }
    return apiRequest<ChatSessionsApiResponse>(url);
  };

  const {
    data: response,
    isLoading,
    isError,
    error,
    isFetching
  } = useQuery<ChatSessionsApiResponse, Error>({
    queryKey: ['chatSessions', currentPage, sessionsPerPage, filterStatus],
    queryFn: fetchChatSessions,
    keepPreviousData: true,
    refetchInterval: 30000, // Refetch every 30 seconds to catch new sessions if WS is not fully implemented here yet
  });

  const claimSessionMutation = useMutation({
    mutationFn: (sessionId: string) => apiRequest(`/admin/chat/sessions/${sessionId}/claim`, { method: 'POST' }),
    onSuccess: (data, sessionId) => {
      toast.success(`Chat session ${sessionId.substring(0,6)}... claimed.`);
      queryClient.invalidateQueries({ queryKey: ['chatSessions'] });
      queryClient.invalidateQueries({ queryKey: ['conversationMessages', sessionId] }); // To show system message
      onSelectSession(sessionId); // Select it after claiming
    },
    onError: (error: any, sessionId) => {
      toast.error(`Failed to claim session ${sessionId.substring(0,6)}...: ${error.message || 'Unknown error'}`);
    }
  });

  // TODO: WebSocket listener for real-time updates
  // useEffect(() => {
  //   // Connect to useAdminNotificationSocket or use a shared context
  //   // On 'new_chat_session' or 'visitor_chat_connect', invalidate 'chatSessions' query
  //   // On 'chat_claimed' by another admin, update UI for that session
  // }, []);


  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const sessions = response?.data || [];
  const pagination = response?.pagination;

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Chat Queue</h3>
            {isFetching && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
        </div>
        {/* Filter Buttons */}
        <div className="flex space-x-1">
            {(['pending', 'active', 'closed', 'all'] as const).map(status => (
                <Button
                    key={status}
                    size="xs"
                    variant={filterStatus === status ? "default" : "outline"}
                    onClick={() => { setFilterStatus(status); setCurrentPage(1);}}
                    className={cn("capitalize text-xs px-2 py-1 h-auto", filterStatus === status && "bg-brand-red hover:bg-brand-red/90 text-white")}
                >
                    {status}
                </Button>
            ))}
        </div>
      </div>

      {isLoading && !isFetching && ( // Initial load
        <div className="p-4 space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          ))}
        </div>
      )}

      {isError && (
        <div className="p-4 text-red-600 text-center">Error: {error?.message}</div>
      )}

      {!isLoading && sessions.length === 0 && (
        <div className="flex-grow flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-4">
          <MessageSquare className="w-12 h-12 mb-2" />
          <p className="text-sm">No {filterStatus !== 'all' ? filterStatus : ''} chat sessions.</p>
        </div>
      )}

      <div className="flex-grow overflow-y-auto">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`p-3 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer border-b border-slate-200 dark:border-slate-700/80
                        ${selectedSessionId === session.id ? 'bg-brand-red/10 dark:bg-brand-red/20 border-l-2 border-l-brand-red' : ''}`}
          >
            <div className="flex justify-between items-center mb-0.5">
              <div className="flex items-center truncate">
                {session.user_id ? <Users className="h-4 w-4 mr-1.5 text-blue-500 flex-shrink-0" /> : <User className="h-4 w-4 mr-1.5 text-gray-400 flex-shrink-0" />}
                <span className="font-medium text-sm truncate text-slate-700 dark:text-slate-200" title={session.visitor_id}>
                  {session.user_name || session.user_email || `Visitor ${session.visitor_id.substring(0, 8)}...`}
                </span>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {formatDate(session.last_message_at)}
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 truncate_two_lines" title={session.visitor_page_url}>
              On: {session.visitor_page_url || 'Unknown page'}
            </p>
            {session.last_message_snippet && (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic truncate mt-1">
                {session.last_message_snippet}
              </p>
            )}
            <div className="mt-1.5 flex justify-between items-center">
                <div>
                    {session.unread_admin_count && session.unread_admin_count > 0 && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-auto">
                            {session.unread_admin_count} New
                        </Badge>
                    )}
                    {session.admin_id && (
                        <Badge variant="secondary" className="text-xs ml-1 px-1.5 py-0.5 h-auto capitalize">
                           <Check className="h-3 w-3 mr-1" /> {session.admin_name || session.admin_id.substring(0,6)}...
                        </Badge>
                    )}
                </div>
                {session.status === 'pending' && !session.admin_id && (
                    <Button
                        size="xs"
                        variant="outline"
                        className="text-xs px-2 py-1 h-auto border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={(e) => { e.stopPropagation(); claimSessionMutation.mutate(session.id);}}
                        disabled={claimSessionMutation.isPending && claimSessionMutation.variables === session.id}
                    >
                        {claimSessionMutation.isPending && claimSessionMutation.variables === session.id ?
                            <Loader2 className="h-3 w-3 animate-spin" /> :
                            <LogIn className="h-3 w-3 mr-1" />}
                        Join
                    </Button>
                )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-100 dark:bg-slate-800/50">
          <Button
            variant="outline" size="xs"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={pagination.currentPage <= 1 || isFetching}
            className="text-xs"
          >
            <ArrowLeft className="mr-1 h-3 w-3" /> Prev
          </Button>
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline" size="xs"
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

export default ChatSessionList;

// Add to global CSS if not already there for multi-line truncation:
// .truncate_two_lines {
//   display: -webkit-box;
//   -webkit-line-clamp: 2;
//   -webkit-box-orient: vertical;
//   overflow: hidden;
//   text-overflow: ellipsis;
// }
