import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker"; // Assuming a date picker component exists
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


import { 
  PawPrint, Calendar, Dog, Bone, Heart, Pill, FileText, MessageSquare, Clock, ChevronRight, ArrowUpRight,
  Loader2, AlertCircle, PlusCircle, Send, Paperclip
} from "lucide-react";
import { 
  ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Interfaces for API data
interface PuppyData {
  id: string;
  name: string;
  breed_name?: string;
  litter_name?: string;
  birth_date: string;
  image_urls: string[]; // Should be parsed from JSON string if API sends string
  color?: string;
  weight?: number; // Current weight
  status?: string;
  microchip_id?: string;
  description?: string;
  temperament_notes?: string[]; // Assuming this might be an array of strings if parsed from JSON
  // Parent info and breeder info are not directly in puppies table per schema, might be from litter or separate calls
  [key: string]: any; // Allow other properties
}

interface HealthRecord {
  id: string;
  puppy_id: string;
  record_type: 'vaccination' | 'weight_log' | 'height_log' | 'document' | 'note';
  date: string; // YYYY-MM-DD
  details: string; // For notes, doc URL/title, vaccine name, etc.
  value?: number | null; // For numeric values like weight, height
  unit?: string | null; // e.g., 'lbs', 'kg', 'in', 'cm'
  created_at: string;
  updated_at: string;
}

interface Conversation {
  id: string;
  title: string;
  last_message_preview?: string;
  last_message_at?: string;
  related_entity_id?: string;
  [key: string]: any;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'user' | 'admin' | 'system' | 'breeder';
  content: string;
  attachments?: string | null; // JSON array
  sent_at: string;
  read_at?: string | null;
}

// API Fetcher Functions (should be in an api.ts or hooks)
const makeApiRequest = async (url: string, method: string, token: string | null, body?: any) => {
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


// Helper to calculate age from birth_date
const calculateAgeMonths = (birthDateStr: string): number => {
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
  months -= birthDate.getMonth();
  months += today.getMonth();
  return months <= 0 ? 0 : months;
};


const PuppyProfile = () => {
  const { puppyId } = useParams<{ puppyId: string }>();
  const { token, user } = useAuth();
  const { toast } = useToast();

  const [puppy, setPuppy] = useState<PuppyData | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessageContent, setNewMessageContent] = useState("");
  
  const [isLoadingPuppy, setIsLoadingPuppy] = useState(true);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const [isLoadingConvos, setIsLoadingConvos] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For Add Health Record Form
  const [showAddHealthForm, setShowAddHealthForm] = useState(false);
  const [newHealthRecord, setNewHealthRecord] = useState({
    record_type: 'note' as HealthRecord['record_type'],
    date: new Date().toISOString().split('T')[0], // Default to today
    details: "",
    value: "",
    unit: ""
  });

  const fetchPuppyData = useCallback(async () => {
    if (!puppyId || !token) return;
    setIsLoadingPuppy(true);
    try {
      const data = await makeApiRequest(`/api/puppies/${puppyId}`, "GET", token);
      // API returns image_urls as stringified JSON, parse it
      setPuppy({ ...data, image_urls: Array.isArray(data.image_urls) ? data.image_urls : JSON.parse(data.image_urls || "[]") });
    } catch (err: any) {
      setError(err.message);
      toast({ variant: "destructive", title: "Failed to load puppy data", description: err.message });
    } finally {
      setIsLoadingPuppy(false);
    }
  }, [puppyId, token, toast]);

  const fetchHealthRecords = useCallback(async () => {
    if (!puppyId || !token) return;
    setIsLoadingHealth(true);
    try {
      const data = await makeApiRequest(`/api/puppies/${puppyId}/health-records`, "GET", token);
      setHealthRecords(data.data || []); // Assuming API returns { data: [] }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to load health records", description: err.message });
    } finally {
      setIsLoadingHealth(false);
    }
  }, [puppyId, token, toast]);
  
  const fetchConversations = useCallback(async () => {
    if (!puppyId || !token) return;
    setIsLoadingConvos(true);
    try {
      // Fetch conversations related to this puppy
      const convosData = await makeApiRequest(`/api/my-conversations?related_entity_id=${puppyId}&related_entity_type=puppy`, "GET", token);
      setConversations(convosData.data || []);
      if (convosData.data && convosData.data.length > 0) {
        setActiveConversation(convosData.data[0]); // Auto-select first one
      }
    } catch (err: any) {
       toast({ variant: "destructive", title: "Failed to load conversations", description: err.message });
    } finally {
      setIsLoadingConvos(false);
    }
  }, [puppyId, token, toast]);

  const fetchMessagesForConversation = useCallback(async (conversationId: string) => {
    if (!token) return;
    setIsLoadingMessages(true);
    try {
      const messagesData = await makeApiRequest(`/api/conversations/${conversationId}/messages`, "GET", token);
      setMessages(messagesData.data || []);
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to load messages", description: err.message });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [token, toast]);

  useEffect(() => {
    fetchPuppyData();
    fetchHealthRecords();
    fetchConversations();
  }, [fetchPuppyData, fetchHealthRecords, fetchConversations]);

  useEffect(() => {
    if (activeConversation?.id) {
      fetchMessagesForConversation(activeConversation.id);
    } else {
      setMessages([]); // Clear messages if no active conversation
    }
  }, [activeConversation, fetchMessagesForConversation]);


  const handleAddHealthRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!puppyId || !token) return;
    try {
      const payload: any = {
        record_type: newHealthRecord.record_type,
        date: newHealthRecord.date,
        details: newHealthRecord.details,
      };
      if (newHealthRecord.record_type === 'weight_log' || newHealthRecord.record_type === 'height_log') {
        if (newHealthRecord.value) payload.value = parseFloat(newHealthRecord.value);
        if (newHealthRecord.unit) payload.unit = newHealthRecord.unit;
      }
      await makeApiRequest(`/api/puppies/${puppyId}/health-records`, "POST", token, payload);
      toast({ title: "Health Record Added", description: "Successfully added new health record.", className: "bg-green-500 text-white" });
      setShowAddHealthForm(false);
      fetchHealthRecords(); // Refresh list
      setNewHealthRecord({ record_type: 'note', date: new Date().toISOString().split('T')[0], details: "", value: "", unit: "" }); // Reset form
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to add record", description: err.message });
    }
  };
  
  const handleStartOrSendMessage = async () => {
    if (!newMessageContent.trim() || !token || !puppyId || !user) return;

    try {
      if (activeConversation?.id) {
        const sentMessage = await makeApiRequest(`/api/conversations/${activeConversation.id}/messages`, "POST", token, { content: newMessageContent });
        setMessages(prev => [...prev, sentMessage]);
      } else { // Start a new conversation
        const newConvPayload = {
          title: `Chat about ${puppy?.name || 'your puppy'}`,
          first_message_content: newMessageContent,
          related_entity_id: puppyId,
          related_entity_type: 'puppy'
        };
        const { conversation: newConv, message: firstMessage } = await makeApiRequest(`/api/conversations`, "POST", token, newConvPayload);
        setConversations(prev => [newConv, ...prev]);
        setActiveConversation(newConv);
        setMessages([firstMessage]);
      }
      setNewMessageContent("");
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to send message", description: err.message });
    }
  };


  // Data transformations for UI
  const age = puppy ? calculateAgeMonths(puppy.birth_date) : 0;
  const displayAge = puppy ? (age > 12 ? `${Math.floor(age/12)}y ${age%12}m` : `${age}m old`) : "N/A";
  const growthProgress = puppy ? Math.min(100, Math.round((age / 18) * 100)) : 0; // Assuming 18 months to full growth

  const weightHistory = healthRecords
    .filter(r => r.record_type === 'weight_log' && r.value != null && puppy?.birth_date)
    .map(r => ({ month: calculateAgeMonths(puppy!.birth_date) - calculateAgeMonths(r.date) , weight: r.value! }))
    .sort((a,b) => a.month - b.month);

  const heightHistory = healthRecords
    .filter(r => r.record_type === 'height_log' && r.value != null && puppy?.birth_date)
    .map(r => ({ month: calculateAgeMonths(puppy!.birth_date) - calculateAgeMonths(r.date), height: r.value! }))
    .sort((a,b) => a.month - b.month);

  const vaccinations = healthRecords.filter(r => r.record_type === 'vaccination');
  const documents = healthRecords.filter(r => r.record_type === 'document');

  const chartConfig = { weight: { color: "#ef4444", label: "Weight (lbs)" }, height: { color: "#3b82f6", label: "Height (in)" } };

  if (isLoadingPuppy) return <div className="flex items-center justify-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-brand-red" /> <p className="ml-3">Loading puppy profile...</p></div>;
  if (error && !puppy) return <div className="text-center py-10"><AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" /><h3 className="text-xl font-semibold text-red-600">Error Loading Puppy</h3><p className="text-muted-foreground">{error}</p></div>;
  if (!puppy) return <div className="text-center py-10"><AlertCircle className="h-12 w-12 mx-auto text-orange-500 mb-4" /><h3 className="text-xl font-semibold text-orange-600">Puppy Not Found</h3><p className="text-muted-foreground">The requested puppy could not be found.</p></div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Puppy Info Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-1">
          <Card className="overflow-hidden shadow-lg">
            <img src={puppy.image_urls[0] || "/placeholder.svg"} alt={puppy.name} className="w-full h-60 object-cover"/>
            <CardHeader>
              <CardTitle className="text-3xl flex items-center">{puppy.name} <PawPrint className="ml-2 h-6 w-6 text-brand-red" /></CardTitle>
              <CardDescription>{puppy.breed_name || "N/A Breed"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p><strong>Age:</strong> {displayAge}</p>
              <p><strong>Color:</strong> {puppy.color || "N/A"}</p>
              <p><strong>Current Weight:</strong> {puppy.weight ? `${puppy.weight} lbs` : "N/A"}</p>
              <p><strong>Microchip:</strong> {puppy.microchip_id || "N/A"}</p>
              <div>
                <Label>Growth Progress ({growthProgress}%)</Label>
                <Progress value={growthProgress} className="h-3 mt-1" />
              </div>
            </CardContent>
             <CardFooter>
                <Button asChild variant="outline" className="w-full">
                    <Link to={`/puppies/${puppy.id}`} target="_blank" rel="noopener noreferrer">
                        View Public Profile <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Tabs Column */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="health">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="health">Health</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
            </TabsList>

            {/* Health Tab */}
            <TabsContent value="health">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Health Overview</CardTitle>
                    <Button onClick={() => setShowAddHealthForm(true)} size="sm"><PlusCircle className="mr-2 h-4 w-4"/> Add Record</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {showAddHealthForm && (
                    <form onSubmit={handleAddHealthRecordSubmit} className="mb-6 p-4 border rounded-lg space-y-3">
                      <h4 className="text-md font-semibold">Add New Health Record</h4>
                      <div>
                        <Label htmlFor="record_type">Record Type</Label>
                        <Select
                            value={newHealthRecord.record_type}
                            onValueChange={(value: HealthRecord['record_type']) => setNewHealthRecord(prev => ({...prev, record_type: value}))}
                        >
                            <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="note">Note</SelectItem>
                                <SelectItem value="vaccination">Vaccination</SelectItem>
                                <SelectItem value="weight_log">Weight Log</SelectItem>
                                <SelectItem value="height_log">Height Log</SelectItem>
                                <SelectItem value="document">Document Link</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                       <div><Label htmlFor="date">Date</Label><Input type="date" id="date" value={newHealthRecord.date} onChange={e => setNewHealthRecord(prev => ({...prev, date: e.target.value}))} required/></div> {/* Replace with DatePicker if available */}
                      <div><Label htmlFor="details">Details / Name</Label><Textarea id="details" value={newHealthRecord.details} onChange={e => setNewHealthRecord(prev => ({...prev, details: e.target.value}))} required/></div>
                      {(newHealthRecord.record_type === 'weight_log' || newHealthRecord.record_type === 'height_log') && (
                        <>
                          <div><Label htmlFor="value">Value</Label><Input type="number" id="value" value={newHealthRecord.value} onChange={e => setNewHealthRecord(prev => ({...prev, value: e.target.value}))} /></div>
                          <div><Label htmlFor="unit">Unit (lbs, kg, in, cm)</Label><Input id="unit" value={newHealthRecord.unit} onChange={e => setNewHealthRecord(prev => ({...prev, unit: e.target.value}))} /></div>
                        </>
                      )}
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setShowAddHealthForm(false)}>Cancel</Button>
                        <Button type="submit">Save Record</Button>
                      </div>
                    </form>
                  )}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Vaccinations</h3>
                      {isLoadingHealth && <Loader2 className="animate-spin" />}
                      {vaccinations.length > 0 ? vaccinations.map(v => <div key={v.id} className="text-sm p-2 border-b">{v.details} - {new Date(v.date).toLocaleDateString()}</div>) : <p className="text-sm text-muted-foreground">No vaccination records.</p>}
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Growth Chart</h3>
                       {isLoadingHealth && <Loader2 className="animate-spin" />}
                      {(weightHistory.length > 0 || heightHistory.length > 0) ? (
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" type="number" domain={['dataMin -1', 'dataMax + 1']} label={{ value: "Age (months)", position: 'insideBottomRight', offset: -5}}/>
                            <YAxis yAxisId="left" dataKey="weight" name="Weight" unit="lbs" stroke={chartConfig.weight.color} />
                            <YAxis yAxisId="right" dataKey="height" name="Height" unit="in" orientation="right" stroke={chartConfig.height.color} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <ChartLegend />
                            <Line yAxisId="left" type="monotone" dataKey="weight" stroke={chartConfig.weight.color} name="Weight (lbs)" connectNulls />
                            <Line yAxisId="right" type="monotone" dataKey="height" stroke={chartConfig.height.color} name="Height (in)" connectNulls />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : <p className="text-sm text-muted-foreground">No growth data to display.</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents">
              <Card>
                <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
                <CardContent>
                  {isLoadingHealth && <Loader2 className="animate-spin" />}
                  {documents.length > 0 ? documents.map(d => (
                    <div key={d.id} className="text-sm p-2 border-b flex justify-between items-center">
                      <span>{d.details} - {new Date(d.date).toLocaleDateString()}</span>
                      {/* Assuming details contains a URL for document type 'document' */}
                      {d.record_type === 'document' && d.details.startsWith('http') &&
                        <Button variant="outline" size="sm" asChild><a href={d.details} target="_blank" rel="noopener noreferrer">View</a></Button>}
                    </div>
                  )) : <p className="text-sm text-muted-foreground">No documents uploaded.</p>}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Messages Tab */}
            <TabsContent value="messages">
              <Card>
                <CardHeader><CardTitle>Messages {activeConversation ? `- ${activeConversation.title}`: ''}</CardTitle></CardHeader>
                <CardContent>
                  {isLoadingConvos && <Loader2 className="animate-spin" />}
                  {/* TODO: UI to switch between multiple conversations if they exist for this puppy */}
                  <div className="h-[300px] overflow-y-auto border p-2 rounded-md mb-2 space-y-2">
                    {isLoadingMessages && <Loader2 className="animate-spin" />}
                    {messages.map(msg => (
                      <div key={msg.id} className={`p-2 rounded-lg ${msg.sender_id === user?.id ? 'bg-blue-100 text-right ml-auto' : 'bg-gray-100 text-left mr-auto'}`} style={{maxWidth: '80%'}}>
                        <p className="text-xs text-muted-foreground">{msg.sender_type} ({new Date(msg.sent_at).toLocaleTimeString()})</p>
                        <p>{msg.content}</p>
                      </div>
                    ))}
                    {!isLoadingMessages && messages.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No messages yet, or select/start a conversation.</p>}
                  </div>
                  <div className="flex space-x-2">
                    <Textarea value={newMessageContent} onChange={e => setNewMessageContent(e.target.value)} placeholder="Type your message..." rows={2} />
                    <Button onClick={handleStartOrSendMessage} disabled={isLoadingMessages || isLoadingConvos}><Send className="h-4 w-4"/></Button>
                  </div>
                   {!activeConversation && !isLoadingConvos && <p className="text-xs text-muted-foreground mt-1">Sending a message will start a new conversation about {puppy.name}.</p>}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default PuppyProfile;
