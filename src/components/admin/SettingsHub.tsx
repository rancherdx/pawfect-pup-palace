import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
  Mail, 
  Shield,
  Users, 
  Trash2,
  Image,
  Eye,
  Zap
} from "lucide-react";
import SettingsPanel from "./SettingsPanel";
import EmailTemplatesManager from "./EmailTemplatesManager";
import IntegrationsHub from "./IntegrationsHub";
import AdminUserManager from "./AdminUserManager";
import AdvancedSecurityFeatures from "./AdvancedSecurityFeatures";
import DataDeletionRequestsManager from "./DataDeletionRequestsManager";
import BrandAssetManager from "./BrandAssetManager";

/**
 * @component SettingsHub
 * @description A central hub for all administrative settings. It uses a tab-based navigation
 * to render different management components for various aspects of the application.
 * @returns {React.ReactElement} The rendered settings hub interface.
 */
const SettingsHub = () => {
  const [activeTab, setActiveTab] = useState("general");

  /**
   * @const settingsTabs
   * @description An array of objects defining the configuration for each tab in the settings hub.
   * Each object contains the tab's value, label, icon, and the component to render.
   */
  const settingsTabs = [
    { 
      value: "general", 
      label: "General", 
      icon: Settings, 
      component: <SettingsPanel /> 
    },
    { 
      value: "branding", 
      label: "Brand Assets", 
      icon: Image, 
      component: <BrandAssetManager /> 
    },
    { 
      value: "users", 
      label: "Users", 
      icon: Users, 
      component: <AdminUserManager /> 
    },
    { 
      value: "email", 
      label: "Email Templates", 
      icon: Mail, 
      component: <EmailTemplatesManager /> 
    },
    { 
      value: "integrations", 
      label: "Integrations", 
      icon: Zap, 
      component: <IntegrationsHub /> 
    },
    { 
      value: "security", 
      label: "Security", 
      icon: Shield, 
      component: <AdvancedSecurityFeatures /> 
    },
    { 
      value: "data_deletion", 
      label: "Data Deletion", 
      icon: Trash2, 
      component: <DataDeletionRequestsManager /> 
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Settings & Configuration</h2>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-card rounded-lg border shadow-sm">
          <TabsList className="w-full justify-start rounded-none bg-muted/50 p-1 h-auto flex-wrap gap-1">
            {settingsTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="p-6">
            {settingsTabs.map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-0">
                {tab.component}
              </TabsContent>
            ))}
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default SettingsHub;