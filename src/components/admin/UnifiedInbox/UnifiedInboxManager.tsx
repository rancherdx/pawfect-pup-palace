import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Inbox } from 'lucide-react';
import ConversationList from './ConversationList';
import MessageView from './MessageView';
import ReplyForm from './ReplyForm';

const UnifiedInboxManager = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gray-50 dark:bg-gray-900/30">
          <CardTitle className="text-2xl font-semibold flex items-center">
            <Inbox className="mr-3 h-7 w-7 text-brand-red" />
            Unified Inbox
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 md:p-0"> {/* Remove padding for edge-to-edge layout on md+ */}
          <div className="flex flex-col md:flex-row h-[calc(100vh-200px)] md:h-[calc(100vh-220px)]"> {/* Adjust height as needed */}
            {/* Pane 1: Conversation List */}
            <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
              <ConversationList
                selectedConversationId={selectedConversationId}
                onSelectConversation={setSelectedConversationId}
              />
            </div>

            {/* Pane 2: Message View & Reply Form */}
            <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
              {selectedConversationId ? (
                <>
                  <div className="flex-grow overflow-y-auto p-4 md:p-6">
                    <MessageView conversationId={selectedConversationId} />
                  </div>
                  <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                    <ReplyForm conversationId={selectedConversationId} />
                  </div>
                </>
              ) : (
                <div className="flex-grow flex items-center justify-center text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <Inbox className="mx-auto h-16 w-16 text-gray-400" />
                    <p className="mt-2 text-lg">Select a conversation to view messages.</p>
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

export default UnifiedInboxManager;
