
import { useState } from "react";
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
import { Search, Globe, FileText, Share2, ArrowUpRight } from "lucide-react";

// Mock SEO analysis data
const mockSeoScore = 78;
const mockKeywords = [
  { keyword: "labrador retriever puppies", volume: 14800, difficulty: "High", ranking: 6 },
  { keyword: "golden retriever puppies", volume: 12100, difficulty: "High", ranking: 12 },
  { keyword: "quality puppy breeders", volume: 2900, difficulty: "Medium", ranking: 3 },
  { keyword: "puppy adoption near me", volume: 8700, difficulty: "High", ranking: 18 },
  { keyword: "responsible dog breeders", volume: 1400, difficulty: "Low", ranking: 2 }
];

// Mock meta data for pages
const mockPageMeta = [
  {
    id: "page-1",
    path: "/",
    title: "GDS Puppies | Premium Puppy Breeder",
    description: "Quality puppies from responsible breeders. Find your perfect companion with health guarantees and lifetime support.",
    keywords: "puppies, dog breeder, responsible breeding",
    ogImage: "https://example.com/og-home.jpg",
    score: 82
  },
  {
    id: "page-2",
    path: "/litters",
    title: "Available Litters | GDS Puppies",
    description: "View our current and upcoming litters of premium puppies. Reserve your new family member today.",
    keywords: "puppy litters, available puppies, reserve puppy",
    ogImage: "https://example.com/og-litters.jpg",
    score: 76
  },
  {
    id: "page-3",
    path: "/about",
    title: "About Our Breeding Program | GDS Puppies",
    description: "Learn about our ethical breeding practices, facilities, and our commitment to puppy health and wellbeing.",
    keywords: "ethical breeding, quality puppies, breeding program",
    ogImage: "https://example.com/og-about.jpg",
    score: 63
  }
];

// Mock sitemap data
const mockSitemapStatus = {
  lastGenerated: "2025-02-15",
  pageCount: 28,
  indexed: true,
  googleStatus: "Submitted",
  bingStatus: "Submitted"
};

const SEOManager = () => {
  const [selectedTab, setSelectedTab] = useState("pages");
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [pageMeta, setPageMeta] = useState(mockPageMeta);
  const [editingMeta, setEditingMeta] = useState<any>(null);
  
  const handleEditPage = (pageId: string) => {
    const page = pageMeta.find(p => p.id === pageId);
    if (page) {
      setEditingMeta({ ...page });
      setSelectedPage(pageId);
    }
  };
  
  const handleSaveMeta = () => {
    if (!editingMeta) return;
    
    setPageMeta(pageMeta.map(p => 
      p.id === editingMeta.id ? { ...editingMeta } : p
    ));
    
    setSelectedPage(null);
    setEditingMeta(null);
    
    toast.success("Page metadata updated", {
      description: "The changes will be reflected on your site soon."
    });
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

  const getSeoScoreProgressColor = (score: number) => {
    if (score >= 80) return "bg-green-600";
    if (score >= 60) return "bg-yellow-600";
    return "bg-red-600";
  };

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
              <span className={`text-4xl font-bold ${getSeoScoreColor(mockSeoScore)}`}>
                {mockSeoScore}
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
              <p className="text-2xl font-bold">{mockSitemapStatus.pageCount}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Top 10 Keywords</p>
              <p className="text-2xl font-bold">3</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="text-lg font-bold">{mockSitemapStatus.lastGenerated}</p>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="pages">Pages</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
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
                    value={editingMeta?.title || ""}
                    onChange={(e) => setEditingMeta({...editingMeta, title: e.target.value})}
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {editingMeta?.title?.length || 0}/60 characters
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="page-description">Meta Description</Label>
                  <Textarea
                    id="page-description"
                    value={editingMeta?.description || ""}
                    onChange={(e) => setEditingMeta({...editingMeta, description: e.target.value})}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {editingMeta?.description?.length || 0}/160 characters
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="page-keywords">Keywords (comma separated)</Label>
                  <Input
                    id="page-keywords"
                    value={editingMeta?.keywords || ""}
                    onChange={(e) => setEditingMeta({...editingMeta, keywords: e.target.value})}
                    placeholder="puppies, breeding, adoption"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="page-og-image">Open Graph Image URL</Label>
                  <Input
                    id="page-og-image"
                    value={editingMeta?.ogImage || ""}
                    onChange={(e) => setEditingMeta({...editingMeta, ogImage: e.target.value})}
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
                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter pages" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Page Filters</SelectLabel>
                      <SelectItem value="all">All Pages</SelectItem>
                      <SelectItem value="poor">Poor Score (< 60)</SelectItem>
                      <SelectItem value="good">Good Score (> 80)</SelectItem>
                      <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
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
                      {pageMeta.map((page) => (
                        <tr key={page.id} className="border-b">
                          <td className="p-4 align-middle">
                            <div className="flex items-center">
                              <span className="font-medium">{page.path}</span>
                            </div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="line-clamp-1">{page.title}</div>
                          </td>
                          <td className="p-4 align-middle">
                            <div className="flex justify-center items-center">
                              <span className={`font-bold ${getSeoScoreColor(page.score)}`}>
                                {page.score}
                              </span>
                              <div className="w-16 h-2 ml-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${getSeoScoreProgressColor(page.score)}`}
                                  style={{ width: `${page.score}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-4 align-middle text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8"
                                asChild
                              >
                                <a href={page.path} target="_blank" rel="noreferrer">
                                  <ArrowUpRight className="h-4 w-4" />
                                </a>
                              </Button>
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
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Rankings</CardTitle>
              <CardDescription>
                Track your position in search results for target keywords
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Keyword</th>
                      <th className="h-10 px-4 text-center font-medium text-muted-foreground">Search Volume</th>
                      <th className="h-10 px-4 text-center font-medium text-muted-foreground">Difficulty</th>
                      <th className="h-10 px-4 text-center font-medium text-muted-foreground">Ranking</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockKeywords.map((keyword, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-4 align-middle">
                          <div className="flex items-center">
                            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{keyword.keyword}</span>
                          </div>
                        </td>
                        <td className="p-4 align-middle text-center">
                          {keyword.volume.toLocaleString()}
                        </td>
                        <td className="p-4 align-middle text-center">
                          <Badge variant={
                            keyword.difficulty === "Low" ? "outline" : 
                            keyword.difficulty === "Medium" ? "secondary" : 
                            "default"
                          }>
                            {keyword.difficulty}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle text-center">
                          <div className={`font-bold ${
                            keyword.ranking <= 3 ? "text-green-600" : 
                            keyword.ranking <= 10 ? "text-blue-600" : 
                            "text-muted-foreground"
                          }`}>
                            {keyword.ranking <= 100 ? `#${keyword.ranking}` : "100+"}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 p-4">
              <div className="flex justify-between w-full items-center">
                <p className="text-sm text-muted-foreground">
                  Rankings last updated: February 15, 2025
                </p>
                <Button>
                  <Search className="mr-2 h-4 w-4" />
                  Add Keyword
                </Button>
              </div>
            </CardFooter>
          </Card>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 text-center">
                  <Globe className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-medium">Sitemap Status</h3>
                  <Badge variant={mockSitemapStatus.indexed ? "default" : "outline"} className="mt-2">
                    {mockSitemapStatus.indexed ? "Indexed" : "Not Indexed"}
                  </Badge>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <Share2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-medium">Search Engines</h3>
                  <div className="mt-2 text-sm space-y-1">
                    <p>Google: {mockSitemapStatus.googleStatus}</p>
                    <p>Bing: {mockSitemapStatus.bingStatus}</p>
                  </div>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-medium">Page Count</h3>
                  <p className="text-2xl font-bold mt-2">{mockSitemapStatus.pageCount}</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Sitemap Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">URL:</span>
                    <span className="font-mono">https://gdspuppies.com/sitemap.xml</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Generated:</span>
                    <span>{mockSitemapStatus.lastGenerated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Auto-update:</span>
                    <Switch checked={true} />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 p-4 justify-between">
              <Button variant="outline" onClick={handleGenerateSitemap}>
                Generate New Sitemap
              </Button>
              <Button onClick={handleSubmitToSearchEngines}>
                Submit to Search Engines
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SEOManager;
