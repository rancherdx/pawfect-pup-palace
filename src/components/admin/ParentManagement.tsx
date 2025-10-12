import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Heart, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api';
import { toast } from 'sonner';
import { Parent, ParentCreationData, ParentUpdateData } from '@/types/api';
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
import ParentForm from "./ParentForm";
import ParentCard from "./ParentCard";

const initialFormData: ParentCreationData = {
  name: "",
  breed: "",
  gender: "Male",
  description: "",
  image_urls: [],
  certifications: [],
  bloodline_info: "",
  health_clearances: [],
  is_active: true
};

const ParentManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [currentParent, setCurrentParent] = useState<Parent | null>(null);
  const [formData, setFormData] = useState<ParentCreationData>(initialFormData);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [parentToDeleteId, setParentToDeleteId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-parents'],
    queryFn: async () => {
      const result = await adminApi.getAllParents();
      return { parents: result.parents, pagination: { total: result.parents.length, current_page: 1, total_pages: 1 } };
    },
    staleTime: 5 * 60 * 1000,
  });
  
  const parents: Parent[] = data?.parents || [];

  const addParentMutation = useMutation({
    mutationFn: (newData: ParentCreationData) => adminApi.createParent(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-parents'] });
      toast.success('Parent added successfully!');
      setShowForm(false);
      setFormData(initialFormData);
    },
    onError: (err: Error) => {
      toast.error(`Failed to add parent: ${err.message}`);
    }
  });

  const updateParentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ParentUpdateData }) => adminApi.updateParent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-parents'] });
      toast.success('Parent updated successfully!');
      setShowForm(false);
      setCurrentParent(null);
      setFormData(initialFormData);
    },
    onError: (err: Error) => {
      toast.error(`Failed to update parent: ${err.message}`);
    }
  });

  const deleteParentMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteParent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-parents'] });
      toast.success('Parent deleted successfully!');
      setParentToDeleteId(null);
      setShowDeleteDialog(false);
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete parent: ${err.message}`);
      setParentToDeleteId(null);
      setShowDeleteDialog(false);
    }
  });
  
  useEffect(() => {
    if (currentParent && showForm) {
      const { id, created_at, updated_at, ...editableData } = currentParent;
      setFormData({
        ...initialFormData,
        ...editableData
      });
    } else {
      setFormData(initialFormData);
    }
  }, [currentParent, showForm]);

  const handleDeleteParent = (id: string) => {
    setParentToDeleteId(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteParent = () => {
    if (parentToDeleteId) {
      deleteParentMutation.mutate(parentToDeleteId);
    }
  };

  const handleEditParent = (parent: Parent) => {
    setCurrentParent(parent);
    setShowForm(true);
  };

  const handleAddParent = () => {
    setCurrentParent(null);
    setFormData(initialFormData);
    setShowForm(true);
  };

  const handleSaveParent = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentParent && currentParent.id) {
      updateParentMutation.mutate({ id: currentParent.id, data: formData as ParentUpdateData });
    } else {
      addParentMutation.mutate(formData as ParentCreationData);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value as any,
    }));
  };

  const filteredParents: Parent[] = parents.filter(parent =>
    parent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    parent.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <div>Loading parents...</div>;
  }

  if (isError) {
    return <div>Error loading parents. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold flex items-center">
          <Heart className="mr-2 h-8 w-8 text-brand-red" />
          Parent Management
        </h2>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search parents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
          
          <Button 
            onClick={handleAddParent}
            className="bg-brand-red hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Parent
          </Button>
        </div>
      </div>
      
      {showForm ? (
        <ParentForm
          parent={currentParent || undefined}
          onSave={(data, id) => {
            if (id) {
              updateParentMutation.mutate({ id, data: data as ParentUpdateData });
            } else {
              addParentMutation.mutate(data as ParentCreationData);
            }
          }}
          onCancel={() => setShowForm(false)}
          isSaving={addParentMutation.isPending || updateParentMutation.isPending}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredParents.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Parents Found</h3>
              <p className="text-gray-500 mb-4">Add your first breeding parent to get started</p>
              <Button 
                onClick={handleAddParent}
                className="bg-brand-red hover:bg-red-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Parent
              </Button>
            </div>
          ) : (
            filteredParents.map((parent) => (
              <ParentCard
                key={parent.id}
                parent={parent}
                onEdit={handleEditParent}
                onDelete={handleDeleteParent}
              />
            ))
          )}
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the parent
              and remove its data from our servers. Any litters associated with this parent will lose their parent reference.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowDeleteDialog(false); setParentToDeleteId(null); }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteParent} disabled={deleteParentMutation.isPending}>
              {deleteParentMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Yes, delete parent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ParentManagement;