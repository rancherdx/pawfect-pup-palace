
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, Receipt, MessageSquare, Dog, PawPrint, Cat, Bell, Shield } from "lucide-react";
import Section from "@/components/Section";
import UserProfile from "@/components/dashboard/UserProfile";
import PuppyProfile from "@/components/dashboard/PuppyProfile";
import Receipts from "@/components/dashboard/Receipts";
import ChatHistory from "@/components/dashboard/ChatHistory";
import CreatureProfiles from "@/components/dashboard/CreatureProfiles";
import NotificationCenter from "@/components/admin/NotificationCenter";
import SecuritySettings from "@/components/dashboard/SecuritySettings";

/**
 * @component Dashboard
 * @description The user dashboard page, which provides a tabbed interface for users
 * to manage their profile, view their puppy and kitten profiles, access receipts,
 * and check their messages and notifications.
 *
 * @returns {JSX.Element} The rendered dashboard component.
 */
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <Section title="Dashboard" subtitle="Manage your profile, puppies, and more.">
      <Tabs defaultValue={activeTab} className="w-full">
        <TabsList className="bg-secondary/50 p-2 rounded-lg shadow-sm flex-wrap">
          <TabsTrigger value="profile" onClick={() => setActiveTab("profile")}>
            <UserCircle className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" onClick={() => setActiveTab("security")}>
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="puppy-profiles" onClick={() => setActiveTab("puppy-profiles")}>
            <Dog className="h-4 w-4 mr-2" />
            Puppy Profiles
          </TabsTrigger>
          <TabsTrigger value="kitten-profiles" onClick={() => setActiveTab("kitten-profiles")}>
            <Cat className="h-4 w-4 mr-2" />
            Kitten Profiles
          </TabsTrigger>
          <TabsTrigger value="receipts" onClick={() => setActiveTab("receipts")}>
            <Receipt className="h-4 w-4 mr-2" />
            Receipts
          </TabsTrigger>
          <TabsTrigger value="messages" onClick={() => setActiveTab("messages")}>
            <MessageSquare className="h-4 w-4 mr-2" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="notifications" onClick={() => setActiveTab("notifications")}>
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-6">
          <UserProfile />
        </TabsContent>
        <TabsContent value="security" className="mt-6">
          <SecuritySettings />
        </TabsContent>
        <TabsContent value="puppy-profiles" className="mt-6">
          <PuppyProfile />
        </TabsContent>
        <TabsContent value="kitten-profiles" className="mt-6">
          <CreatureProfiles />
        </TabsContent>
        <TabsContent value="receipts" className="mt-6">
          <Receipts />
        </TabsContent>
        <TabsContent value="messages" className="mt-6">
          <ChatHistory />
        </TabsContent>
        <TabsContent value="notifications" className="mt-6">
          <NotificationCenter />
        </TabsContent>
      </Tabs>
    </Section>
  );
};

export default Dashboard;
