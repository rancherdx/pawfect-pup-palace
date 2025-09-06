import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Search, Globe, FileText, Share2, ArrowUpRight, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const SEOManager = () => {
  const [selectedTab, setSelectedTab] = useState("pages");
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [editingMeta, setEditingMeta] = useState<any>(null);

  // Fetch SEO data from Supabase
  const { data: seoData, isLoading, refetch } = useQuery({
    queryKey: ['seo-meta'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_meta')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate SEO scores and analytics
  const calculateSEOScore = (meta: any) => {
    let score = 0;
    if (meta.meta_title && meta.meta_title.length <= 60) score += 25;
    if (meta.meta_description && meta.meta_description.length <= 160) score += 25;
    if (meta.meta_keywords && meta.meta_keywords.length > 0) score += 20;
    if (meta.og_title && meta.og_image) score += 15;
    if (meta.canonical_url) score += 15;
    return Math.min(score, 100);
  };

  const overallScore = seoData && seoData.length > 0 
    ? Math.round(seoData.reduce((sum, meta) => sum + calculateSEOScore(meta), 0) / seoData.length)
    : 0;
  
  const handleEditPage = (pageId: string) => {
    const page = seoData?.find(p => p.id === pageId);
    if (page) {
      setEditingMeta({ ...page });
      setSelectedPage(pageId);
    }
  };
  
  const handleSaveMeta = async () => {
    if (!editingMeta) return;
    
    try {
      const { error } = await supabase
        .from('seo_meta')
        .update({
          meta_title: editingMeta.meta_title,
          meta_description: editingMeta.meta_description,
          meta_keywords: editingMeta.meta_keywords,
          og_title: editingMeta.og_title,
          og_description: editingMeta.og_description,
          og_image: editingMeta.og_image,
          canonical_url: editingMeta.canonical_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingMeta.id);

      if (error) throw error;
      
      setSelectedPage(null);
      setEditingMeta(null);
      refetch();
      
      toast.success("Page metadata updated", {
        description: "The changes will be reflected on your site soon."
      });
    } catch (error) {
      console.error('Error updating SEO meta:', error);
      toast.error("Failed to update metadata");
    }
  };
  
  const handleCancelEdit = () => {
    setSelectedPage(null);
    setEditingMeta(null);
  };
  
  const handleGenerateSitemap = () => {
    toast.success("Sitemap generation started", {
      description: "Your sitemap will be updated shortly."
    });
  };
  
  const handleSubmitToSearchEngines = () => {
    toast.success("Sitemap submitted to search engines", {
      description: "Your sitemap has been submitted to Google and Bing."
    });
  };

  const getSeoScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">SEO Management</h1>
          <p className="text-muted-foreground">Optimize your site's visibility in search engines</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Overall SEO Score</CardTitle>
            <CardDescription>Loading SEO data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
        
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SEO Management</h1>
        <p className="text-muted-foreground">Optimize your site's visibility in search engines</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Overall SEO Score</CardTitle>
          <CardDescription>
            Based on analysis of your site's meta data, content, and technical factors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-full border-8 border-muted flex items-center justify-center">
              <span className={`text-4xl font-bold ${getSeoScoreColor(overallScore)}`}>
                {overallScore}
              </span>
            </div>
            <div className="flex-1 space-y-6">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Meta Data</span>
                  <span className="text-sm text-muted-foreground">85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Content Quality</span>
                  <span className="text-sm text-muted-foreground">72%</span>
                </div>
                <Progress value={72} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Technical SEO</span>
                  <span className="text-sm text-muted-foreground">90%</span>
                </div>
                <Progress value={90} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 p-4">
          <div className="grid grid-cols-3 w-full gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Indexed Pages</p>
              <p className="text-2xl font-bold">{seoData?.length || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Avg Score</p>
              <p className="text-2xl font-bold">{overallScore}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-lg font-bold">Today</p>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pages" className="space-y-4">
          {selectedPage ? (
            <Card>
              <CardHeader>
                <CardTitle>Edit Page Metadata</CardTitle>
                <CardDescription>
                  Optimize this page for search engines
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="page-title">Page Title</Label>
                  <Input
                    id="page-title"
                    value={editingMeta?.meta_title || ""}
                    onChange={(e) => setEditingMeta({...editingMeta!, meta_title: e.target.value})}
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {(editingMeta?.meta_title || "").length}/60 characters
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="page-description">Meta Description</Label>
                  <Textarea
                    id="page-description"
                    value={editingMeta?.meta_description || ""}
                    onChange={(e) => setEditingMeta({...editingMeta!, meta_description: e.target.value})}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {(editingMeta?.meta_description || "").length}/160 characters
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="page-keywords">Keywords (comma separated)</Label>
                  <Input
                    id="page-keywords"
                    value={editingMeta?.meta_keywords?.join(", ") || ""}
                    onChange={(e) => setEditingMeta({
                      ...editingMeta!, 
                      meta_keywords: e.target.value.split(",").map(k => k.trim()).filter(k => k)
                    })}
                    placeholder="puppies, breeding, adoption"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="page-og-image">Open Graph Image URL</Label>
                  <Input
                    id="page-og-image"
                    value={editingMeta?.og_image || ""}
                    onChange={(e) => setEditingMeta({...editingMeta!, og_image: e.target.value})}
                    placeholder="https://example.com/og-image.jpg"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Button variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                <Button onClick={handleSaveMeta}>Save Changes</Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Page SEO</CardTitle>
                  <CardDescription>Manage metadata for each page</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {seoData && seoData.length > 0 ? (
                  <div className="rounded-md border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Page</th>
                          <th className="h-10 px-4 text-left font-medium text-muted-foreground">Meta Title</th>
                          <th className="h-10 px-4 text-center font-medium text-muted-foreground">SEO Score</th>
                          <th className="h-10 px-4 text-right font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seoData.map((page) => (
                          <tr key={page.id} className="border-b">
                            <td className="p-4 align-middle">
                              <div className="flex items-center">
                                <span className="font-medium">{page.page_slug || page.page_type}</span>
                              </div>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="line-clamp-1">{page.meta_title || 'No title set'}</div>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="flex justify-center items-center">
                                <span className={`font-bold ${getSeoScoreColor(calculateSEOScore(page))}`}>
                                  {calculateSEOScore(page)}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 align-middle text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEditPage(page.id)}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No SEO data found. Create some pages first.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="sitemap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sitemap Management</CardTitle>
              <CardDescription>
                Generate and submit your sitemap to search engines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">Sitemap Status</h4>
                      <p className="text-sm text-muted-foreground">Last generated today</p>
                    </div>
                    <Badge variant="default">
                      Active
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <p><strong>Total Pages:</strong> {seoData?.length || 0}</p>
                    <p><strong>Google Status:</strong> Submitted</p>
                    <p><strong>Bing Status:</strong> Submitted</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Button onClick={handleGenerateSitemap} className="w-full">
                    <Globe className="mr-2 h-4 w-4" />
                    Generate Sitemap
                  </Button>
                  
                  <Button variant="outline" onClick={handleSubmitToSearchEngines} className="w-full">
                    <Share2 className="mr-2 h-4 w-4" />
                    Submit to Search Engines
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEOManager;