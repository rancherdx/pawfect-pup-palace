
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, PawPrint, ChevronDown, ChevronUp, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

// Mock data for chat history
const mockChatHistory = [
  {
    id: "chat-1",
    date: "2023-05-10",
    title: "Adoption Inquiry - Golden Retriever",
    messages: [
      {
        sender: "user",
        content: "Hello, I'm interested in adopting a Golden Retriever puppy. Do you have any available?",
        timestamp: "2023-05-10T10:15:00",
      },
      {
        sender: "support",
        content: "Hi there! Yes, we currently have two Golden Retriever puppies available for adoption. They are 8 weeks old and ready for their forever homes. Would you like to schedule a visit to meet them?",
        timestamp: "2023-05-10T10:20:00",
      },
      {
        sender: "user",
        content: "That sounds great! I would love to visit this weekend if possible.",
        timestamp: "2023-05-10T10:25:00",
      },
      {
        sender: "support",
        content: "Wonderful! We have availability this Saturday at 10 AM or 2 PM, or Sunday at 11 AM. Which would work best for you?",
        timestamp: "2023-05-10T10:30:00",
      },
      {
        sender: "user",
        content: "Saturday at 2 PM would be perfect!",
        timestamp: "2023-05-10T10:35:00",
      },
      {
        sender: "support",
        content: "Great! I've scheduled your visit for Saturday at 2 PM. We're located at 123 Main St., please bring a valid ID. We look forward to meeting you!",
        timestamp: "2023-05-10T10:40:00",
      }
    ],
    unread: false
  },
  {
    id: "chat-2",
    date: "2023-09-18",
    title: "Puppy Health Question",
    messages: [
      {
        sender: "user",
        content: "Hi, my recently adopted puppy seems to be scratching a lot. Should I be concerned?",
        timestamp: "2023-09-18T15:05:00",
      },
      {
        sender: "support",
        content: "Hello! Occasional scratching is normal, but excessive scratching could indicate fleas, allergies, or dry skin. Has there been any change in their diet or environment recently?",
        timestamp: "2023-09-18T15:15:00",
      },
      {
        sender: "user",
        content: "We did change their food brand a few days ago, could that be related?",
        timestamp: "2023-09-18T15:20:00",
      },
      {
        sender: "support",
        content: "Yes, that could definitely be the cause. Food allergies are common in dogs. I recommend switching back to the previous food and seeing if the scratching subsides within a few days. If it persists or worsens, a veterinary check-up would be advisable.",
        timestamp: "2023-09-18T15:25:00",
      },
      {
        sender: "user",
        content: "I'll try that, thank you for the advice!",
        timestamp: "2023-09-18T15:30:00",
      }
    ],
    unread: true
  }
];

const ChatHistory = () => {
  const [activeChat, setActiveChat] = useState<any>(mockChatHistory[0]);
  const [messageInput, setMessageInput] = useState("");
  const [expandedChats, setExpandedChats] = useState<string[]>([mockChatHistory[0].id]);
  const { toast } = useToast();

  const toggleChatExpand = (chatId: string) => {
    if (expandedChats.includes(chatId)) {
      setExpandedChats(expandedChats.filter(id => id !== chatId));
    } else {
      setExpandedChats([...expandedChats, chatId]);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;
    
    // In a real app, you would send this message to your backend
    const newMessage = {
      sender: "user",
      content: messageInput,
      timestamp: new Date().toISOString(),
    };
    
    // Update the active chat with the new message
    const updatedChat = {
      ...activeChat,
      messages: [...activeChat.messages, newMessage]
    };
    
    // Simulate a response from support after a delay
    setTimeout(() => {
      const supportResponse = {
        sender: "support",
        content: "Thank you for your message! Our team will get back to you soon.",
        timestamp: new Date().toISOString(),
      };
      
      updatedChat.messages = [...updatedChat.messages, supportResponse];
      setActiveChat({...updatedChat});
      
      // Show a toast notification
      toast({
        title: "New Message",
        description: "You have received a new message from GDS Puppies."
      });
    }, 1000);
    
    setActiveChat(updatedChat);
    setMessageInput("");
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <MessageCircle className="h-6 w-6 mr-2 text-brand-red" />
          Chat History
        </h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-medium mb-2 text-muted-foreground">Previous Conversations</h3>
          
          {mockChatHistory.map((chat) => (
            <Card 
              key={chat.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${activeChat.id === chat.id ? 'border-brand-red shadow-sm' : ''}`}
              onClick={() => setActiveChat(chat)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium">{chat.title}</h4>
                      {chat.unread && (
                        <Badge className="ml-2 bg-brand-red">New</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(chat.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleChatExpand(chat.id);
                    }}
                  >
                    {expandedChats.includes(chat.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>
                
                {expandedChats.includes(chat.id) && (
                  <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    <span className="font-medium">{chat.messages[chat.messages.length - 1].sender === 'user' ? 'You: ' : 'Support: '}</span>
                    {chat.messages[chat.messages.length - 1].content}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          <div className="pt-4">
            <Button 
              variant="outline"
              onClick={() => {
                toast({
                  title: "Chat Feature",
                  description: "Starting a new chat will be available soon!"
                });
              }}
              className="w-full"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Start New Chat
            </Button>
          </div>
        </div>
        
        {/* Chat Messages */}
        <div className="lg:col-span-2 border rounded-lg bg-muted/10 overflow-hidden flex flex-col h-[600px]">
          {/* Chat Header */}
          <div className="bg-muted/30 p-4 border-b">
            <h3 className="font-medium">{activeChat.title}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(activeChat.date).toLocaleDateString()}
            </p>
          </div>
          
          {/* Messages Container */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {activeChat.messages.map((message: any, index: number) => (
              <div
                key={index}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-brand-red text-white ml-auto rounded-tr-none'
                      : 'bg-muted rounded-tl-none'
                  }`}
                >
                  {message.sender === 'support' && (
                    <div className="flex items-center mb-1">
                      <PawPrint className="h-4 w-4 mr-1" />
                      <span className="text-xs font-semibold">GDS Puppies Support</span>
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <span className={`text-xs mt-1 block text-right ${message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t bg-background">
            <div className="flex space-x-2">
              <Input
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-grow"
              />
              <Button type="submit" className="bg-brand-red hover:bg-red-700 text-white">
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <Bot className="h-3 w-3 mr-1" />
              <span>AI assistant is analyzing your conversation to provide better support</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;
