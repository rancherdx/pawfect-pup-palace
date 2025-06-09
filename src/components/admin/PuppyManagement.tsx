
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Dog, Edit, Trash, Search, ArrowRight, Loader2 } from "lucide-react"; // Added Loader2
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PuppyForm from "./PuppyForm";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { puppiesApi, adminApi } from "@/api"; // Added adminApi
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const PuppyManagement = () => {
  const [isAddingPuppy, setIsAddingPuppy] = useState(false);
  const [editingPuppy, setEditingPuppy] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const queryClient = useQueryClient();
  
  // Fetch puppies from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-puppies'],
    queryFn: () => puppiesApi.getAllPuppies(),
  });

  const puppies = data?.puppies || [];
  
  // Create mutation for adding puppies
  const createPuppyMutation = useMutation({
    mutationFn: (newPuppy: any) => puppiesApi.createPuppy(newPuppy),
    onSuccess: (createdPuppy) => { // Assume createdPuppy is returned
      queryClient.invalidateQueries({ queryKey: ['admin-puppies'] });
      toast.success("Puppy added successfully");
      setIsAddingPuppy(false);
      if (createdPuppy && createdPuppy.id && createdPuppy.status === "Available") {
        syncWithSquareMutation.mutate(createdPuppy.id);
      }
    },
    onError: (error) => {
      toast.error(`Failed to add puppy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  // Update mutation for editing puppies
  const updatePuppyMutation = useMutation({
    mutationFn: (updatedPuppy: any) => puppiesApi.updatePuppy(updatedPuppy.id, updatedPuppy),
    onSuccess: (updatedPuppy) => { // Assume updatedPuppy is returned
      queryClient.invalidateQueries({ queryKey: ['admin-puppies'] });
      toast.success("Puppy updated successfully");
      setEditingPuppy(null);
      if (updatedPuppy && updatedPuppy.id && updatedPuppy.status === "Available") {
        syncWithSquareMutation.mutate(updatedPuppy.id);
      }
    },
    onError: (error) => {
      toast.error(`Failed to update puppy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  // Delete mutation for removing puppies
  const deletePuppyMutation = useMutation({
    mutationFn: (id: string) => puppiesApi.deletePuppy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-puppies'] });
      toast.success("Puppy deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete puppy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Sync with Square mutation
  const syncWithSquareMutation = useMutation({
    mutationFn: (puppyId: string) => adminApi.syncPuppyWithSquare(puppyId),
    onSuccess: (data, puppyId) => { // data is SquareSyncResponse
      queryClient.setQueryData(['admin-puppies'], (oldData: any) => {
        if (!oldData || !oldData.puppies) return oldData;
        const updatedPuppies = oldData.puppies.map((p: any) =>
          p.id === puppyId ? { ...p, squareStatus: "Synced", squareItemId: data.squareItemId } : p
        );
        return { ...oldData, puppies: updatedPuppies };
      });
      toast.success(data.message || "Puppy synced with Square successfully!");
    },
    onError: (error: Error, puppyId) => {
      toast.error(`Failed to sync puppy ${puppyId} with Square: ${error.message}`);
      // Optionally, reset status if it was optimistically set
      // queryClient.invalidateQueries({ queryKey: ['admin-puppies'] });
    }
  });

  const handleAddPuppy = (newPuppy: any) => {
    createPuppyMutation.mutate(newPuppy);
  };

  const handleUpdatePuppy = (updatedPuppy: any) => {
    updatePuppyMutation.mutate(updatedPuppy);
  };

  const handleDeletePuppy = (id: string) => {
    if (window.confirm("Are you sure you want to delete this puppy?")) {
      deletePuppyMutation.mutate(id);
    }
  };

  const syncWithSquare = (id: string) => {
    syncWithSquareMutation.mutate(id);
  };

  const filteredPuppies = puppies.filter((puppy: any) => 
    puppy.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    puppy.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isAddingPuppy || editingPuppy) {
    return (
      <PuppyForm 
        puppy={editingPuppy || undefined}
        onSave={editingPuppy ? handleUpdatePuppy : handleAddPuppy} 
        onCancel={() => {
          setIsAddingPuppy(false);
          setEditingPuppy(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold flex items-center">
          <Dog className="mr-2 h-8 w-8 text-brand-red" />
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
            onClick={() => setIsAddingPuppy(true)} 
            className="bg-brand-red hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Puppy
          </Button>
        </div>
      </div>
      
      <Card className="shadow-md">
        <CardHeader className="bg-gray-50 dark:bg-gray-900/20">
          <CardTitle className="text-xl">Puppy Inventory</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Breed</TableHead>
                  <TableHead>Birthdate</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Square Sync</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton
                  Array(3).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      {Array(7).fill(0).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : error ? (
                  // Error state
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-red-500">
                      Failed to load puppies. Please try again.
                    </TableCell>
                  </TableRow>
                ) : filteredPuppies.length === 0 ? (
                  // Empty state
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No puppies found. Add your first puppy!
                    </TableCell>
                  </TableRow>
                ) : (
                  // Puppy list
                  filteredPuppies.map((puppy: any) => (
                    <TableRow key={puppy.id}>
                      <TableCell className="font-medium">{puppy.name}</TableCell>
                      <TableCell>{puppy.breed}</TableCell>
                      <TableCell>{new Date(puppy.birthDate).toLocaleDateString()}</TableCell>
                      <TableCell>${puppy.price}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          puppy.status === "Available" 
                            ? "bg-green-100 text-green-800" 
                            : puppy.status === "Reserved" 
                              ? "bg-yellow-100 text-yellow-800" 
                              : "bg-gray-100 text-gray-800"
                        }`}>
                          {puppy.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          puppy.squareStatus === "Synced" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {puppy.squareStatus || "Not Synced"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost" 
                          size="sm"
                          onClick={() => setEditingPuppy(puppy)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeletePuppy(puppy.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                        {(!puppy.squareStatus || puppy.squareStatus === "Not Synced") && (
                          <Button 
                            size="sm"
                            variant="outline" 
                            onClick={() => syncWithSquare(puppy.id)}
                            disabled={syncWithSquareMutation.isPending && syncWithSquareMutation.variables === puppy.id} // Disable button for this specific puppy if it's syncing
                            className="text-xs border-blue-300 hover:bg-blue-50"
                          >
                            {syncWithSquareMutation.isPending && syncWithSquareMutation.variables === puppy.id ? (
                              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            ) : null}
                            Sync <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-gray-50 dark:bg-gray-900/10 rounded-lg p-4 border border-dashed border-gray-300 mt-8">
        <h3 className="font-medium">Tips:</h3>
        <ul className="mt-2 text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>• Puppies added here will be synced to your Square inventory.</li>
          <li>• Set status to "Reserved" when a deposit is placed.</li>
          <li>• Set status to "Sold" after final payment is received.</li>
          <li>• Photos can be added when editing a puppy.</li>
        </ul>
      </div>
    </div>
  );
};

export default PuppyManagement;
