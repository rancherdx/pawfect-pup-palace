
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Section from "@/components/Section";
import { PawPrint, User, Receipt, MessageCircle, ChartBar } from "lucide-react";
import UserProfile from "@/components/dashboard/UserProfile";
import CreatureProfiles from "@/components/dashboard/CreatureProfiles";
import Receipts from "@/components/dashboard/Receipts";
import ChatHistory from "@/components/dashboard/ChatHistory";

const Dashboard = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // For demo purposes, we're using a fake authentication state
  // In production, this would be connected to your auth system
  if (!isAuthenticated) {
    return (
      <Section>
        <div className="max-w-md mx-auto text-center space-y-6 py-12">
          <div className="bg-accent/30 p-8 rounded-xl">
            <PawPrint className="h-16 w-16 mx-auto mb-4 text-brand-red" />
            <h1 className="text-2xl font-bold mb-4">Welcome to Your Pup Portal</h1>
            <p className="mb-6">Sign in to access your dashboard, view your fur-family members, and more!</p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => setIsAuthenticated(true)}
                className="w-full bg-brand-red hover:bg-red-700"
              >
                Sign In
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate("/adopt")}
                className="w-full"
              >
                Adopt a Puppy First
              </Button>
            </div>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <Section className="py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold flex items-center">
              <span className="bg-brand-red text-white p-2 rounded-full mr-3">
                <PawPrint className="h-6 w-6" />
              </span>
              Your Pup Portal
            </h1>
            <Button 
              variant="ghost" 
              onClick={() => setIsAuthenticated(false)}
              className="text-muted-foreground"
            >
              Sign Out
            </Button>
          </div>
          
          <Tabs defaultValue="creatures" className="w-full">
            <div className="bg-white dark:bg-black/20 p-4 rounded-t-xl shadow-sm border-b">
              <TabsList className="grid grid-cols-4 w-full h-auto gap-2">
                <TabsTrigger value="creatures" className="py-3 data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <PawPrint className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Creature Profiles</span>
                  <span className="sm:hidden">Creatures</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="py-3 data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <User className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Your Profile</span>
                  <span className="sm:hidden">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="receipts" className="py-3 data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <Receipt className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Adoption Records</span>
                  <span className="sm:hidden">Records</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="py-3 data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Chat History</span>
                  <span className="sm:hidden">Chat</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="bg-white dark:bg-black/20 p-6 rounded-b-xl shadow-md min-h-[500px]">
              <TabsContent value="creatures" className="mt-0">
                <CreatureProfiles />
              </TabsContent>
              
              <TabsContent value="profile" className="mt-0">
                <UserProfile />
              </TabsContent>
              
              <TabsContent value="receipts" className="mt-0">
                <Receipts />
              </TabsContent>
              
              <TabsContent value="chat" className="mt-0">
                <ChatHistory />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Section>
    </div>
  );
};

export default Dashboard;
