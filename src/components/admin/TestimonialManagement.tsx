import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api';
import { toast } from 'sonner';
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
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Testimonial {
  id: string;
  name: string;
  title: string;
  content: string;
  image: string;
}

const TestimonialManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [testimonialToDeleteId, setTestimonialToDeleteId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['testimonials'],
    queryFn: () => adminApi.getTestimonials(),
    staleTime: 5 * 60 * 1000,
  });

  const testimonials: Testimonial[] = (data as any)?.testimonials || [];

  const createTestimonialMutation = useMutation({
    mutationFn: (testimonialData: Record<string, unknown>) => adminApi.createTestimonial(testimonialData),
    onSuccess: (response: Record<string, unknown>) => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast.success('Testimonial created successfully!');
      setIsModalOpen(false);
      setSelectedTestimonial(null);
      
      // Handle optional response data
      if (response?.data) {
        console.log('Testimonial created:', response.data);
      }
    },
    onError: (err: Error) => {
      toast.error(`Failed to create testimonial: ${err.message}`);
    }
  });

  const updateTestimonialMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateTestimonial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast.success('Testimonial updated successfully!');
      setIsModalOpen(false);
      setSelectedTestimonial(null);
    },
    onError: (err: Error) => {
      toast.error(`Failed to update testimonial: ${err.message}`);
    }
  });

  const deleteTestimonialMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteTestimonial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
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

  const handleDeleteTestimonial = (id: string) => {
    setTestimonialToDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteTestimonial = () => {
    if (testimonialToDeleteId) {
      deleteTestimonialMutation.mutate(testimonialToDeleteId);
    }
  };

  const handleEditTestimonial = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const handleAddTestimonial = () => {
    setSelectedTestimonial(null);
    setIsModalOpen(true);
  };

  const filteredTestimonials: Testimonial[] = testimonials.filter(testimonial =>
    testimonial.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    testimonial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    testimonial.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isMutationLoading = createTestimonialMutation.isPending || updateTestimonialMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold">
          Testimonial Management
        </h2>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search testimonials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>

          <Button
            onClick={handleAddTestimonial}
            className="bg-brand-red hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Testimonial
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <Table>
          <TableCaption>A list of your recent testimonials.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Content</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTestimonials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">No testimonials found.</TableCell>
              </TableRow>
            ) : (
              filteredTestimonials.map((testimonial) => (
                <TableRow key={testimonial.id}>
                  <TableCell className="font-medium">{testimonial.name}</TableCell>
                  <TableCell>{testimonial.title}</TableCell>
                  <TableCell>{testimonial.content}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTestimonial(testimonial)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTestimonial(testimonial.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
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
      </div>

      {testimonialToDeleteId && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the testimonial
                and remove its data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setShowDeleteDialog(false); setTestimonialToDeleteId(null); }}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteTestimonial} disabled={deleteTestimonialMutation.isPending}>
                {deleteTestimonialMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yes, delete testimonial
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
              </DialogTitle>
            </DialogHeader>
            <TestimonialForm
              testimonial={selectedTestimonial || undefined}
              onClose={() => {
                setIsModalOpen(false);
                setSelectedTestimonial(null);
              }}
              onSubmit={(formData, id) => {
                if (id) {
                  updateTestimonialMutation.mutate({ id, data: formData });
                } else {
                  createTestimonialMutation.mutate(formData);
                }
              }}
              isLoading={isMutationLoading}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

interface TestimonialFormProps {
  testimonial?: Testimonial;
  onClose: () => void;
  onSubmit: (formData: any, id?: string) => void;
  isLoading: boolean;
}

const TestimonialForm: React.FC<TestimonialFormProps> = ({ testimonial, onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    name: testimonial?.name || "",
    title: testimonial?.title || "",
    content: testimonial?.content || "",
    image: testimonial?.image || "",
  });

  useEffect(() => {
    if (testimonial) {
      setFormData({
        name: testimonial.name || "",
        title: testimonial.title || "",
        content: testimonial.content || "",
        image: testimonial.image || "",
      });
    } else {
      setFormData({
        name: "",
        title: "",
        content: "",
        image: "",
      });
    }
  }, [testimonial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, testimonial?.id);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label htmlFor="image">Image URL</Label>
        <Input
          type="text"
          id="image"
          name="image"
          value={formData.image}
          onChange={handleChange}
        />
      </div>
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-brand-red hover:bg-red-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </>
          ) : (
            testimonial ? "Update Testimonial" : "Create Testimonial"
          )}
        </Button>
      </div>
    </form>
  );
};

export default TestimonialManagement;
