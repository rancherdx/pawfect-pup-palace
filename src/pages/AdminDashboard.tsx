
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PawPrint, Plus, Dog, Receipt, Settings, CreditCard, Layers } from "lucide-react";
import Section from "@/components/Section";
import PuppyManagement from "@/components/admin/PuppyManagement";
import LitterManagement from "@/components/admin/LitterManagement";
import TransactionHistory from "@/components/admin/TransactionHistory";
import SquareIntegration from "@/components/admin/SquareIntegration";
import SettingsPanel from "@/components/admin/SettingsPanel";
import BreedTemplateManager from "@/components/admin/BreedTemplateManager";

const AdminDashboard = () => {
  const [isAdmin, setIsAdmin] = useState(true);  // For demo purposes, in production use actual auth

  // For demo purposes, we're using a fake authentication state
  // In production, this would be connected to your auth system
  if (!isAdmin) {
    return (
      <Section>
        <div className="max-w-md mx-auto text-center space-y-6 py-12">
          <div className="bg-accent/30 p-8 rounded-xl shadow-lg border-2 border-brand-red/20">
            <PawPrint className="h-16 w-16 mx-auto mb-4 text-brand-red" />
            <h1 className="text-2xl font-bold mb-4">Admin Access Required</h1>
            <p className="mb-6">You need administrator privileges to access this dashboard.</p>
          </div>
        </div>
      </Section>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black/95 paw-print-bg">
      <Section className="py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold flex items-center">
              <span className="bg-brand-red text-white p-2 rounded-full mr-3">
                <PawPrint className="h-6 w-6" />
              </span>
              Breeder Dashboard
            </h1>
            <div className="space-x-2">
              <button 
                onClick={() => setIsAdmin(false)}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Exit Admin Mode
              </button>
            </div>
          </div>
          
          <Tabs defaultValue="puppies" className="w-full">
            <div className="bg-white dark:bg-black/30 p-4 rounded-t-xl shadow-sm border-b">
              <TabsList className="grid grid-cols-6 w-full h-auto gap-2">
                <TabsTrigger value="puppies" className="py-4 text-lg data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <Dog className="h-5 w-5 mr-2" />
                  <span>Puppies</span>
                </TabsTrigger>
                <TabsTrigger value="litters" className="py-4 text-lg data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <PawPrint className="h-5 w-5 mr-2" />
                  <span>Litters</span>
                </TabsTrigger>
                <TabsTrigger value="breeds" className="py-4 text-lg data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <Layers className="h-5 w-5 mr-2" />
                  <span>Breed Templates</span>
                </TabsTrigger>
                <TabsTrigger value="transactions" className="py-4 text-lg data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <Receipt className="h-5 w-5 mr-2" />
                  <span>Transactions</span>
                </TabsTrigger>
                <TabsTrigger value="square" className="py-4 text-lg data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <CreditCard className="h-5 w-5 mr-2" />
                  <span>Square</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="py-4 text-lg data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <Settings className="h-5 w-5 mr-2" />
                  <span>Settings</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="bg-white dark:bg-black/10 p-6 rounded-b-xl shadow-md min-h-[700px]">
              <TabsContent value="puppies" className="mt-0 animate-fade-in">
                <PuppyManagement />
              </TabsContent>
              
              <TabsContent value="litters" className="mt-0 animate-fade-in">
                <LitterManagement />
              </TabsContent>
              
              <TabsContent value="breeds" className="mt-0 animate-fade-in">
                <BreedTemplateManager />
              </TabsContent>
              
              <TabsContent value="transactions" className="mt-0 animate-fade-in">
                <TransactionHistory />
              </TabsContent>
              
              <TabsContent value="square" className="mt-0 animate-fade-in">
                <SquareIntegration />
              </TabsContent>
              
              <TabsContent value="settings" className="mt-0 animate-fade-in">
                <SettingsPanel />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Section>
    </div>
  );
};

export default AdminDashboard;
