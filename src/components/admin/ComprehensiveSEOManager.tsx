import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Globe, FileCode, Search } from "lucide-react";
import { SEOMetaEditor } from "./SEOMetaEditor";
import { SitemapManager } from "./SitemapManager";
import { RobotsTxtEditor } from "./RobotsTxtEditor";
import { SchemaMarkupGenerator } from "./SchemaMarkupGenerator";

export const ComprehensiveSEOManager = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">SEO Management</h2>
        <p className="text-muted-foreground">
          Manage meta tags, sitemaps, robots.txt, and schema markup
        </p>
      </div>

      <Tabs defaultValue="meta" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="meta" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Meta Tags
          </TabsTrigger>
          <TabsTrigger value="sitemap" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Sitemap
          </TabsTrigger>
          <TabsTrigger value="robots" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Robots.txt
          </TabsTrigger>
          <TabsTrigger value="schema" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Schema Markup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="meta">
          <SEOMetaEditor />
        </TabsContent>

        <TabsContent value="sitemap">
          <SitemapManager />
        </TabsContent>

        <TabsContent value="robots">
          <RobotsTxtEditor />
        </TabsContent>

        <TabsContent value="schema">
          <SchemaMarkupGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
};
