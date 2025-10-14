import { useState } from "react";
import { useSEOMeta, useUpdateSEOMeta, useCreateSEOMeta } from "@/hooks/useSEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const PAGE_TYPES = [
  { value: "home", label: "Home Page" },
  { value: "puppies", label: "Puppies Listing" },
  { value: "puppy", label: "Puppy Detail" },
  { value: "litters", label: "Litters Listing" },
  { value: "litter", label: "Litter Detail" },
  { value: "about", label: "About Page" },
  { value: "contact", label: "Contact Page" },
  { value: "blog", label: "Blog Listing" },
  { value: "blog_post", label: "Blog Post" },
];

export const SEOMetaEditor = () => {
  const [selectedPageType, setSelectedPageType] = useState("home");
  const { data: seoMeta, isLoading } = useSEOMeta(selectedPageType);
  const updateMutation = useUpdateSEOMeta();
  const createMutation = useCreateSEOMeta();

  const currentMeta = seoMeta?.[0];

  const [formData, setFormData] = useState({
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    og_title: "",
    og_description: "",
    og_image: "",
    og_type: "website",
    twitter_card: "summary_large_image",
    twitter_title: "",
    twitter_description: "",
    twitter_image: "",
    canonical_url: "",
    robots: "index,follow",
  });

  useState(() => {
    if (currentMeta) {
      setFormData({
        meta_title: currentMeta.meta_title || "",
        meta_description: currentMeta.meta_description || "",
        meta_keywords: currentMeta.meta_keywords?.join(", ") || "",
        og_title: currentMeta.og_title || "",
        og_description: currentMeta.og_description || "",
        og_image: currentMeta.og_image || "",
        og_type: currentMeta.og_type || "website",
        twitter_card: currentMeta.twitter_card || "summary_large_image",
        twitter_title: currentMeta.twitter_title || "",
        twitter_description: currentMeta.twitter_description || "",
        twitter_image: currentMeta.twitter_image || "",
        canonical_url: currentMeta.canonical_url || "",
        robots: currentMeta.robots || "index,follow",
      });
    }
  });

  const handleSave = () => {
    const keywords = formData.meta_keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const updates = {
      page_type: selectedPageType,
      meta_title: formData.meta_title || null,
      meta_description: formData.meta_description || null,
      meta_keywords: keywords.length > 0 ? keywords : null,
      og_title: formData.og_title || null,
      og_description: formData.og_description || null,
      og_image: formData.og_image || null,
      og_type: formData.og_type,
      twitter_card: formData.twitter_card,
      twitter_title: formData.twitter_title || null,
      twitter_description: formData.twitter_description || null,
      twitter_image: formData.twitter_image || null,
      canonical_url: formData.canonical_url || null,
      robots: formData.robots,
    };

    if (currentMeta) {
      updateMutation.mutate({ id: currentMeta.id, ...updates });
    } else {
      createMutation.mutate(updates as any);
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
          <CardTitle>Page Selection</CardTitle>
          <CardDescription>Choose a page to configure SEO metadata</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedPageType} onValueChange={setSelectedPageType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Basic Meta Tags</CardTitle>
          <CardDescription>Essential SEO metadata</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Meta Title</Label>
            <Input
              value={formData.meta_title}
              onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
              placeholder="Keep under 60 characters"
              maxLength={60}
            />
            <p className="text-xs text-muted-foreground">
              {formData.meta_title.length}/60 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label>Meta Description</Label>
            <Textarea
              value={formData.meta_description}
              onChange={(e) =>
                setFormData({ ...formData, meta_description: e.target.value })
              }
              placeholder="Keep under 160 characters"
              maxLength={160}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {formData.meta_description.length}/160 characters
            </p>
          </div>

          <div className="space-y-2">
            <Label>Meta Keywords</Label>
            <Input
              value={formData.meta_keywords}
              onChange={(e) =>
                setFormData({ ...formData, meta_keywords: e.target.value })
              }
              placeholder="keyword1, keyword2, keyword3"
            />
            <p className="text-xs text-muted-foreground">Separate with commas</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Canonical URL</Label>
              <Input
                value={formData.canonical_url}
                onChange={(e) =>
                  setFormData({ ...formData, canonical_url: e.target.value })
                }
                placeholder="https://yourdomain.com/page"
              />
            </div>

            <div className="space-y-2">
              <Label>Robots</Label>
              <Select
                value={formData.robots}
                onValueChange={(value) => setFormData({ ...formData, robots: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="index,follow">Index, Follow</SelectItem>
                  <SelectItem value="noindex,follow">No Index, Follow</SelectItem>
                  <SelectItem value="index,nofollow">Index, No Follow</SelectItem>
                  <SelectItem value="noindex,nofollow">No Index, No Follow</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Open Graph (Facebook/LinkedIn)</CardTitle>
          <CardDescription>Social media sharing metadata</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>OG Title</Label>
            <Input
              value={formData.og_title}
              onChange={(e) => setFormData({ ...formData, og_title: e.target.value })}
              placeholder="Title for social media"
            />
          </div>

          <div className="space-y-2">
            <Label>OG Description</Label>
            <Textarea
              value={formData.og_description}
              onChange={(e) =>
                setFormData({ ...formData, og_description: e.target.value })
              }
              placeholder="Description for social media"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>OG Image URL</Label>
              <Input
                value={formData.og_image}
                onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label>OG Type</Label>
              <Select
                value={formData.og_type}
                onValueChange={(value) => setFormData({ ...formData, og_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Twitter Card</CardTitle>
          <CardDescription>Twitter sharing metadata</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Twitter Card Type</Label>
            <Select
              value={formData.twitter_card}
              onValueChange={(value) =>
                setFormData({ ...formData, twitter_card: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary</SelectItem>
                <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Twitter Title</Label>
            <Input
              value={formData.twitter_title}
              onChange={(e) =>
                setFormData({ ...formData, twitter_title: e.target.value })
              }
              placeholder="Title for Twitter"
            />
          </div>

          <div className="space-y-2">
            <Label>Twitter Description</Label>
            <Textarea
              value={formData.twitter_description}
              onChange={(e) =>
                setFormData({ ...formData, twitter_description: e.target.value })
              }
              placeholder="Description for Twitter"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Twitter Image URL</Label>
            <Input
              value={formData.twitter_image}
              onChange={(e) =>
                setFormData({ ...formData, twitter_image: e.target.value })
              }
              placeholder="https://..."
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending || createMutation.isPending}
          size="lg"
        >
          {(updateMutation.isPending || createMutation.isPending) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save SEO Metadata
        </Button>
      </div>
    </div>
  );
};
