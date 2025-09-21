import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dog, Search, ArrowLeft, ArrowRight, Edit2, Trash2, Loader2, PlusCircle, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import StudDogForm from './StudDogForm';
import { StudDog, StudDogCreationData, StudDogUpdateData } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { adminApi } from '@/api';

interface AdminStudDog {
  id: string;
  name: string;
  breed_id: string;
  age?: number;
  description?: string;
  temperament?: string;
  certifications?: string[];
  image_urls?: string[];
  stud_fee: number;
  is_available: boolean;
  owner_user_id?: string;
  owner_name?: string | null;
  owner_email?: string | null;
  breed_name?: string | null;
  created_at: string;
  updated_at: string;
}

interface AdminStudDogsApiResponse {
  studDogs: AdminStudDog[];
  currentPage: number;
  totalPages: number;
  totalStudDogs: number;
  limit: number;
}

const AdminStudDogManager: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filterAvailability, setFilterAvailability] = useState<string>("all");
  const [filterBreedId, setFilterBreedId] = useState("");

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingStudDog, setEditingStudDog] = useState<AdminStudDog | null>(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deletingStudDogId, setDeletingStudDogId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedSearchQuery(searchQuery); setCurrentPage(1); }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => { setCurrentPage(1); }, [filterAvailability, filterBreedId]);

  const fetchAdminStudDogs = async ({ queryKey }: { queryKey: [string, number, number, string, string, string] }): Promise<AdminStudDogsApiResponse> => {
    const [_key, page, limit, search, availability, breedId] = queryKey;
    const params = {
      page: page,
      limit: limit,
      search: search || undefined,
      is_available: availability !== "all" ? availability : undefined,
      breed_id: breedId || undefined
    };
    const response = await adminApi.getStudDogs(params);
    return {
      studDogs: response.data || [],
      currentPage: page,
      totalPages: Math.ceil((response.data?.length || 0) / limit),
      totalStudDogs: response.data?.length || 0,
      limit: limit
    };
  };

  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: ['adminStudDogs', currentPage, rowsPerPage, debouncedSearchQuery, filterAvailability, filterBreedId],
    queryFn: fetchAdminStudDogs,
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
  });

  const addStudDogMutation = useMutation({
    mutationFn: (newData: StudDogCreationData) => adminApi.createStudDog(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStudDogs'] });
      setShowFormModal(false);
      toast.success("Stud dog added successfully!");
    },
    onError: (err: Error) => {
      toast.error(`Failed to add stud dog: ${err.message}`);
    }
  });

  const updateStudDogMutation = useMutation({
    mutationFn: ({ id, data: updateData }: { id: string, data: StudDogUpdateData }) =>
      adminApi.updateStudDog(id, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStudDogs'] });
      setShowFormModal(false);
      setEditingStudDog(null);
      toast.success("Stud dog updated successfully!");
    },
    onError: (err: Error) => {
      toast.error(`Failed to update stud dog: ${err.message}`);
    }
  });

  const deleteStudDogMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteStudDog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStudDogs'] });
      setShowDeleteConfirmModal(false);
      setDeletingStudDogId(null);
      toast.success("Stud dog deleted successfully!");
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete stud dog: ${err.message}`);
    }
  });

  const handleAddClick = () => { setEditingStudDog(null); setShowFormModal(true); };
  const handleEditClick = (studDog: AdminStudDog) => {
    setEditingStudDog(studDog);
    setShowFormModal(true);
  };
  const handleDeleteClick = (id: string) => { setDeletingStudDogId(id); setShowDeleteConfirmModal(true); };

  const handleSaveStudDog = (formDataValues: StudDogCreationData, id?: string) => {
    if (id) {
      updateStudDogMutation.mutate({ id, data: formDataValues });
    } else {
      addStudDogMutation.mutate(formDataValues);
    }
  };

  const confirmDelete = () => { 
    if (deletingStudDogId) deleteStudDogMutation.mutate(deletingStudDogId); 
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center text-gray-800 dark:text-white">
          <Dog className="mr-3 h-7 w-7 text-brand-red" /> Stud Dog Management
        </h2>
        <Button onClick={handleAddClick}><PlusCircle className="mr-2 h-4 w-4" /> Add Stud Dog</Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <Input placeholder="Search by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="text-sm" />
        <Input placeholder="Filter by Breed ID..." value={filterBreedId} onChange={(e) => setFilterBreedId(e.target.value)} className="text-sm" />
        <select value={filterAvailability} onChange={(e) => setFilterAvailability(e.target.value)} className="border p-2 rounded-lg text-sm bg-white dark:bg-gray-700 focus:ring-brand-red">
          <option value="all">All Availability</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Breed</TableHead><TableHead>Owner</TableHead>
            <TableHead>Fee</TableHead><TableHead>Available</TableHead><TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {isLoading ? Array.from({ length: rowsPerPage }).map((_, i) => <TableRow key={`skel-${i}`}><TableCell colSpan={7}><div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div></TableCell></TableRow>)
             : isError ? <TableRow><TableCell colSpan={7} className="text-center text-red-500 py-8">Error: {error.message}</TableCell></TableRow>
             : data?.studDogs.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8">No stud dogs found.</TableCell></TableRow>
             : data?.studDogs.map(dog => (
                <TableRow key={dog.id}>
                  <TableCell className="font-medium">{dog.name}</TableCell>
                  <TableCell>{dog.breed_name || dog.breed_id}</TableCell>
                  <TableCell>{dog.owner_name || dog.owner_user_id?.substring(0,8) || 'N/A'}</TableCell>
                  <TableCell>${dog.stud_fee.toFixed(2)}</TableCell>
                  <TableCell><Badge variant={dog.is_available ? "default" : "outline"}>{dog.is_available ? "Yes" : "No"}</Badge></TableCell>
                  <TableCell className="text-xs">{formatDate(dog.updated_at)}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="outline" size="icon" title="Edit" onClick={() => handleEditClick(dog)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="destructive" size="icon" title="Delete" onClick={() => handleDeleteClick(dog.id)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data && data.totalStudDogs > 0 && (
        <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
          <p>Showing {Math.min((data.currentPage - 1) * data.limit + 1, data.totalStudDogs)} - {Math.min(data.currentPage * data.limit, data.totalStudDogs)} of {data.totalStudDogs} stud dogs</p>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={data.currentPage <= 1 || isLoading || isPlaceholderData}><ArrowLeft className="mr-1 h-4 w-4" />Prev</Button>
            <span>Page {data.currentPage} of {data.totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={data.currentPage >= data.totalPages || isLoading || isPlaceholderData}>Next<ArrowRight className="ml-1 h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showFormModal} onOpenChange={(isOpen) => { if(!isOpen) {setShowFormModal(false); setEditingStudDog(null); } else {setShowFormModal(true);}}}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl">
          <StudDogForm
            studDog={editingStudDog ? {
                id: editingStudDog.id,
                name: editingStudDog.name,
                breed_id: editingStudDog.breed_id,
                age: typeof editingStudDog.age === 'string' ? parseInt(editingStudDog.age) || 0 : editingStudDog.age || 0,
                description: editingStudDog.description || '',
                temperament: editingStudDog.temperament || '',
                certifications: editingStudDog.certifications || [],
                stud_fee: typeof editingStudDog.stud_fee === 'string' ? parseFloat(editingStudDog.stud_fee) || 0 : editingStudDog.stud_fee || 0,
                image_urls: editingStudDog.image_urls || [],
                is_available: Boolean(editingStudDog.is_available)
            } : undefined}
            onSave={handleSaveStudDog}
            onClose={() => { setShowFormModal(false); setEditingStudDog(null); }}
            isLoading={addStudDogMutation.isPending || updateStudDogMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteConfirmModal} onOpenChange={setShowDeleteConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete stud dog: {data?.studDogs.find(sd => sd.id === deletingStudDogId)?.name || deletingStudDogId}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirmModal(false)} disabled={deleteStudDogMutation.isPending}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteStudDogMutation.isPending}>
              {deleteStudDogMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStudDogManager;
