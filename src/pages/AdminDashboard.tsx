
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PawPrint, Plus, Dog, Receipt, Settings, CreditCard, Layers, FileText, Globe, Users, PlugZap, Mail, ShieldCheck } from "lucide-react"; // Added ShieldCheck
import Section from "@/components/Section";
import PuppyManagement from "@/components/admin/PuppyManagement";
import LitterManagement from "@/components/admin/LitterManagement";
import TransactionHistory from "@/components/admin/TransactionHistory";
import SquareIntegration from "@/components/admin/SquareIntegration";
import SettingsPanel from "@/components/admin/SettingsPanel";
import BreedTemplateManager from "@/components/admin/BreedTemplateManager";
import BlogManager from "@/components/admin/BlogManager";
import AffiliateManager from "@/components/admin/AffiliateManager";
import SEOManager from "@/components/admin/SEOManager";
import ThirdPartyIntegrationsManager from "@/components/admin/ThirdPartyIntegrationsManager";
import EmailTemplatesManager from "@/components/admin/EmailTemplatesManager";
import AdminUserManager from "@/components/admin/AdminUserManager";
import AdminStudDogManager from "@/components/admin/AdminStudDogManager";
import AdvancedSecurityFeatures from "@/components/admin/AdvancedSecurityFeatures";
import DataDeletionRequestsManager from "@/components/admin/DataDeletionRequestsManager"; // Import the new component

const AdminDashboard = () => {
  // Comments about fake authentication are removed.
  // The component now assumes it's rendered only if ProtectedRoute allows it.

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
          </div>
          
          <Tabs defaultValue="puppies" className="w-full">
            <div className="bg-white dark:bg-black/30 p-4 rounded-t-xl shadow-sm border-b overflow-x-auto">
              {/* Adjusted grid-cols to 15 and min-w */}
              <TabsList className="grid grid-cols-15 w-full h-auto gap-2 min-w-[1500px]"> {/* Increased min-w */}
                <TabsTrigger value="puppies" className="py-3 text-sm md:text-base data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <Dog className="h-5 w-5 mr-2" />
                  <span>Puppies</span>
                </TabsTrigger>
                <TabsTrigger value="litters" className="py-3 text-sm md:text-base data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <PawPrint className="h-5 w-5 mr-2" />
                  <span>Litters</span>
                </TabsTrigger>
                <TabsTrigger value="breeds" className="py-3 text-sm md:text-base data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <Layers className="h-5 w-5 mr-2" />
                  <span>Breeds</span>
                </TabsTrigger>
                <TabsTrigger value="blog" className="py-3 text-sm md:text-base data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <FileText className="h-5 w-5 mr-2" />
                  <span>Blog</span>
                </TabsTrigger>
                <TabsTrigger value="seo" className="py-3 text-sm md:text-base data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <Globe className="h-5 w-5 mr-2" />
                  <span>SEO</span>
                </TabsTrigger>
                <TabsTrigger value="marketing" className="py-3 text-sm md:text-base data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <Users className="h-5 w-5 mr-2" />
                  <span>Marketing</span>
                </TabsTrigger>
                <TabsTrigger value="transactions" className="py-3 text-sm md:text-base data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <Receipt className="h-5 w-5 mr-2" />
                  <span>Transactions</span>
                </TabsTrigger>
                <TabsTrigger value="square" className="py-3 text-sm md:text-base data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <CreditCard className="h-5 w-5 mr-2" />
                  <span>Square</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="py-3 text-sm md:text-base data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <Settings className="h-5 w-5 mr-2" />
                  <span>Settings</span>
                </TabsTrigger>
                <TabsTrigger value="integrations" className="py-3 text-sm md:text-base data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <PlugZap className="h-5 w-5 mr-2" />
                  <span>Integrations</span>
                </TabsTrigger>
                <TabsTrigger value="email_templates" className="py-3 text-sm md:text-base data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <Mail className="h-5 w-5 mr-2" />
                  <span>Email Templates</span>
                </TabsTrigger>
                <TabsTrigger value="users_admin" className="py-3 text-sm md:text-base data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <Users className="h-5 w-5 mr-2" />
                  <span>Users</span>
                </TabsTrigger>
                <TabsTrigger value="stud_dogs_admin" className="py-3 text-sm md:text-base data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <Dog className="h-5 w-5 mr-2" />
                  <span>Stud Dogs</span>
                </TabsTrigger>
                <TabsTrigger value="adv_security" className="py-3 text-sm md:text-base data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <ShieldCheck className="h-5 w-5 mr-2" />
                  <span>Adv. Security</span>
                </TabsTrigger>
                <TabsTrigger value="data_deletion" className="py-3 text-sm md:text-base data-[state=active]:bg-brand-red data-[state=active]:text-white">
                  <ShieldCheck className="h-5 w-5 mr-2" /> {/* Consider a more specific icon if available */}
                  <span>Data Deletion</span>
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
              
              <TabsContent value="blog" className="mt-0 animate-fade-in">
                <BlogManager />
              </TabsContent>
              
              <TabsContent value="seo" className="mt-0 animate-fade-in">
                <SEOManager />
              </TabsContent>
              
              <TabsContent value="marketing" className="mt-0 animate-fade-in">
                <AffiliateManager />
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
              <TabsContent value="integrations" className="mt-0 animate-fade-in">
                <ThirdPartyIntegrationsManager />
              </TabsContent>
              <TabsContent value="email_templates" className="mt-0 animate-fade-in">
                <EmailTemplatesManager />
              </TabsContent>
              <TabsContent value="users_admin" className="mt-0 animate-fade-in">
                <AdminUserManager />
              </TabsContent>
              <TabsContent value="stud_dogs_admin" className="mt-0 animate-fade-in">
                <AdminStudDogManager />
              </TabsContent>
              <TabsContent value="adv_security" className="mt-0 animate-fade-in">
                <AdvancedSecurityFeatures />
              </TabsContent>
              <TabsContent value="data_deletion" className="mt-0 animate-fade-in">
                <DataDeletionRequestsManager />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Section>
    </div>
  );
};

export default AdminDashboard;
