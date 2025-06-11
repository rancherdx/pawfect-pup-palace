
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PawPrint, Dog, Receipt, Settings, CreditCard, Layers, FileText, Globe, Users, PlugZap, Mail, ShieldCheck, MessageSquare, MoreHorizontal, Inbox as InboxIcon
} from "lucide-react"; // Added MoreHorizontal, InboxIcon, MessageCircle for Live Chat
import { // MessageCircle might already be there from Testimonials, ensure it's available or aliased if needed.
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
import UnifiedInboxManager from "@/components/admin/UnifiedInbox/UnifiedInboxManager"; // Import UnifiedInboxManager
import ChatManager from "@/components/admin/LiveChat/ChatManager"; // Import ChatManager
import useAdminNotificationSocket from "@/hooks/useAdminNotificationSocket"; // Import the WebSocket hook

const allAdminTabs = [
  { value: "inbox", label: "Inbox", icon: InboxIcon, component: <UnifiedInboxManager /> },
  { value: "live_chat", label: "Live Chat", icon: MessageSquare, component: <ChatManager /> }, // MessageSquare was already imported for Testimonials
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

  // Initialize the Admin Notification WebSocket connection
  // The hook itself handles connection logic based on auth state from useAuth
  useAdminNotificationSocket({
    onOpen: () => console.log("AdminDashboard: WebSocket connected for notifications."),
    onClose: (event) => console.log("AdminDashboard: WebSocket disconnected.", event.reason),
    onError: (event) => console.error("AdminDashboard: WebSocket error.", event),
    // onMessage for specific handling here if needed, but toasts are handled in the hook itself
  });

  useEffect(() => {
    const calculateTabsLayout = () => {
      if (!tabsListRef.current) return;

      const containerWidth = tabsListRef.current.offsetWidth;
      let moreMenuWidth = 0;
      if (allAdminTabs.length > 0) { // Estimate "More" menu width or measure it if always rendered
        // Temporarily render "More" button to measure it or use a fixed estimate
        // For simplicity here, let's use an estimate. A more robust way is to measure it.
        // If moreMenuRef.current is available (i.e., it's rendered when dropdownTabs will exist), use its width.
        // This creates a slight paradox: we need its width to decide if it should exist.
        // So, we'll use an estimated width for the calculation.
        moreMenuWidth = 100; // Approximate width for "More" button with icon and text
      }

      let currentWidth = 0;
      const newVisibleTabs: typeof allAdminTabs = [];
      const newDropdownTabs: typeof allAdminTabs = [];

      // Iterate over all tab elements to get their actual widths
      const tabElements = Array.from(tabsListRef.current.querySelectorAll<HTMLElement>('button[role="tab"]'));

      // Fallback if direct measurement isn't working as expected (e.g. initial render)
      // This part needs careful implementation. For now, let's assume a simplified estimate if measurement is tricky.
      // A robust solution would render all tabs, measure, then hide.
      // For this iteration, we'll use a simpler logic: assume an average width if measurement is problematic.
      // Average width estimate (can be refined)
      const averageTabWidth = 130; // px, including icon, label, padding

      let potentialVisibleTabsWidth = 0;
      for (const tab of allAdminTabs) {
        potentialVisibleTabsWidth += averageTabWidth; // Use estimated width
      }

      if (potentialVisibleTabsWidth <= containerWidth) {
        // All tabs fit
        setVisibleTabs(allAdminTabs);
        setDropdownTabs([]);
      } else {
        // Not all tabs fit, calculate how many can be visible
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

    // Add resize listener
    window.addEventListener("resize", calculateTabsLayout);
    return () => window.removeEventListener("resize", calculateTabsLayout);
  }, [allAdminTabs]); // Rerun if allAdminTabs changes (though it's constant here)

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
              <TabsList ref={tabsListRef} className="flex items-center"> {/* Removed space-x-2 for more precise control if needed */}
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
                      {/* Attaching ref to the More button for potential measurement */}
                      <Button ref={moreMenuRef} variant="ghost" className="py-3 text-sm md:text-base flex-shrink-0 ml-2 data-[state=open]:bg-muted">
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
              <TabsContent value="testimonials" className="mt-0 animate-fade-in">
                <TestimonialManagement />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Section>
    </div>
  );
};

export default AdminDashboard;
