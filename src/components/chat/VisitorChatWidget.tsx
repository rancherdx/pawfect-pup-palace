import { useState, useEffect, useRef, FormEvent } from 'react';
import { MessageSquare, Send, X, Loader2, UserCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getVisitorId } from '@/utils/visitTracker'; // Assuming this utility exists
import { cn } from "@/lib/utils"; // For conditional classnames

interface ChatMessage {
  id?: string; // Optional client-generated ID, or ID from backend after saving
  conversation_id: string;
  sender_id: string;
  sender_type: 'visitor' | 'admin' | 'system';
  message_text: string;
  timestamp: number; // Unix timestamp
}

const WS_VISITOR_CHAT_URL_BASE = '/ws/chat-visitor';

const VisitorChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const webSocketRef = useRef<WebSocket | null>(null);
  const visitorIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    visitorIdRef.current = getVisitorId(); // Get visitor ID on mount
  }, []);

  const connectWebSocket = () => {
    if (!visitorIdRef.current) {
      console.error("Visitor ID not available for chat.");
      return;
    }
    if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    setIsConnecting(true);
    const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${WS_VISITOR_CHAT_URL_BASE}?visitorId=${visitorIdRef.current}`;

    console.log('VisitorChatWidget: Attempting to connect to', wsUrl);
    const ws = new WebSocket(wsUrl);
    webSocketRef.current = ws;

    ws.onopen = () => {
      console.log('VisitorChatWidget: WebSocket connected.');
      setIsConnected(true);
      setIsConnecting(false);
      // TODO: Request message history for this visitorId/conversation_id if needed
      // Example: ws.send(JSON.stringify({ type: 'chat_history_request', payload: { conversation_id: visitorIdRef.current } }));
      setMessages(prev => [...prev, {
          conversation_id: visitorIdRef.current!,
          sender_id: 'system',
          sender_type: 'system',
          message_text: 'Connected to support.',
          timestamp: Math.floor(Date.now()/1000),
          id: crypto.randomUUID()
      }]);
    };

    ws.onmessage = (event) => {
      try {
        const receivedMessage: { type: string; payload: ChatMessage } = JSON.parse(event.data as string);
        console.log('VisitorChatWidget: Message received:', receivedMessage);

        if (receivedMessage.type === 'chat_message_receive' && receivedMessage.payload) {
          setMessages(prevMessages => [...prevMessages, receivedMessage.payload]);
          if (!isOpen) {
            setUnreadCount(prev => prev + 1);
          }
        } else if (receivedMessage.type === 'admin_joined_chat' && receivedMessage.payload) {
           setMessages(prevMessages => [...prevMessages, {
              id: crypto.randomUUID(),
              conversation_id: receivedMessage.payload.conversation_id,
              sender_id: 'system',
              sender_type: 'system',
              message_text: receivedMessage.payload.message || 'An admin has joined the chat.',
              timestamp: Math.floor(Date.now()/1000)
           }]);
        }
        // Handle other message types like history, typing indicators, etc.
      } catch (err) {
        console.error('VisitorChatWidget: Error parsing message or in onMessage handler:', err);
      }
    };

    ws.onerror = (event) => {
      console.error('VisitorChatWidget: WebSocket error:', event);
      setIsConnected(false);
      setIsConnecting(false);
       setMessages(prev => [...prev, {
          conversation_id: visitorIdRef.current!,
          sender_id: 'system',
          sender_type: 'system',
          message_text: 'Connection error. Please try again later.',
          timestamp: Math.floor(Date.now()/1000),
          id: crypto.randomUUID()
      }]);
    };

    ws.onclose = (event) => {
      console.log('VisitorChatWidget: WebSocket disconnected.', event.code, event.reason);
      setIsConnected(false);
      setIsConnecting(false);
      if (event.code !== 1000) { // Not a normal closure
         setMessages(prev => [...prev, {
          conversation_id: visitorIdRef.current!,
          sender_id: 'system',
          sender_type: 'system',
          message_text: 'Chat disconnected. Attempting to reconnect...',
          timestamp: Math.floor(Date.now()/1000),
          id: crypto.randomUUID()
        }]);
        // Simple reconnect attempt, could be more sophisticated
        setTimeout(connectWebSocket, 5000);
      }
    };
  };

  const toggleChat = () => {
    setIsOpen(prev => {
      const newIsOpen = !prev;
      if (newIsOpen && (!webSocketRef.current || webSocketRef.current.readyState === WebSocket.CLOSED)) {
        connectWebSocket();
      }
      if (newIsOpen) {
        setUnreadCount(0); // Clear unread count when chat is opened
      }
      return newIsOpen;
    });
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !webSocketRef.current || webSocketRef.current.readyState !== WebSocket.OPEN || !visitorIdRef.current) {
      return;
    }

    const messagePayload = {
      type: 'chat_message_send',
      payload: {
        // Backend will determine conversation_id from visitorId, and sender_id/type
        message_text: inputText,
      },
    };

    webSocketRef.current.send(JSON.stringify(messagePayload));

    // Optimistically add to messages UI
    setMessages(prevMessages => [
      ...prevMessages,
      {
        id: crypto.randomUUID(), // Client-side temporary ID
        conversation_id: visitorIdRef.current!,
        sender_id: visitorIdRef.current!,
        sender_type: 'visitor',
        message_text: inputText,
        timestamp: Math.floor(Date.now() / 1000),
      },
    ]);
    setInputText('');
  };

  useEffect(() => {
    // Clean up WebSocket on component unmount
    return () => {
      webSocketRef.current?.close(1000, "Widget unmounted");
    };
  }, []);


  return (
    <>
      {/* Chat Trigger Button */}
      <Button
        onClick={toggleChat}
        className={cn(
            "fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-xl z-50 transition-all duration-300 ease-in-out",
            "bg-brand-red hover:bg-red-700 text-white",
            isOpen && "opacity-0 scale-0 pointer-events-none" // Hide when chat is open
        )}
        aria-label="Open Chat"
      >
        <MessageSquare size={30} />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center rounded-full bg-blue-500 text-white border-2 border-white dark:border-gray-800">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-[90vw] max-w-md h-[70vh] max-h-[600px] shadow-2xl z-50 flex flex-col rounded-xl overflow-hidden animate-slide-in-bottom-right dark:bg-gray-800">
          <CardHeader className="bg-brand-red text-white p-4 flex flex-row items-center justify-between">
            <div className="flex items-center">
              <MessageSquare size={20} className="mr-2" />
              <CardTitle className="text-lg font-semibold">Chat with Support</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleChat} className="text-white hover:bg-red-700/50 h-8 w-8">
              <X size={20} />
            </Button>
          </CardHeader>

          <CardContent className="flex-grow overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-800">
            {messages.map((msg, index) => (
              <div
                key={msg.id || index}
                className={`flex ${
                  msg.sender_type === 'visitor' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={cn(
                    "max-w-[80%] p-3 rounded-xl shadow",
                    msg.sender_type === 'visitor' ? "bg-blue-500 text-white rounded-br-none" :
                    msg.sender_type === 'admin' ? "bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100 rounded-bl-none" :
                    "bg-amber-100 text-amber-800 dark:bg-amber-700/30 dark:text-amber-300 text-xs italic text-center w-full"
                  )}
                >
                  {msg.sender_type !== 'system' && (
                    <div className="flex items-center mb-1 text-xs opacity-80">
                      {msg.sender_type === 'admin' ? <CheckCircle className="h-3 w-3 mr-1 text-green-500" /> : <UserCircle className="h-3 w-3 mr-1"/>}
                      <span>{msg.sender_type === 'admin' ? 'Support' : 'You'}</span>
                    </div>
                  )}
                  <p className="text-sm">{msg.message_text}</p>
                  <p className="text-xs opacity-60 mt-1 text-right">
                    {new Date(msg.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} /> {/* For auto-scrolling */}
          </CardContent>

          <div className="p-4 border-t bg-white dark:bg-gray-800 dark:border-gray-700">
            <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
              <Input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                disabled={!isConnected || isConnecting}
              />
              <Button type="submit" className="bg-brand-red hover:bg-red-700 text-white" disabled={!isConnected || isConnecting || !inputText.trim()}>
                {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={18} />}
              </Button>
            </form>
             <p className="text-xs text-center mt-2 text-gray-400 dark:text-gray-500">
                {isConnecting ? "Connecting..." : isConnected ? "Connected" : "Disconnected"}
            </p>
          </div>
        </Card>
      )}
    </>
  );
};

export default VisitorChatWidget;

// Add this animation to your global CSS (e.g., App.css or index.css)
/*
@keyframes slideInBottomRight {
  from {
    opacity: 0;
    transform: translateY(20px) translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateX(0);
  }
}
.animate-slide-in-bottom-right {
  animation: slideInBottomRight 0.3s ease-out forwards;
}
*/
