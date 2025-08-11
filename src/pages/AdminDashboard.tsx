
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PawPrint, Dog, Receipt, Settings, CreditCard, Layers, FileText, Globe, Users, PlugZap, Mail, ShieldCheck, MessageSquare, MoreHorizontal
} from "lucide-react"; // Added MoreHorizontal
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button"; // For the DropdownMenuTrigger
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
import TestimonialManagement from '@/components/admin/TestimonialManagement'; // Import TestimonialManagement
import SecureIntegrations from '@/components/admin/SecureIntegrations';

const allAdminTabs = [
  { value: "puppies", label: "Puppies", icon: Dog, component: <PuppyManagement /> },
  { value: "litters", label: "Litters", icon: PawPrint, component: <LitterManagement /> },
  { value: "breeds", label: "Breeds", icon: Layers, component: <BreedTemplateManager /> },
  { value: "blog", label: "Blog", icon: FileText, component: <BlogManager /> },
  { value: "seo", label: "SEO", icon: Globe, component: <SEOManager /> },
  { value: "marketing", label: "Marketing", icon: Users, component: <AffiliateManager /> }, // Assuming AffiliateManager is Marketing
  { value: "transactions", label: "Transactions", icon: Receipt, component: <TransactionHistory /> },
  { value: "square", label: "Square", icon: CreditCard, component: <SquareIntegration /> },
  { value: "settings", label: "Settings", icon: Settings, component: <SettingsPanel /> },
  { value: "integrations", label: "Integrations", icon: PlugZap, component: <ThirdPartyIntegrationsManager /> },
  { value: "secure_integrations", label: "Secure Integrations", icon: ShieldCheck, component: <SecureIntegrations /> },
  { value: "email_templates", label: "Email Templates", icon: Mail, component: <EmailTemplatesManager /> },
  { value: "users_admin", label: "Users", icon: Users, component: <AdminUserManager /> }, // Users icon repeated, but context is different
  { value: "stud_dogs_admin", label: "Stud Dogs", icon: Dog, component: <AdminStudDogManager /> }, // Dog icon repeated
  { value: "adv_security", label: "Adv. Security", icon: ShieldCheck, component: <AdvancedSecurityFeatures /> },
  { value: "data_deletion", label: "Data Deletion", icon: ShieldCheck, component: <DataDeletionRequestsManager /> }, // ShieldCheck repeated
  { value: "testimonials", label: "Testimonials", icon: MessageSquare, component: <TestimonialManagement /> },
];

const AdminDashboard = () => {
  const [activeTabValue, setActiveTabValue] = useState("puppies");
  const [visibleTabs, setVisibleTabs] = useState<typeof allAdminTabs>([]);
  const [dropdownTabs, setDropdownTabs] = useState<typeof allAdminTabs>([]);
  const tabsListRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLButtonElement>(null); // Ref for the "More" button

  useEffect(() => {
    const calculateTabsLayout = () => {
      if (!tabsListRef.current) return;

      const containerWidth = tabsListRef.current.offsetWidth;
      let moreMenuWidth = 0;
      if (allAdminTabs.length > 0) {
        moreMenuWidth = 100; // Approximate width for "More" button with icon and text
      }

      let currentWidth = 0;
      const newVisibleTabs: typeof allAdminTabs = [];
      const newDropdownTabs: typeof allAdminTabs = [];

      const averageTabWidth = 130; // px, including icon, label, padding

      let potentialVisibleTabsWidth = 0;
      for (const tab of allAdminTabs) {
        potentialVisibleTabsWidth += averageTabWidth; // Use estimated width
      }

      if (potentialVisibleTabsWidth <= containerWidth) {
        setVisibleTabs(allAdminTabs);
        setDropdownTabs([]);
      } else {
        let availableWidthForTabs = containerWidth - moreMenuWidth;
        currentWidth = 0;
        for (const tab of allAdminTabs) {
          if (currentWidth + averageTabWidth <= availableWidthForTabs) {
            newVisibleTabs.push(tab);
            currentWidth += averageTabWidth;
          } else {
            newDropdownTabs.push(tab);
          }
        }
        setVisibleTabs(newVisibleTabs);
        setDropdownTabs(newDropdownTabs);
      }
    };

    calculateTabsLayout(); // Calculate on initial mount

    window.addEventListener("resize", calculateTabsLayout);
    return () => window.removeEventListener("resize", calculateTabsLayout);
  }, [allAdminTabs]);

  const handleTabChange = (value: string) => {
    setActiveTabValue(value);
  };

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
          
          <Tabs value={activeTabValue} onValueChange={handleTabChange} className="w-full">
            <div className="bg-white dark:bg-black/30 p-4 rounded-t-xl shadow-sm border-b">
              <TabsList ref={tabsListRef} className="flex items-center">
                {visibleTabs.map(tab => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="py-3 text-sm md:text-base data-[state=active]:bg-brand-red data-[state=active]:text-white flex-shrink-0"
                  >
                    <tab.icon className="h-5 w-5 mr-2" />
                    <span>{tab.label}</span>
                  </TabsTrigger>
                ))}
                {dropdownTabs.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        ref={moreMenuRef}
                        variant="ghost"
                        className="py-3 text-sm md:text-base flex-shrink-0 ml-2 data-[state=open]:bg-muted"
                      >
                        <MoreHorizontal className="h-5 w-5 mr-1 md:mr-2" />
                        <span className="hidden sm:inline">More</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {dropdownTabs.map(tab => (
                        <DropdownMenuItem
                          key={tab.value}
                          onSelect={() => handleTabChange(tab.value)}
                          className={activeTabValue === tab.value ? "bg-muted font-semibold" : ""}
                        >
                          <tab.icon className="h-4 w-4 mr-2" />
                          {tab.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TabsList>
            </div>
            
            <div className="bg-white dark:bg-black/10 p-6 rounded-b-xl shadow-md min-h-[700px]">
              {allAdminTabs.map(tab => (
                <TabsContent key={tab.value} value={tab.value} className="mt-0 animate-fade-in">
                  {tab.component}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
      </Section>
    </div>
  );
};

export default AdminDashboard;
