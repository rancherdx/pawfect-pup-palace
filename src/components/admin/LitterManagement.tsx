import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, PawPrint, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api';
import { toast } from 'sonner';
import { Litter, LitterCreationData, LitterUpdateData, LitterListResponse, LitterStatus } from "@/types";
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
import { Loader2 } from "lucide-react";
import LitterForm from "./LitterForm";
import LitterCard from "./LitterCard";

const initialFormData = {
  name: "",
  damName: "",
  sireName: "",
  breed: "",
  dateOfBirth: new Date().toISOString().split("T")[0],
  expectedDate: undefined as string | undefined,
  puppyCount: 0,
  status: "Active" as LitterStatus,
  description: "",
  coverImageUrl: ""
};

const LitterManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [currentLitter, setCurrentLitter] = useState<Litter | null>(null);
  const [formData, setFormData] = useState<LitterCreationData>(initialFormData);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [litterToDeleteId, setLitterToDeleteId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-litters'],
    queryFn: async () => {
      const result = await adminApi.getAllLitters({ limit: 100 });
      return result as LitterListResponse;
    },
    staleTime: 5 * 60 * 1000,
  });
  
  const litters: Litter[] = data?.litters || [];

  const addLitterMutation = useMutation({
    mutationFn: (newData: LitterCreationData) => adminApi.createLitter(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-litters'] });
      toast.success('Litter added successfully!');
      setShowForm(false);
      setFormData(initialFormData);
    },
    onError: (err: Error) => {
      toast.error(`Failed to add litter: ${err.message}`);
    }
  });

  const updateLitterMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: LitterUpdateData }) => adminApi.updateLitter(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-litters'] });
      toast.success('Litter updated successfully!');
      setShowForm(false);
      setCurrentLitter(null);
      setFormData(initialFormData);
    },
    onError: (err: Error) => {
      toast.error(`Failed to update litter: ${err.message}`);
    }
  });

  const deleteLitterMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteLitter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-litters'] });
      toast.success('Litter deleted successfully!');
      setLitterToDeleteId(null);
      setShowDeleteDialog(false);
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete litter: ${err.message}`);
      setLitterToDeleteId(null);
      setShowDeleteDialog(false);
    }
  });
  
  useEffect(() => {
    if (currentLitter && showForm) {
      const { id, createdAt, updatedAt, ...editableData } = currentLitter;
      setFormData({
        ...initialFormData,
        ...editableData,
        dateOfBirth: editableData.dateOfBirth ? new Date(editableData.dateOfBirth).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        expectedDate: editableData.expectedDate ? new Date(editableData.expectedDate).toISOString().split("T")[0] : undefined,
        status: (editableData.status || "Active") as LitterStatus,
        puppyCount: editableData.puppyCount === undefined ? 0 : Number(editableData.puppyCount),
      });
    } else {
      setFormData(initialFormData);
    }
  }, [currentLitter, showForm]);

  const handleDeleteLitter = (id: string) => {
    setLitterToDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteLitter = () => {
    if (litterToDeleteId) {
      deleteLitterMutation.mutate(litterToDeleteId);
    }
  };

  const handleEditLitter = (litter: Litter) => {
    setCurrentLitter(litter);
    setShowForm(true);
  };

  const handleAddLitter = () => {
    setCurrentLitter(null);
    setFormData(initialFormData);
    setShowForm(true);
  };

  const handleSaveLitter = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: LitterCreationData | LitterUpdateData = {
        ...formData,
        puppyCount: Number(formData.puppyCount) || 0,
    };
    
    if (currentLitter && currentLitter.id) {
      updateLitterMutation.mutate({ id: currentLitter.id, data: payload as LitterUpdateData });
    } else {
      addLitterMutation.mutate(payload as LitterCreationData);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        name === "puppyCount"
          ? (parseInt(value) || 0)
          : name === "status"
            ? value as LitterStatus
            : value,
    }));
  };

  const filteredLitters: Litter[] = litters.filter(litter =>
    litter.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    litter.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading litters...</div>;
  }

  if (isError) {
    return <div>Error loading litters. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold flex items-center">
          <PawPrint className="mr-2 h-8 w-8 text-brand-red" />
          Litter Management
        </h2>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search litters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
          
          <Button 
            onClick={handleAddLitter}
            className="bg-brand-red hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Litter
          </Button>
        </div>
      </div>
      
      {showForm ? (
        <LitterForm
          formData={formData}
          onInputChange={handleInputChange}
          onSubmit={handleSaveLitter}
          onCancel={() => setShowForm(false)}
          isEditing={!!currentLitter}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLitters.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <PawPrint className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Litters Found</h3>
              <p className="text-gray-500 mb-4">Add your first litter to get started</p>
              <Button 
                onClick={handleAddLitter}
                className="bg-brand-red hover:bg-red-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Litter
              </Button>
            </div>
          ) : (
            filteredLitters.map((litter) => (
              <LitterCard
                key={litter.id}
                litter={litter}
                onEdit={handleEditLitter}
                onDelete={handleDeleteLitter}
              />
            ))
          )}
        </div>
      )}
      
      {!showForm && filteredLitters.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 border border-dashed border-gray-300 mt-8">
          <h3 className="font-medium">Litter Management Tips:</h3>
          <ul className="mt-2 text-sm text-gray-600 space-y-1">
            <li>• Create a litter to track all puppies born together.</li>
            <li>• Litters will show on your website but won't be added to Square.</li>
            <li>• Add individual puppies from a litter to your inventory when they're ready for sale.</li>
          </ul>
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the litter
              and remove its data from our servers. Associated puppies will NOT be deleted but will lose their litter association.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowDeleteDialog(false); setLitterToDeleteId(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteLitter} disabled={deleteLitterMutation.isPending}>
              {deleteLitterMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Yes, delete litter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LitterManagement;
