import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dog, Search, ArrowLeft, ArrowRight, Edit2, Trash2, Loader2, PlusCircle, X } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import StudDogForm, { StudDogFormData, StudDogApiPayload } from './StudDogForm'; // Import the form
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  // DialogClose, // Not always needed if form has cancel
} from "@/components/ui/dialog";
import { fetchAdminAPI } from '@/api';

interface AdminStudDog extends StudDogApiPayload { // API Payload fields plus IDs and names
  id: string;
  owner_user_id?: string; // From backend if needed
  owner_name?: string | null;
  owner_email?: string | null;
  breed_name?: string | null;
  created_at: string;
  updated_at: string;
  // Raw JSON string fields also available if needed from API, but prefer parsed
  image_urls_raw_json?: string;
  certifications_raw_json?: string;
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
  const [filterAvailability, setFilterAvailability] = useState<string>("all"); // "all", "true", "false"
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

  const fetchAdminStudDogs = async ({ queryKey }: any): Promise<AdminStudDogsApiResponse> => {
    const [_key, page, limit, search, availability, breedId] = queryKey;
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (search) params.append('searchQuery', search);
    if (availability !== "all") params.append('is_available', availability);
    if (breedId) params.append('breed_id', breedId);
    return fetchAdminAPI(`/api/admin/stud-dogs?${params.toString()}`);
  };

  const { data, isLoading, isError, error, isPreviousData } = useQuery<AdminStudDogsApiResponse, Error>(
    ['adminStudDogs', currentPage, rowsPerPage, debouncedSearchQuery, filterAvailability, filterBreedId],
    fetchAdminStudDogs,
    { keepPreviousData: true, staleTime: 5 * 60 * 1000, onError: (err) => toast.error(`Failed to fetch stud dogs: ${err.message}`) }
  );

  const commonMutationOptions = {
    onSuccess: () => queryClient.invalidateQueries(['adminStudDogs']),
  };

  const addStudDogMutation = useMutation(
    (newData: StudDogApiPayload) => fetchAdminAPI('/api/admin/stud-dogs', { method: 'POST', body: JSON.stringify(newData) }),
    { ...commonMutationOptions, onSuccess: () => { commonMutationOptions.onSuccess(); setShowFormModal(false); toast.success("Stud dog added successfully!"); }}
  );

  const updateStudDogMutation = useMutation(
    ({ id, data: updateData }: { id: string, data: StudDogApiPayload }) => fetchAdminAPI(`/api/admin/stud-dogs/${id}`, { method: 'PUT', body: JSON.stringify(updateData) }),
    { ...commonMutationOptions, onSuccess: () => { commonMutationOptions.onSuccess(); setShowFormModal(false); setEditingStudDog(null); toast.success("Stud dog updated successfully!"); }}
  );

  const deleteStudDogMutation = useMutation(
    (id: string) => fetchAdminAPI(`/api/admin/stud-dogs/${id}`, { method: 'DELETE' }),
    { ...commonMutationOptions, onSuccess: () => { commonMutationOptions.onSuccess(); setShowDeleteConfirmModal(false); setDeletingStudDogId(null); toast.success("Stud dog deleted successfully!"); }}
  );

  const handleAddClick = () => { setEditingStudDog(null); setShowFormModal(true); };
  const handleEditClick = (studDog: AdminStudDog) => {
    const formData: StudDogFormData = {
        ...studDog,
        age: studDog.age ?? '',
        stud_fee: studDog.stud_fee ?? '',
        // Convert arrays back to string for form if needed, or form handles array
        certifications: studDog.certifications_raw_json || JSON.stringify(studDog.certifications || []),
        image_urls: studDog.image_urls_raw_json || JSON.stringify(studDog.image_urls || []),
        is_available: Boolean(studDog.is_available),
    };
    setEditingStudDog(studDog); // Keep original AdminStudDog for ID
    setShowFormModal(true);
};
  const handleDeleteClick = (id: string) => { setDeletingStudDogId(id); setShowDeleteConfirmModal(true); };

  const handleSaveStudDog = (formDataValues: StudDogApiPayload, id?: string) => {
    if (id) { // Editing existing
      updateStudDogMutation.mutate({ id, data: formDataValues });
    } else { // Adding new
      addStudDogMutation.mutate(formDataValues);
    }
  };

  const confirmDelete = () => { if (deletingStudDogId) deleteStudDogMutation.mutate(deletingStudDogId); };

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
                  <TableCell><Badge variant={dog.is_available ? "success" : "outline"}>{dog.is_available ? "Yes" : "No"}</Badge></TableCell>
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
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={data.currentPage <= 1 || isLoading || isPreviousData}><ArrowLeft className="mr-1 h-4 w-4" />Prev</Button>
            <span>Page {data.currentPage} of {data.totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={data.currentPage >= data.totalPages || isLoading || isPreviousData}>Next<ArrowRight className="ml-1 h-4 w-4" /></Button>
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
                age: editingStudDog.age ?? '',
                description: editingStudDog.description ?? '',
                temperament: editingStudDog.temperament ?? '',
                certifications: editingStudDog.certifications_raw_json || JSON.stringify(editingStudDog.certifications || []),
                stud_fee: editingStudDog.stud_fee ?? '',
                image_urls: editingStudDog.image_urls_raw_json || JSON.stringify(editingStudDog.image_urls || []),
                is_available: Boolean(editingStudDog.is_available)
            } : undefined}
            onSave={handleSaveStudDog}
            onCancel={() => { setShowFormModal(false); setEditingStudDog(null); }}
            isLoading={addStudDogMutation.isLoading || updateStudDogMutation.isLoading}
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
            <Button variant="outline" onClick={() => setShowDeleteConfirmModal(false)} disabled={deleteStudDogMutation.isLoading}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteStudDogMutation.isLoading}>
              {deleteStudDogMutation.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminStudDogManager;
