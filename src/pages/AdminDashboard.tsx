
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PawPrint, Dog, Receipt, Settings, CreditCard, Layers, FileText, Globe, Users, PlugZap, Mail, ShieldCheck, MessageSquare, MoreHorizontal, Bell, Heart
} from "lucide-react"; // Added MoreHorizontal, Bell, and Heart
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
import SettingsPanel from "@/components/admin/SettingsPanel";
import BreedTemplateManager from "@/components/admin/BreedTemplateManager";
import BlogManager from "@/components/admin/BlogManager";
import AffiliateManager from "@/components/admin/AffiliateManager";
import SEOManager from "@/components/admin/SEOManager";
import IntegrationsHub from "@/components/admin/IntegrationsHub";
import EmailTemplatesManager from "@/components/admin/EmailTemplatesManager";
import AdminUserManager from "@/components/admin/AdminUserManager";
import AdminStudDogManager from "@/components/admin/AdminStudDogManager";
import AdvancedSecurityFeatures from "@/components/admin/AdvancedSecurityFeatures";
import DataDeletionRequestsManager from "@/components/admin/DataDeletionRequestsManager"; // Import the new component
import EnhancedTestimonialManagement from '@/components/admin/EnhancedTestimonialManagement'; // Import Enhanced TestimonialManagement
import SEOManagement from '@/components/admin/SEOManagement'; // Import SEO Management
import NotificationCenter from '@/components/admin/NotificationCenter';
import SettingsHub from '@/components/admin/SettingsHub';
import SwaggerDoc from "@/components/admin/SwaggerUI";
import ReDocDoc from "@/components/admin/ReDocUI";
import ParentManagement from '@/components/admin/ParentManagement';
import { Code } from "lucide-react";

/**
 * @constant allAdminTabs
 * @description An array of objects defining the tabs available in the admin dashboard.
 * Each object contains the value, label, icon, and component for a tab.
 */
const allAdminTabs = [
  // Core Management
  { value: "puppies", label: "Puppies", icon: Dog, component: <PuppyManagement /> },
  { value: "litters", label: "Litters", icon: Layers, component: <LitterManagement /> },
  { value: "parents", label: "Parents", icon: Heart, component: <ParentManagement /> },
  
  // Content & Marketing
  { value: "blog", label: "Blog", icon: FileText, component: <BlogManager /> },
  { value: "seo", label: "SEO", icon: Globe, component: <SEOManagement /> },
  { value: "testimonials", label: "Testimonials", icon: MessageSquare, component: <EnhancedTestimonialManagement /> },
  { value: "marketing", label: "Marketing", icon: Users, component: <AffiliateManager /> },
  
  // Settings Hub (Consolidated)
  { value: "settings", label: "Settings", icon: Settings, component: <SettingsHub /> },

  // Developer Tools
  { value: "swagger", label: "Swagger UI", icon: Code, component: <SwaggerDoc /> },
  { value: "redoc", label: "ReDoc", icon: Code, component: <ReDocDoc /> },
];

/**
 * @component AdminDashboard
 * @description The main administrative interface for the application.
 * It provides a tabbed navigation to various management panels, such as user management,
 * transaction history, content management, and system settings. The component is responsive
 * and will collapse tabs into a "More" dropdown menu on smaller screens. The active
 * tab is synced with the URL search parameters, allowing for direct linking to specific tabs.
 *
 * @returns {JSX.Element} The rendered admin dashboard component.
 */
const AdminDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "puppies";
  const [activeTabValue, setActiveTabValue] = useState(initialTab);
  const [visibleTabs, setVisibleTabs] = useState<typeof allAdminTabs>([]);
  const [dropdownTabs, setDropdownTabs] = useState<typeof allAdminTabs>([]);
  const tabsListRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLButtonElement>(null); // Ref for the "More" button

  useEffect(() => {
    // Sync URL with tab state
    const currentTab = searchParams.get("tab");
    if (currentTab && currentTab !== activeTabValue) {
      setActiveTabValue(currentTab);
    }
  }, [searchParams, activeTabValue]);

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
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTabValue(value);
    setSearchParams({ tab: value });
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
