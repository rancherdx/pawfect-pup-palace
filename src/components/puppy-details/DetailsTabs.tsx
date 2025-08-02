import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Clipboard, Pill, Dog, PawPrint } from "lucide-react";
import DetailsTabContent from "./DetailsTabContent";
import HealthTabContent from "./HealthTabContent";
import ParentsTabContent from "./ParentsTabContent";
import { Puppy } from "@/types"; // Adjust the import path according to your project structure

interface DetailsTabsProps {
  puppy: Puppy;
}

const DetailsTabs = ({ puppy }: DetailsTabsProps) => {
  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="w-full max-w-3xl mx-auto grid grid-cols-3 mb-6">
        <TabsTrigger value="details" className="data-[state=active]:text-brand-red data-[state=active]:border-b-2 data-[state=active]:border-brand-red">
          <Clipboard className="h-4 w-4 mr-2" />
          Details
        </TabsTrigger>
        <TabsTrigger value="health" className="data-[state=active]:text-brand-red data-[state=active]:border-b-2 data-[state=active]:border-brand-red">
          <Pill className="h-4 w-4 mr-2" />
          Health
        </TabsTrigger>
        <TabsTrigger value="parents" className="data-[state=active]:text-brand-red data-[state=active]:border-b-2 data-[state=active]:border-brand-red">
          <Dog className="h-4 w-4 mr-2" />
          Parents
        </TabsTrigger>
      </TabsList>

      <TabsContent value="details" className="mt-4 animate-fade-in">
        <DetailsTabContent puppy={puppy} />
      </TabsContent>

      <TabsContent value="health" className="mt-4 animate-fade-in">
        <HealthTabContent puppy={puppy} />
      </TabsContent>

      <TabsContent value="parents" className="mt-4 animate-fade-in">
        <ParentsTabContent parents={puppy.parents} />
      </TabsContent>
    </Tabs>
  );
};

export default DetailsTabs;
