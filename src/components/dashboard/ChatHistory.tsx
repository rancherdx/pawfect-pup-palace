import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // For new conversation modal
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"; // For new conversation
import { MessageCircle, Send, PawPrint, ChevronDown, ChevronUp, AlertCircle, Loader2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";

// Interfaces (consistent with PuppyProfile.tsx)
interface Conversation {
  id: string;
  user_id: string;
  title: string;
  related_entity_id?: string | null;
  related_entity_type?: string | null;
  last_message_preview?: string | null;
  last_message_at?: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  // Frontend specific
  unread?: boolean; // Can be derived or managed locally
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'user' | 'admin' | 'system' | 'breeder';
  content: string;
  attachments?: string | null;
  sent_at: string;
  read_at?: string | null;
}

// API Fetcher (similar to one in UserProfile)
const makeChatApiRequest = async (url: string, method: string, token: string | null, body?: unknown) => {
  if (!token) throw new Error("Authentication token is required.");
  const response = await fetch(url, {
    method,
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `API request failed: ${response.statusText}`);
  }
  return response.json();
};


const ChatHistory = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState("");

  const [isLoadingConvos, setIsLoadingConvos] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatTitle, setNewChatTitle] = useState("Support Inquiry");
  const [newChatMessage, setNewChatMessage] = useState("");

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const fetchConversations = useCallback(async () => {
    if (!token) {
      setError("Not authenticated."); setIsLoadingConvos(false); return;
    }
    setIsLoadingConvos(true); setError(null);
    try {
      const data = await makeChatApiRequest("/api/my-conversations", "GET", token);
      setConversations(data.data || []);
      // Optionally, auto-select the first or most recent conversation
      if (data.data && data.data.length > 0) {
        // Sort by last_message_at to get the most recent
        const sortedConvos = [...data.data].sort((a,b) => new Date(b.last_message_at || 0).getTime() - new Date(a.last_message_at || 0).getTime());
        setActiveConversation(sortedConvos[0]);
      }
    } catch (err: any) {
      setError(err.message);
      toast({ variant: "destructive", title: "Failed to load conversations", description: err.message });
    } finally {
      setIsLoadingConvos(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    if (!token) return;
    setIsLoadingMessages(true);
    try {
      const data = await makeChatApiRequest(`/api/conversations/${conversationId}/messages`, "GET", token);
      setMessages(data.data || []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to load messages", description: err.message });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (activeConversation?.id) {
      fetchMessages(activeConversation.id);
    } else {
      setMessages([]); // Clear messages if no active conversation
    }
  }, [activeConversation, fetchMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activeConversation?.id || !token) return;

    try {
      const sentMessage = await makeChatApiRequest(`/api/conversations/${activeConversation.id}/messages`, "POST", token, { content: messageInput });
      setMessages(prev => [...prev, sentMessage]);
      setMessageInput("");
      // Optimistically update conversation preview
      const updatedConvos = conversations.map(c => c.id === activeConversation.id ? {...c, last_message_preview: sentMessage.content.substring(0,50), last_message_at: sentMessage.sent_at} : c);
      setConversations(updatedConvos);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to send message", description: err.message });
    }
  };

  const handleStartNewChat = async () => {
    if (!newChatMessage.trim() || !newChatTitle.trim() || !token ) return;
    try {
      const { conversation: newConv, message: firstMessage } = await makeChatApiRequest("/api/conversations", "POST", token, {
        title: newChatTitle,
        first_message_content: newChatMessage,
        // related_entity_id and type can be null for general support chats
      });
      setConversations(prev => [newConv, ...prev]); // Add to top
      setActiveConversation(newConv);
      setMessages([firstMessage]);
      setIsNewChatModalOpen(false);
      setNewChatTitle("Support Inquiry");
      setNewChatMessage("");
      toast({ title: "Chat Started", description: `Conversation "${newConv.title}" created.`, className: "bg-green-500 text-white" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to start new chat", description: err.message });
    }
  };

  const formatTimestamp = (timestamp?: string | null) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp?: string | null) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString();
  }

  if (isLoadingConvos && conversations.length === 0) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-brand-red" /> <p className="ml-2">Loading chats...</p></div>;
  }

  if (error) {
    return <div className="text-center py-10"><AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" /><h3 className="text-xl font-semibold text-red-600">Error Loading Chats</h3><p className="text-muted-foreground">{error}</p></div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <MessageCircle className="h-6 w-6 mr-2 text-brand-red" />
          Chat History
        </h2>
        <Button onClick={() => setIsNewChatModalOpen(true)} className="bg-brand-red hover:bg-red-700 text-white">
            <PlusCircle className="h-4 w-4 mr-2" /> Start New Chat
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1
          <h3 className="font-medium text-muted-foreground sticky top-0 bg-background py-1">Conversations</h3>
          {conversations.length === 0 && !isLoadingConvos && (
            <p className="text-sm text-muted-foreground text-center py-4">No conversations yet.</p>
          )}
          {conversations.map((chat) => (
            <Card 
              key={chat.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${activeConversation?.id === chat.id ? 'border-brand-red ring-2 ring-brand-red' : 'border-border'}`}
              onClick={() => setActiveConversation(chat)}
            >
              <CardContent className="p-3">
                <h4 className="font-semibold text-sm truncate">{chat.title}</h4>
                {chat.last_message_preview && <p className="text-xs text-muted-foreground truncate mt-1">{chat.last_message_preview}</p>}
                <p className="text-xs text-muted-foreground mt-1">{formatDate(chat.last_message_at || chat.updated_at)}</p>
                {/* {chat.unread && <Badge className="mt-1 text-xs" variant="destructive">New</Badge>} */}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Chat Messages */}
        <div className="lg:col-span-2 border rounded-lg bg-muted/10 flex flex-col h-[600px]">
          {activeConversation ? (
            <>
              <div className="bg-muted/30 p-3 border-b">
                <h3 className="font-semibold text-md">{activeConversation.title}</h3>
                <p className="text-xs text-muted-foreground">Last activity: {formatDate(activeConversation.last_message_at || activeConversation.updated_at)}</p>
              </div>

              <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {isLoadingMessages && <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div>}
                {!isLoadingMessages && messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] p-2.5 rounded-lg shadow-sm ${
                        message.sender_id === user?.id
                          ? 'bg-brand-red text-white ml-auto rounded-tr-none'
                          : 'bg-background border rounded-tl-none'
                      }`}
                    >
                      {message.sender_id !== user?.id && (
                        <div className="flex items-center mb-0.5">
                           { message.sender_type === 'admin' || message.sender_type === 'breeder' ?
                            <PawPrint className="h-3.5 w-3.5 mr-1.5 text-brand-red" /> : null }
                          <span className="text-xs font-semibold capitalize">{message.sender_type}</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <span className={`text-xs mt-1 block text-right ${message.sender_id === user?.id ? 'text-white/70' : 'text-muted-foreground/80'}`}>
                        {formatTimestamp(message.sent_at)}
                      </span>
                    </div>
                  </div>
                ))}
                {!isLoadingMessages && messages.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-10">No messages in this conversation yet.</p>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-3 border-t bg-background flex items-center space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-grow"
                  disabled={isLoadingMessages}
                />
                <Button type="submit" className="bg-brand-red hover:bg-red-700 text-white" disabled={isLoadingMessages || !messageInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
              <MessageCircle className="h-16 w-16 mb-4" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">or start a new one to begin chatting.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      <Dialog open={isNewChatModalOpen} onOpenChange={setIsNewChatModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a New Conversation</DialogTitle>
            <DialogDescription>
              Ask us anything! How can we help you today?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label htmlFor="newChatTitle" className="text-sm font-medium">Title (Optional)</label>
              <Input
                id="newChatTitle"
                value={newChatTitle}
                onChange={(e) => setNewChatTitle(e.target.value)}
                placeholder="e.g., Question about puppy food"
              />
            </div>
            <div>
              <label htmlFor="newChatMessage" className="text-sm font-medium">Your Message</label>
              <Textarea
                id="newChatMessage"
                value={newChatMessage}
                onChange={(e) => setNewChatMessage(e.target.value)}
                placeholder="Type your first message here..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewChatModalOpen(false)}>Cancel</Button>
            <Button onClick={handleStartNewChat} disabled={!newChatMessage.trim()}>
              <Send className="h-4 w-4 mr-2" /> Start Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatHistory;
