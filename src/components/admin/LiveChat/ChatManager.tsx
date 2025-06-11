import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, ListFilter, Users, AlertTriangle, Loader2 } from 'lucide-react';
import ChatSessionList from './ChatSessionList';
import ChatMessageView from './ChatMessageView';
import ChatReplyForm from './ChatReplyForm';
import useAdminNotificationSocket from "@/hooks/useAdminNotificationSocket"; // For real-time updates

// Define types for chat session and message (can be moved to a shared types file)
export interface ChatSession {
  id: string; // conversation_id, which is the visitor_id for anonymous chats
  visitor_id: string;
  user_id?: string | null;
  admin_id?: string | null;
  status: 'pending' | 'active' | 'closed_by_visitor' | 'closed_by_admin' | 'archived';
  last_message_at: number;
  visitor_page_url?: string;
  user_name?: string; // Joined from users table
  user_email?: string; // Joined from users table
  admin_name?: string; // Joined from users table (for assigned admin)
  last_message_snippet?: string;
  unread_admin_count?: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'visitor' | 'user' | 'admin' | 'system';
  message_text: string;
  timestamp: number; // Unix timestamp
  is_read_by_admin?: boolean;
}


const ChatManager = () => {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null); // Assuming we can get this from auth context or similar

  // TODO: Get currentAdminId from useAuth() or similar context
  // For now, placeholder:
  useEffect(() => {
    // const auth = useAuth(); // if useAuth is available globally or passed
    // if (auth?.user?.id) setCurrentAdminId(auth.user.id);
    setCurrentAdminId("admin_placeholder_id");
  }, []);


  // Initialize WebSocket for real-time updates (passed down or used by children)
  // The useAdminNotificationSocket hook is already designed to be called once in a higher-level component (AdminDashboard)
  // We might need a way to subscribe to specific message types or pass down a shared context/state from the hook.
  // For now, child components (SessionList, MessageView) will also call useAdminNotificationSocket or receive notifications via props/context.
  // This is a simplification. A better approach would be a shared context for WebSocket messages.
  // For this step, we'll assume notifications are handled by toasts globally for now, and list refetches.

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50 dark:bg-gray-900/30">
          <CardTitle className="text-2xl font-semibold flex items-center">
            <MessageCircle className="mr-3 h-7 w-7 text-brand-red" />
            Live Chat Management
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-0">
          <div className="flex flex-col md:flex-row h-[calc(100vh-200px)] md:h-[calc(100vh-220px)]"> {/* Adjust height */}
            {/* Pane 1: Chat Session List */}
            <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
              <ChatSessionList
                selectedSessionId={selectedSessionId}
                onSelectSession={setSelectedSessionId}
                currentAdminId={currentAdminId}
              />
            </div>

            {/* Pane 2: Message View & Reply Form */}
            <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col bg-white dark:bg-gray-800">
              {selectedSessionId ? (
                <>
                  <div className="flex-grow overflow-y-auto p-4 md:p-6">
                    <ChatMessageView
                        conversationId={selectedSessionId}
                        currentAdminId={currentAdminId}
                    />
                  </div>
                  <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                    <ChatReplyForm
                        conversationId={selectedSessionId}
                        adminId={currentAdminId}
                    />
                  </div>
                </>
              ) : (
                <div className="flex-grow flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <MessageCircle className="mx-auto h-16 w-16 text-gray-400" />
                    <p className="mt-2 text-lg">Select a chat session to view messages.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatManager;
