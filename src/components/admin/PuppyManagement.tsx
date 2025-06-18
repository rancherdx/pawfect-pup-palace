import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash, Search, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api';
import { toast } from 'sonner';
import { Puppy } from "@/types";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import PuppyForm from "@/components/admin/PuppyForm";

const PuppyManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPuppy, setSelectedPuppy] = useState<Puppy | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [puppyToDeleteId, setPuppyToDeleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['puppies'],
    queryFn: () => adminApi.getAllPuppies(),
    staleTime: 5 * 60 * 1000,
  });

  const puppies: Puppy[] = data?.puppies || [];

  const createPuppyMutation = useMutation({
    mutationFn: (puppyData: any) => adminApi.createPuppy(puppyData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['puppies'] });
      toast.success('Puppy created successfully!');
      setIsModalOpen(false);
      setSelectedPuppy(null);
      
      // Handle optional Square integration response
      if (response && typeof response === 'object' && 'squareItemId' in response) {
        console.log('Square item created:', response.squareItemId);
      }
    },
    onError: (err: any) => {
      const errorMessage = err?.message || 'Failed to create puppy';
      toast.error(errorMessage);
    }
  });

  const updatePuppyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updatePuppy(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['puppies'] });
      toast.success('Puppy updated successfully!');
      setIsModalOpen(false);
      setSelectedPuppy(null);
      
      // Handle optional Square integration response
      if (response && typeof response === 'object' && 'squareItemId' in response) {
        console.log('Square item updated:', response.squareItemId);
      }
    },
    onError: (err: any) => {
      const errorMessage = err?.message || 'Failed to update puppy';
      toast.error(errorMessage);
    }
  });

  const deletePuppyMutation = useMutation({
    mutationFn: (id: string) => adminApi.deletePuppy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['puppies'] });
      toast.success('Puppy deleted successfully!');
      setPuppyToDeleteId(null);
      setShowDeleteDialog(false);
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete puppy: ${err.message}`);
      setPuppyToDeleteId(null);
      setShowDeleteDialog(false);
    }
  });

  const handleDeletePuppy = (id: string) => {
    setPuppyToDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDeletePuppy = () => {
    if (puppyToDeleteId) {
      deletePuppyMutation.mutate(puppyToDeleteId);
    }
  };

  const handleEditPuppy = (puppy: Puppy) => {
    setSelectedPuppy(puppy);
    setIsModalOpen(true);
  };

  const handleAddPuppy = () => {
    setSelectedPuppy(null);
    setIsModalOpen(true);
  };

  const filteredPuppies: Puppy[] = puppies.filter(puppy =>
    puppy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    puppy.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isMutationLoading = createPuppyMutation.isLoading || updatePuppyMutation.isLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold flex items-center">
          Puppy Management
        </h2>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search puppies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>

          <Button
            onClick={handleAddPuppy}
            className="bg-brand-red hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Puppy
          </Button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <Table>
          <TableCaption>A list of your recent puppies.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Breed</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPuppies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">No puppies found.</TableCell>
              </TableRow>
            ) : (
              filteredPuppies.map((puppy) => (
                <TableRow key={puppy.id}>
                  <TableCell className="font-medium">{puppy.name}</TableCell>
                  <TableCell>{puppy.breed}</TableCell>
                  <TableCell>{puppy.gender}</TableCell>
                  <TableCell>{puppy.price}</TableCell>
                  <TableCell>{puppy.status}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPuppy(puppy)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePuppy(puppy.id)}
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

      {puppyToDeleteId && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the puppy
                and remove its data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => { setShowDeleteDialog(false); setPuppyToDeleteId(null); }}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeletePuppy} disabled={deletePuppyMutation.isLoading}>
                {deletePuppyMutation.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Yes, delete puppy
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
                    {selectedPuppy ? 'Edit Puppy' : 'Add New Puppy'}
                  </DialogTitle>
                </DialogHeader>
                <PuppyForm 
                  puppy={selectedPuppy || undefined}
                  onClose={() => {
                    setIsModalOpen(false);
                    setSelectedPuppy(null);
                  }}
                  isEditMode={!!selectedPuppy}
                />
              </DialogContent>
            </Dialog>
          )}
    </div>
  );
};

export default PuppyManagement;
