import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api'; // Assuming adminApi is in @/api/index.ts or @/api/client.ts
import TestimonialForm from './TestimonialForm';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, MessageSquare, Loader2, AlertTriangle } from 'lucide-react';
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

// Assuming Testimonial types are accessible, e.g., imported from where they are defined in client.ts or a global types file.
// For this subtask, we'll define them locally if not easily importable.
interface Testimonial {
  id: string;
  name: string;
  location?: string;
  testimonial_text: string;
  rating: number;
  puppy_name?: string;
  image_url?: string;
  created_at: string;
}
type TestimonialCreationData = Omit<Testimonial, 'id' | 'created_at'>;
type TestimonialUpdateData = Partial<TestimonialCreationData>;


const TestimonialManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [testimonialToDeleteId, setTestimonialToDeleteId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch testimonials
  const { data: testimonialsData, isLoading: isLoadingTestimonials, error: testimonialsError } = useQuery({
    queryKey: ['adminTestimonials'],
    queryFn: async () => {
      const response = await adminApi.getAllTestimonials();
      // Handle potential nesting if API returns { data: [], pagination: {} }
      return Array.isArray(response) ? response : response.data || [];
    }
  });
  const testimonials: Testimonial[] = testimonialsData || [];


  // Create mutation
  const createTestimonialMutation = useMutation({
    mutationFn: (newData: TestimonialCreationData) => adminApi.createTestimonial(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
      queryClient.invalidateQueries({ queryKey: ['publicTestimonials'] }); // Invalidate public ones too
      toast.success('Testimonial created successfully!');
      setShowForm(false);
      setEditingTestimonial(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create testimonial: ${error.message}`);
    },
  });

  // Update mutation
  const updateTestimonialMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TestimonialUpdateData }) => adminApi.updateTestimonial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
      queryClient.invalidateQueries({ queryKey: ['publicTestimonials'] });
      toast.success('Testimonial updated successfully!');
      setShowForm(false);
      setEditingTestimonial(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update testimonial: ${error.message}`);
    },
  });

  // Delete mutation
  const deleteTestimonialMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteTestimonial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTestimonials'] });
      queryClient.invalidateQueries({ queryKey: ['publicTestimonials'] });
      toast.success('Testimonial deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete testimonial: ${error.message}`);
    },
  });

  const handleSaveTestimonial = (data: TestimonialCreationData | TestimonialUpdateData) => {
    if (editingTestimonial?.id) {
      updateTestimonialMutation.mutate({ id: editingTestimonial.id, data });
    } else {
      createTestimonialMutation.mutate(data as TestimonialCreationData);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setTestimonialToDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteTestimonial = () => {
    if (testimonialToDeleteId) {
      deleteTestimonialMutation.mutate(testimonialToDeleteId);
      // onSuccess of mutation already handles toast and query invalidation.
    }
    setShowDeleteDialog(false); // Ensure dialog closes
    // setTestimonialToDeleteId(null); // Handled by onOpenChange
  };

  const handleAddNew = () => {
    setEditingTestimonial(null);
    setShowForm(true);
  };

  if (showForm) {
    return (
      <TestimonialForm
        testimonial={editingTestimonial || undefined}
        onSave={handleSaveTestimonial}
        onCancel={() => {
          setShowForm(false);
          setEditingTestimonial(null);
        }}
        isLoading={createTestimonialMutation.isPending || updateTestimonialMutation.isPending}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center">
          <MessageSquare className="mr-2 h-6 w-6 text-brand-red" /> Testimonial Management
        </h2>
        <Button onClick={handleAddNew} className="bg-brand-red hover:bg-red-700 text-white">
          <Plus className="mr-2 h-4 w-4" /> Add New Testimonial
        </Button>
      </div>

      {isLoadingTestimonials && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
          <p className="ml-2">Loading testimonials...</p>
        </div>
      )}

      {testimonialsError && (
        <div className="text-center py-8 text-red-600 bg-red-50 p-4 rounded-md">
          <AlertTriangle className="mx-auto h-8 w-8 mb-2" />
          <p>Error loading testimonials: {testimonialsError.message}</p>
        </div>
      )}

      {!isLoadingTestimonials && !testimonialsError && (
        <Card>
          <CardHeader>
            <CardTitle>Existing Testimonials</CardTitle>
          </CardHeader>
          <CardContent>
            {testimonials.length === 0 ? (
              <p className="text-center text-gray-500 py-4">No testimonials found. Add your first one!</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Puppy Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testimonials.map((testimonial) => (
                    <TableRow key={testimonial.id}>
                      <TableCell>{testimonial.name}</TableCell>
                      <TableCell>{testimonial.rating} / 5</TableCell>
                      <TableCell>{testimonial.puppy_name || '-'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(testimonial)}
                                disabled={deleteTestimonialMutation.isPending && deleteTestimonialMutation.variables === testimonial.id}>
                          <Edit className="mr-1 h-4 w-4" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(testimonial.id)}
                          disabled={deleteTestimonialMutation.isPending && deleteTestimonialMutation.variables === testimonial.id}
                        >
                          {deleteTestimonialMutation.isPending && deleteTestimonialMutation.variables === testimonial.id ? (
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-1 h-4 w-4" />
                          )}
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={(isOpen) => { setShowDeleteDialog(isOpen); if (!isOpen) setTestimonialToDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the testimonial. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTestimonial}
              disabled={deleteTestimonialMutation.isPending && deleteTestimonialMutation.variables === testimonialToDeleteId}
            >
              {deleteTestimonialMutation.isPending && deleteTestimonialMutation.variables === testimonialToDeleteId ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TestimonialManagement;
