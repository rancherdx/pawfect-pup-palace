import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

const SCHEMA_TEMPLATES = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GDS Puppies",
    url: "https://yourdomain.com",
    logo: "https://yourdomain.com/logo.png",
    description: "Premium puppy breeder",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Detroit",
      addressRegion: "MI",
      addressCountry: "US",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-xxx-xxx-xxxx",
      contactType: "customer service",
    },
  },
  product: {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "Puppy Name",
    image: "https://yourdomain.com/puppy-image.jpg",
    description: "Adorable puppy description",
    brand: {
      "@type": "Organization",
      name: "GDS Puppies",
    },
    offers: {
      "@type": "Offer",
      price: "2000",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  },
  breadcrumb: {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://yourdomain.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Puppies",
        item: "https://yourdomain.com/puppies",
      },
    ],
  },
};

export const SchemaMarkupGenerator = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof SCHEMA_TEMPLATES>("organization");
  const [copied, setCopied] = useState(false);

  const schemaJson = JSON.stringify(SCHEMA_TEMPLATES[selectedTemplate], null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(schemaJson);
    setCopied(true);
    toast.success("Schema markup copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schema Markup Generator</CardTitle>
          <CardDescription>
            Generate structured data for better search engine understanding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Template</label>
            <Select value={selectedTemplate} onValueChange={(value: any) => setSelectedTemplate(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="organization">Organization</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="breadcrumb">Breadcrumb</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Generated Schema</label>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={schemaJson}
              readOnly
              rows={20}
              className="font-mono text-xs"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Implementation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>To add this schema markup to your page:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Copy the JSON-LD schema above</li>
            <li>Customize the values for your specific page/content</li>
            <li>
              Add it to your page's <code>&lt;head&gt;</code> section wrapped in a{" "}
              <code>&lt;script type="application/ld+json"&gt;</code> tag
            </li>
            <li>Test with Google's Rich Results Test tool</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};
