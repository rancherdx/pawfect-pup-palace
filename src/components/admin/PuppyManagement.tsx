import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api';
import { toast } from 'sonner';
import { Puppy, PuppyCreationData, PuppyUpdateData } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PuppyForm from "@/components/admin/PuppyForm";
import PuppyTable from "./PuppyTable";
import PuppySearchBar from "./PuppySearchBar";
import PuppyDeleteDialog from "./PuppyDeleteDialog";

/**
 * @component PuppyManagement
 * @description The main component for managing the puppy inventory. It orchestrates fetching,
 * displaying, creating, updating, and deleting puppies, using various sub-components for UI.
 * @returns {React.ReactElement} The rendered puppy management interface.
 */
const PuppyManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPuppy, setSelectedPuppy] = useState<Puppy | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [puppyToDeleteId, setPuppyToDeleteId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['puppies'],
    queryFn: () => adminApi.getAllPuppies(),
    staleTime: 5 * 60 * 1000,
  });

  const puppies: Puppy[] = data?.puppies || [];

  const createPuppyMutation = useMutation({
    mutationFn: (puppyData: PuppyCreationData) => adminApi.createPuppy(puppyData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['puppies'] });
      toast.success('Puppy created successfully!');
      setIsModalOpen(false);
      setSelectedPuppy(null);
      
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
    mutationFn: ({ id, data }: { id: string; data: PuppyUpdateData }) => adminApi.updatePuppy(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['puppies'] });
      toast.success('Puppy updated successfully!');
      setIsModalOpen(false);
      setSelectedPuppy(null);
      
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

  /**
   * Initiates the deletion process for a puppy.
   * @param {string} id - The ID of the puppy to delete.
   */
  const handleDeletePuppy = (id: string) => {
    setPuppyToDeleteId(id);
    setShowDeleteDialog(true);
  };

  /**
   * Confirms and executes the deletion of the selected puppy.
   */
  const confirmDeletePuppy = () => {
    if (puppyToDeleteId) {
      deletePuppyMutation.mutate(puppyToDeleteId);
    }
  };

  /**
   * Opens the form modal to edit an existing puppy.
   * @param {Puppy} puppy - The puppy data to edit.
   */
  const handleEditPuppy = (puppy: Puppy) => {
    setSelectedPuppy(puppy);
    setIsModalOpen(true);
  };

  /**
   * Opens the form modal to add a new puppy.
   */
  const handleAddPuppy = () => {
    setSelectedPuppy(null);
    setIsModalOpen(true);
  };

  /**
   * Closes the delete confirmation dialog.
   */
  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setPuppyToDeleteId(null);
  };

  const filteredPuppies: Puppy[] = puppies.filter(puppy =>
    puppy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    puppy.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading puppies...</div>;
  }

  if (isError) {
    return <div>Error loading puppies. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <PuppySearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onAddPuppy={handleAddPuppy}
      />

      <PuppyTable
        puppies={filteredPuppies}
        onEditPuppy={handleEditPuppy}
        onDeletePuppy={handleDeletePuppy}
      />

      <PuppyDeleteDialog
        isOpen={showDeleteDialog}
        onClose={handleCloseDeleteDialog}
        onConfirm={confirmDeletePuppy}
        isDeleting={deletePuppyMutation.isPending}
      />

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
