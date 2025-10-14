import { useSitemapEntries } from "@/hooks/useSEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export const SitemapManager = () => {
  const { data: entries, isLoading, refetch } = useSitemapEntries();

  const handleGenerateSitemap = async () => {
    try {
      // Generate XML sitemap
      const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries?.map((entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${new Date(entry.last_modified).toISOString()}</lastmod>
    <changefreq>${entry.change_frequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

      // Create blob and download
      const blob = new Blob([xmlContent], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "sitemap.xml";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Sitemap generated and downloaded successfully");
    } catch (error) {
      toast.error("Failed to generate sitemap");
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sitemap Configuration</CardTitle>
              <CardDescription>
                Manage your sitemap entries for better search engine indexing
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button size="sm" onClick={handleGenerateSitemap}>
                <Download className="h-4 w-4 mr-2" />
                Download Sitemap
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Total entries: {entries?.length || 0}
            </p>
            <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
              <ul className="space-y-2">
                {entries?.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between text-sm py-2 border-b last:border-b-0"
                  >
                    <span className="font-mono text-xs">{entry.url}</span>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Priority: {entry.priority}</span>
                      <span>{entry.change_frequency}</span>
                      <span className={entry.is_active ? "text-green-500" : "text-red-500"}>
                        {entry.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sitemap Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • Sitemap entries are auto-generated from your pages, puppies, litters, and blog
            posts
          </p>
          <p>• Download and upload the sitemap.xml to your site's root directory</p>
          <p>• Submit your sitemap to Google Search Console and Bing Webmaster Tools</p>
          <p>
            • Your sitemap URL should be: <code>https://yourdomain.com/sitemap.xml</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
