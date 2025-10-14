import { useState, useEffect } from "react";
import { useRobotsTxt, useUpdateRobotsTxt } from "@/hooks/useSEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const RobotsTxtEditor = () => {
  const { data: robotsConfig, isLoading } = useRobotsTxt();
  const updateMutation = useUpdateRobotsTxt();
  const [content, setContent] = useState("");

  useEffect(() => {
    if (robotsConfig) {
      setContent(robotsConfig.content);
    }
  }, [robotsConfig]);

  const handleSave = () => {
    if (robotsConfig) {
      updateMutation.mutate({ id: robotsConfig.id, content });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Robots.txt Editor</CardTitle>
          <CardDescription>
            Configure how search engines crawl your website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className="font-mono text-sm"
            placeholder="User-agent: *&#10;Allow: /&#10;&#10;Sitemap: https://yourdomain.com/sitemap.xml"
          />
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-semibold">Common patterns:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <code>User-agent: *</code> - Applies to all search engines
              </li>
              <li>
                <code>Allow: /</code> - Allow crawling of all pages
              </li>
              <li>
                <code>Disallow: /admin/</code> - Block admin pages
              </li>
              <li>
                <code>Sitemap: https://yourdomain.com/sitemap.xml</code> - Link to your sitemap
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
          <CardDescription>How your robots.txt will look</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto">
            {content || "No content"}
          </pre>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateMutation.isPending} size="lg">
          {updateMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Robots.txt
        </Button>
      </div>
    </div>
  );
};
