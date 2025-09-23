import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SwaggerDoc from "@/components/admin/SwaggerUI";
import ReDocDoc from "@/components/admin/ReDocUI";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Code, FileText, ExternalLink, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * @component ApiDocs
 * @description A page that renders the API documentation for the platform.
 * It provides a tabbed interface to switch between Swagger UI for interactive exploration
 * and ReDoc for comprehensive, readable documentation. It also includes information
 * about the base API URL and links to further resources.
 *
 * @returns {JSX.Element} The rendered API documentation page.
 */
const ApiDocs = () => {
  const [activeTab, setActiveTab] = useState("swagger");
  const baseUrl = "https://new.gdspuppies.com";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">API Documentation</h1>
          <p className="text-lg text-muted-foreground">
            Complete API documentation for the GDS Puppies platform
          </p>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Under Development</AlertTitle>
          <AlertDescription>
            The API documentation is currently incomplete. More endpoints and details will be added soon.
          </AlertDescription>
        </Alert>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              API Base URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg">
              <code className="text-sm font-mono">{baseUrl}/api</code>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              All API endpoints are served through Supabase Edge Functions
            </p>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="swagger" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Swagger UI
            </TabsTrigger>
            <TabsTrigger value="redoc" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              ReDoc
            </TabsTrigger>
          </TabsList>

          <TabsContent value="swagger" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Interactive API Explorer</CardTitle>
                <p className="text-muted-foreground">
                  Test API endpoints directly from this interface
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[800px] overflow-hidden">
                  <SwaggerDoc />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redoc" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Comprehensive Documentation</CardTitle>
                <p className="text-muted-foreground">
                  Detailed API documentation with examples
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[800px] overflow-hidden">
                  <ReDocDoc />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Start</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Get started with the GDS Puppies API in minutes
              </p>
              <Button variant="outline" size="sm">
                View Guide
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Learn about API authentication and security
              </p>
              <Button variant="outline" size="sm">
                Auth Guide
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Code examples and integration samples
              </p>
              <Button variant="outline" size="sm">
                View Examples
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;