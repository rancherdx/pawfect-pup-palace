import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import {
  MessageSquare, Send, X, Clock, MapPin, Eye, User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  visitor_name: string;
  visitor_email: string | null;
  status: string;
  last_message_at: string;
  visitor_city: string | null;
  visitor_state: string | null;
  current_page: string | null;
  time_on_site: number;
  created_at: string;
}

interface Message {
  id: string;
  message: string;
  sender_type: string;
  created_at: string;
  read_at: string | null;
}

interface Presence {
  is_online: boolean;
  is_typing: boolean;
  current_page: string | null;
  last_seen: string;
}

export default function LiveChatManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [presence, setPresence] = useState<Presence | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadConversations();
    subscribeToConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
      loadPresence(selectedConversation.id);
      subscribeToMessages(selectedConversation.id);
      subscribeToPresence(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    const { data } = await supabase
      .from('conversations')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (data) setConversations(data);
  };

  const subscribeToConversations = () => {
    const channel = supabase
      .channel('admin-conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
        },
        () => {
          loadConversations();
          
          // Show notification for new conversations
          toast({
            title: "New visitor",
            description: "Someone just started a chat",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
      markMessagesAsRead(conversationId);
    }
  };

  const markMessagesAsRead = async (conversationId: string) => {
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('sender_type', 'visitor')
      .is('read_at', null);
  };

  const loadPresence = async (conversationId: string) => {
    const { data } = await supabase
      .from('chat_presence')
      .select('*')
      .eq('conversation_id', conversationId)
      .single();

    if (data) setPresence(data);
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel(`admin-messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
          markMessagesAsRead(conversationId);
          
          if ((payload.new as Message).sender_type === 'visitor') {
            toast({
              title: "New message",
              description: "You have a new message from a visitor",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const subscribeToPresence = (conversationId: string) => {
    const channel = supabase
      .channel(`admin-presence:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_presence',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          if (payload.new) {
            setPresence(payload.new as any);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updatePresence = async (isTyping: boolean) => {
    if (!selectedConversation || !user) return;

    await supabase.from('chat_presence').upsert({
      conversation_id: selectedConversation.id,
      user_id: user.id,
      is_typing: isTyping,
      is_online: true,
      updated_at: new Date().toISOString(),
    });
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      updatePresence(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updatePresence(false);
    }, 2000);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      await supabase.from('messages').insert({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        sender_type: 'staff',
        message: newMessage.trim(),
      });

      setNewMessage('');
      setIsTyping(false);
      updatePresence(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const closeConversation = async () => {
    if (!selectedConversation) return;

    await supabase
      .from('conversations')
      .update({ status: 'closed' })
      .eq('id', selectedConversation.id);

    setSelectedConversation(null);
    loadConversations();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Active Conversations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-18rem)]">
            <div className="space-y-2 p-4">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation?.id === conv.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold">{conv.visitor_name}</p>
                    <Badge variant={conv.status === 'active' ? 'default' : 'secondary'}>
                      {conv.status}
                    </Badge>
                  </div>
                  <p className="text-xs opacity-70">
                    {format(new Date(conv.last_message_at), 'MMM d, HH:mm')}
                  </p>
                  {conv.visitor_city && conv.visitor_state && (
                    <p className="text-xs opacity-70 mt-1">
                      {conv.visitor_city}, {conv.visitor_state}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="lg:col-span-2">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {selectedConversation.visitor_name}
                  </CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    {presence?.is_online && (
                      <Badge variant="default" className="gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        Online
                      </Badge>
                    )}
                    {selectedConversation.visitor_city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedConversation.visitor_city}, {selectedConversation.visitor_state}
                      </span>
                    )}
                    {selectedConversation.current_page && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {selectedConversation.current_page}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {Math.floor(selectedConversation.time_on_site / 60)}m on site
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={closeConversation}
                >
                  <X className="h-4 w-4 mr-1" />
                  Close
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-28rem)] p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender_type === 'staff' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          msg.sender_type === 'staff'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {format(new Date(msg.created_at), 'HH:mm')}
                          {msg.read_at && msg.sender_type === 'staff' && ' ✓✓'}
                        </p>
                      </div>
                    </div>
                  ))}

                  {presence?.is_typing && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-2 h-2 bg-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <Button onClick={sendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a conversation to start chatting</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
