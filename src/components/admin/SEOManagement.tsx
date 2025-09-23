import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash, Globe, BarChart, Search, FileText } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * @interface SEOMetadata
 * @description Defines the structure for an SEO metadata record.
 */
interface SEOMetadata {
  id: string;
  page_type: string;
  page_slug?: string;
  page_id?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  twitter_card?: string;
  canonical_url?: string;
  robots?: string;
  schema_markup?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * @component SEOManagement
 * @description A comprehensive component for managing SEO metadata across the website.
 * It provides analytics, a filterable list of SEO records, and modals for creating, editing, and deleting them.
 * @returns {React.ReactElement} The rendered SEO management interface.
 */
const SEOManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pages");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSEO, setSelectedSEO] = useState<SEOMetadata | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [seoToDeleteId, setSEOToDeleteId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: seoData, isLoading } = useQuery({
    queryKey: ['seo-metadata', activeTab],
    queryFn: () => adminApi.getSeoMeta(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: seoAnalytics } = useQuery({
    queryKey: ['seo-analytics'],
    queryFn: () => adminApi.getSeoAnalytics(),
    staleTime: 10 * 60 * 1000,
  });

  const seoRecords = seoData?.metadata || [];
  const analytics = seoAnalytics?.analytics || {
    total_pages: 0,
    optimized_pages: 0,
    missing_meta: 0,
    avg_title_length: 0
  };

  const createSEOMutation = useMutation({
    mutationFn: (seoData: Record<string, unknown>) => adminApi.createSeoMeta(seoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-metadata'] });
      queryClient.invalidateQueries({ queryKey: ['seo-analytics'] });
      toast.success('SEO metadata created successfully!');
      setIsModalOpen(false);
      setSelectedSEO(null);
    },
    onError: (err: Error) => {
      toast.error(`Failed to create SEO metadata: ${err.message}`);
    }
  });

  const updateSEOMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateSeoMeta(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-metadata'] });
      queryClient.invalidateQueries({ queryKey: ['seo-analytics'] });
      toast.success('SEO metadata updated successfully!');
      setIsModalOpen(false);
      setSelectedSEO(null);
    },
    onError: (err: Error) => {
      toast.error(`Failed to update SEO metadata: ${err.message}`);
    }
  });

  const deleteSEOMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteSeoMeta(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seo-metadata'] });
      queryClient.invalidateQueries({ queryKey: ['seo-analytics'] });
      toast.success('SEO metadata deleted successfully!');
      setSEOToDeleteId(null);
      setShowDeleteDialog(false);
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete SEO metadata: ${err.message}`);
      setSEOToDeleteId(null);
      setShowDeleteDialog(false);
    }
  });

  const filteredSEORecords = seoRecords.filter(seo =>
    (seo.meta_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     seo.page_slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     seo.page_type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  /**
   * Returns a styled Badge component based on the page type.
   * @param {string} pageType - The type of the page.
   * @returns {React.ReactElement} A styled Badge component.
   */
  const getPageTypeBadge = (pageType: string) => {
    const colors = {
      page: 'bg-blue-100 text-blue-800',
      puppy: 'bg-green-100 text-green-800',
      litter: 'bg-purple-100 text-purple-800',
      blog: 'bg-orange-100 text-orange-800'
    };
    return (
      <Badge className={colors[pageType as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {pageType.charAt(0).toUpperCase() + pageType.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{analytics.total_pages || 0}</div>
            <p className="text-sm text-muted-foreground">Total Pages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{analytics.optimized_pages || 0}</div>
            <p className="text-sm text-muted-foreground">Optimized Pages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{analytics.missing_meta || 0}</div>
            <p className="text-sm text-muted-foreground">Missing Meta</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{analytics.avg_title_length || 0}</div>
            <p className="text-sm text-muted-foreground">Avg Title Length</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold">SEO Management</h2>
        
        <div className="flex flex-col md:flex-row gap-3">
          <Input
            type="text"
            placeholder="Search SEO records..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64"
          />
          
          <Button
            onClick={() => {
              setSelectedSEO(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add SEO Metadata
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Pages</TabsTrigger>
          <TabsTrigger value="page">Static Pages</TabsTrigger>
          <TabsTrigger value="puppy">Puppy Pages</TabsTrigger>
          <TabsTrigger value="litter">Litter Pages</TabsTrigger>
          <TabsTrigger value="blog">Blog Posts</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Meta Title</TableHead>
                    <TableHead>Meta Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSEORecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No SEO metadata found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSEORecords.map((seo) => (
                      <TableRow key={seo.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{seo.page_slug || seo.page_id || 'N/A'}</div>
                            {seo.canonical_url && (
                              <div className="text-sm text-muted-foreground">
                                {seo.canonical_url}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getPageTypeBadge(seo.page_type)}</TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate">{seo.meta_title || 'No title'}</p>
                          <div className="text-xs text-muted-foreground">
                            {seo.meta_title?.length || 0} chars
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate">{seo.meta_description || 'No description'}</p>
                          <div className="text-xs text-muted-foreground">
                            {seo.meta_description?.length || 0} chars
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {seo.meta_title && seo.meta_description ? (
                              <Badge className="bg-green-100 text-green-800">Optimized</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">Incomplete</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedSEO(seo);
                                setIsModalOpen(true);
                              }}
                              className="h-8 w-8 p-0"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSEOToDeleteId(seo.id);
                                setShowDeleteDialog(true);
                              }}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the SEO metadata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (seoToDeleteId) {
                  deleteSEOMutation.mutate(seoToDeleteId);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* SEO Form Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSEO ? 'Edit SEO Metadata' : 'Add SEO Metadata'}
            </DialogTitle>
            <DialogDescription>
              Configure SEO metadata for better search engine visibility
            </DialogDescription>
          </DialogHeader>
          <SEOForm
            seo={selectedSEO}
            onClose={() => setIsModalOpen(false)}
            onSubmit={(formData, id) => {
              if (id) {
                updateSEOMutation.mutate({ id, data: formData });
              } else {
                createSEOMutation.mutate(formData);
              }
            }}
            isLoading={createSEOMutation.isPending || updateSEOMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

/**
 * @interface SEOFormProps
 * @description Defines the props for the SEOForm component.
 */
interface SEOFormProps {
  /** The existing SEO metadata for editing, or null for creating new metadata. */
  seo?: SEOMetadata | null;
  /** Callback function to close the form modal. */
  onClose: () => void;
  /** Callback function to handle the form submission. */
  onSubmit: (formData: any, id?: string) => void;
  /** A boolean indicating if the form submission is in progress. */
  isLoading: boolean;
}

/**
 * @component SEOForm
 * @description A form for creating and editing SEO metadata for a specific page or entity.
 * @param {SEOFormProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered SEO metadata form.
 */
const SEOForm: React.FC<SEOFormProps> = ({ seo, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    page_type: seo?.page_type || 'page',
    page_slug: seo?.page_slug || '',
    page_id: seo?.page_id || '',
    meta_title: seo?.meta_title || '',
    meta_description: seo?.meta_description || '',
    meta_keywords: seo?.meta_keywords?.join(', ') || '',
    og_title: seo?.og_title || '',
    og_description: seo?.og_description || '',
    og_image: seo?.og_image || '',
    og_type: seo?.og_type || 'website',
    twitter_title: seo?.twitter_title || '',
    twitter_description: seo?.twitter_description || '',
    twitter_image: seo?.twitter_image || '',
    twitter_card: seo?.twitter_card || 'summary_large_image',
    canonical_url: seo?.canonical_url || '',
    robots: seo?.robots || 'index,follow',
  });

  /**
   * Handles changes in form input and textarea fields.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handles changes in select fields.
   * @param {string} name - The name of the field to update.
   * @param {string} value - The new value from the select component.
   */
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Handles the form submission.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      meta_keywords: formData.meta_keywords ? formData.meta_keywords.split(',').map(k => k.trim()) : [],
    };
    onSubmit(submitData, seo?.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="page_type">Page Type</Label>
          <Select value={formData.page_type} onValueChange={(value) => handleSelectChange('page_type', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select page type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="page">Static Page</SelectItem>
              <SelectItem value="puppy">Puppy Page</SelectItem>
              <SelectItem value="litter">Litter Page</SelectItem>
              <SelectItem value="blog">Blog Post</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="page_slug">Page Slug</Label>
          <Input
            type="text"
            id="page_slug"
            name="page_slug"
            value={formData.page_slug}
            onChange={handleChange}
            placeholder="e.g., about-us, contact"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="meta_title">Meta Title</Label>
        <Input
          type="text"
          id="meta_title"
          name="meta_title"
          value={formData.meta_title}
          onChange={handleChange}
          placeholder="Optimized page title (50-60 characters)"
          maxLength={60}
        />
        <div className="text-xs text-muted-foreground mt-1">
          {formData.meta_title.length}/60 characters
        </div>
      </div>

      <div>
        <Label htmlFor="meta_description">Meta Description</Label>
        <Textarea
          id="meta_description"
          name="meta_description"
          value={formData.meta_description}
          onChange={handleChange}
          placeholder="Page description for search results (150-160 characters)"
          maxLength={160}
        />
        <div className="text-xs text-muted-foreground mt-1">
          {formData.meta_description.length}/160 characters
        </div>
      </div>

      <div>
        <Label htmlFor="meta_keywords">Meta Keywords</Label>
        <Input
          type="text"
          id="meta_keywords"
          name="meta_keywords"
          value={formData.meta_keywords}
          onChange={handleChange}
          placeholder="keyword1, keyword2, keyword3"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="canonical_url">Canonical URL</Label>
          <Input
            type="url"
            id="canonical_url"
            name="canonical_url"
            value={formData.canonical_url}
            onChange={handleChange}
            placeholder="https://example.com/page"
          />
        </div>
        <div>
          <Label htmlFor="robots">Robots</Label>
          <Select value={formData.robots} onValueChange={(value) => handleSelectChange('robots', value)}>
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

      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : seo ? 'Update SEO' : 'Create SEO'}
        </Button>
      </div>
    </form>
  );
};

export default SEOManagement;