import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash, Star, Eye, EyeOff, MessageSquare, RefreshCw, Download } from "lucide-react";
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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
 * @interface EnhancedTestimonial
 * @description Defines the comprehensive structure of a testimonial object, including metadata from various sources.
 */
interface EnhancedTestimonial {
  id: string;
  name: string;
  title?: string;
  content: string;
  testimonial_text: string;
  location?: string;
  rating: number;
  puppy_name?: string;
  image?: string;
  reviewer_avatar?: string;
  source: 'local' | 'google' | 'facebook';
  google_review_id?: string;
  review_date: string;
  is_featured: boolean;
  admin_approved: boolean;
  response_text?: string;
  response_date?: string;
  created_at: string;
  updated_at: string;
}

/**
 * @component EnhancedTestimonialManagement
 * @description A feature-rich component for managing customer testimonials from various sources.
 * It includes functionalities for viewing, approving, featuring, responding to, and deleting testimonials,
 * as well as syncing reviews from external platforms like Google.
 * @returns {React.ReactElement} The rendered testimonial management interface.
 */
const EnhancedTestimonialManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<EnhancedTestimonial | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [testimonialToDeleteId, setTestimonialToDeleteId] = useState<string | null>(null);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [responseText, setResponseText] = useState("");

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['enhanced-testimonials', activeTab],
    queryFn: () => adminApi.getEnhancedTestimonials({ 
      source: activeTab === 'all' ? undefined : activeTab,
      approved: activeTab === 'pending' ? 'false' : undefined 
    }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: analytics } = useQuery({
    queryKey: ['testimonial-analytics'],
    queryFn: () => adminApi.getTestimonialAnalytics(),
    staleTime: 10 * 60 * 1000,
  });

  const testimonials: EnhancedTestimonial[] = data?.testimonials || [];
  const stats = analytics || {
    total: 0,
    average_rating: 0,
    google_count: 0,
    pending_approval: 0
  };

  const createTestimonialMutation = useMutation({
    mutationFn: (testimonialData: Record<string, unknown>) => adminApi.createEnhancedTestimonial(testimonialData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonial-analytics'] });
      toast.success('Testimonial created successfully!');
      setIsModalOpen(false);
      setSelectedTestimonial(null);
    },
    onError: (err: Error) => {
      toast.error(`Failed to create testimonial: ${err.message}`);
    }
  });

  const updateTestimonialMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateEnhancedTestimonial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonial-analytics'] });
      toast.success('Testimonial updated successfully!');
      setIsModalOpen(false);
      setSelectedTestimonial(null);
      setResponseModalOpen(false);
    },
    onError: (err: Error) => {
      toast.error(`Failed to update testimonial: ${err.message}`);
    }
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteTestimonial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonial-analytics'] });
      toast.success('Testimonial deleted successfully!');
      setTestimonialToDeleteId(null);
      setShowDeleteDialog(false);
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete testimonial: ${err.message}`);
      setTestimonialToDeleteId(null);
      setShowDeleteDialog(false);
    }
  });

  const syncGoogleReviewsMutation = useMutation({
    mutationFn: () => adminApi.syncGoogleReviews(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['testimonial-analytics'] });
      toast.success(`Synced ${data.count || 0} Google reviews successfully!`);
    },
    onError: (err: Error) => {
      toast.error(`Failed to sync Google reviews: ${err.message}`);
    }
  });

  /**
   * Toggles the approval status of a testimonial.
   * @param {EnhancedTestimonial} testimonial - The testimonial to update.
   */
  const handleToggleApproval = async (testimonial: EnhancedTestimonial) => {
    updateTestimonialMutation.mutate({
      id: testimonial.id,
      data: { admin_approved: !testimonial.admin_approved }
    });
  };

  /**
   * Toggles the featured status of a testimonial.
   * @param {EnhancedTestimonial} testimonial - The testimonial to update.
   */
  const handleToggleFeatured = async (testimonial: EnhancedTestimonial) => {
    updateTestimonialMutation.mutate({
      id: testimonial.id,
      data: { is_featured: !testimonial.is_featured }
    });
  };

  /**
   * Opens the response modal for a specific testimonial.
   * @param {EnhancedTestimonial} testimonial - The testimonial to respond to.
   */
  const handleAddResponse = (testimonial: EnhancedTestimonial) => {
    setSelectedTestimonial(testimonial);
    setResponseText(testimonial.response_text || '');
    setResponseModalOpen(true);
  };

  /**
   * Saves the response text for a testimonial.
   */
  const handleSaveResponse = () => {
    if (selectedTestimonial) {
      updateTestimonialMutation.mutate({
        id: selectedTestimonial.id,
        data: { response_text: responseText }
      });
    }
  };

  const filteredTestimonials = testimonials.filter(testimonial =>
    testimonial.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    testimonial.testimonial_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (testimonial.puppy_name && testimonial.puppy_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  /**
   * Returns a Badge component styled based on the testimonial source.
   * @param {string} source - The source of the testimonial ('local', 'google', 'facebook').
   * @returns {React.ReactElement} A styled Badge component.
   */
  const getSourceBadge = (source: string) => {
    const colors = {
      local: 'bg-blue-100 text-blue-800',
      google: 'bg-red-100 text-red-800',
      facebook: 'bg-blue-100 text-blue-800'
    };
    return (
      <Badge className={colors[source as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {source.charAt(0).toUpperCase() + source.slice(1)}
      </Badge>
    );
  };

  /**
   * Renders a star rating display based on a numeric rating.
   * @param {number} rating - The numeric rating (1-5).
   * @returns {React.ReactElement} A div containing star icons.
   */
  const renderRating = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.total || 0}</div>
            <p className="text-sm text-muted-foreground">Total Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.average_rating || 0}</div>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.google_count || 0}</div>
            <p className="text-sm text-muted-foreground">Google Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-2xl font-bold">{stats.pending_approval || 0}</div>
            <p className="text-sm text-muted-foreground">Pending Approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold">Testimonial Management</h2>
        
        <div className="flex flex-col md:flex-row gap-3">
          <Input
            type="text"
            placeholder="Search testimonials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64"
          />
          
          <Button
            onClick={() => syncGoogleReviewsMutation.mutate()}
            disabled={syncGoogleReviewsMutation.isPending}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${syncGoogleReviewsMutation.isPending ? 'animate-spin' : ''}`} />
            Sync Google Reviews
          </Button>
          
          <Button
            onClick={() => {
              setSelectedTestimonial(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Local Review
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Reviews</TabsTrigger>
          <TabsTrigger value="local">Local Reviews</TabsTrigger>
          <TabsTrigger value="google">Google Reviews</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTestimonials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No testimonials found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTestimonials.map((testimonial) => (
                      <TableRow key={testimonial.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {testimonial.reviewer_avatar && (
                              <img
                                src={testimonial.reviewer_avatar}
                                alt={testimonial.name}
                                className="w-8 h-8 rounded-full"
                              />
                            )}
                            <div>
                              <div className="font-medium">{testimonial.name}</div>
                              {testimonial.location && (
                                <div className="text-sm text-muted-foreground">
                                  {testimonial.location}
                                </div>
                              )}
                              {testimonial.puppy_name && (
                                <div className="text-sm text-muted-foreground">
                                  Puppy: {testimonial.puppy_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{renderRating(testimonial.rating)}</TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate">{testimonial.testimonial_text}</p>
                        </TableCell>
                        <TableCell>{getSourceBadge(testimonial.source)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              {testimonial.admin_approved ? (
                                <Badge className="bg-green-100 text-green-800">Approved</Badge>
                              ) : (
                                <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                              )}
                              {testimonial.is_featured && (
                                <Badge className="bg-purple-100 text-purple-800">Featured</Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleApproval(testimonial)}
                              className="h-8 w-8 p-0"
                              title={testimonial.admin_approved ? "Unapprove" : "Approve"}
                            >
                              {testimonial.admin_approved ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleFeatured(testimonial)}
                              className="h-8 w-8 p-0"
                              title={testimonial.is_featured ? "Unfeature" : "Feature"}
                            >
                              <Star className={`h-4 w-4 ${testimonial.is_featured ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAddResponse(testimonial)}
                              className="h-8 w-8 p-0"
                              title="Add Response"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            {testimonial.source === 'local' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedTestimonial(testimonial);
                                  setIsModalOpen(true);
                                }}
                                className="h-8 w-8 p-0"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setTestimonialToDeleteId(testimonial.id);
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
              This action cannot be undone. This will permanently delete the testimonial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (testimonialToDeleteId) {
                  deleteTestimonialMutation.mutate(testimonialToDeleteId);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Response Modal */}
      <Dialog open={responseModalOpen} onOpenChange={setResponseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Response to Review</DialogTitle>
            <DialogDescription>
              Respond to {selectedTestimonial?.name}'s review
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Original Review</Label>
              <p className="text-sm bg-muted p-3 rounded">
                {selectedTestimonial?.testimonial_text}
              </p>
            </div>
            <div>
              <Label htmlFor="response">Your Response</Label>
              <Textarea
                id="response"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Thank you for your review..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setResponseModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveResponse}>
                Save Response
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedTestimonialManagement;