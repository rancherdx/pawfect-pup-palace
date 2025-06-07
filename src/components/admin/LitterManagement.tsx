import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, PawPrint, Edit, Trash, Search, Loader2, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/api/client';
import { toast } from 'sonner';

interface Litter {
  id: string;
  name: string;
  mother: string;
  father: string;
  breed: string;
  dateOfBirth: string;
  puppyCount: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

interface LitterApiPayload {
  name: string;
  mother: string;
  father: string;
  breed: string;
  dateOfBirth: string;
  puppyCount: number;
  status: string;
}

const initialFormData: LitterApiPayload = {
  name: "",
  mother: "",
  father: "",
  breed: "",
  dateOfBirth: new Date().toISOString().split("T")[0],
  puppyCount: 0,
  status: "Active"
};

const LitterManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [currentLitter, setCurrentLitter] = useState<Litter | null>(null);
  const [formData, setFormData] = useState<LitterApiPayload>(initialFormData);

  const queryClient = useQueryClient();

  const { data: littersData, isLoading, isError, error } = useQuery({
    queryKey: ['litters'],
    queryFn: async () => {
      const response = await apiRequest<any>('/litters');
      return response.litters || response;
    },
    staleTime: 5 * 60 * 1000,
  });
  
  const litters = littersData || [];

  const addLitterMutation = useMutation({
    mutationFn: (newData: LitterApiPayload) => apiRequest<Litter>('/litters', {
      method: 'POST',
      body: JSON.stringify(newData),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['litters'] });
      toast.success('Litter added successfully!');
      setShowForm(false);
    },
    onError: (err: Error) => {
      toast.error(`Failed to add litter: ${err.message}`);
    }
  });

  const updateLitterMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: LitterApiPayload }) => apiRequest<Litter>(`/litters/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['litters'] });
      toast.success('Litter updated successfully!');
      setShowForm(false);
      setCurrentLitter(null);
    },
    onError: (err: Error) => {
      toast.error(`Failed to update litter: ${err.message}`);
    }
  });

  const deleteLitterMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/litters/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['litters'] });
      toast.success('Litter deleted successfully!');
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete litter: ${err.message}`);
    }
  });
  
  useEffect(() => {
    if (currentLitter) {
      const { id, created_at, updated_at, ...payloadData } = currentLitter;
      setFormData(payloadData);
    } else {
      setFormData(initialFormData);
    }
  }, [currentLitter, showForm]);

  const handleDeleteLitter = (id: string) => {
    if (window.confirm("Are you sure you want to delete this litter?")) {
      deleteLitterMutation.mutate(id);
    }
  };

  const handleEditLitter = (litter: Litter) => {
    setCurrentLitter(litter);
    setShowForm(true);
  };

  const handleAddLitter = () => {
    setCurrentLitter(null);
    setShowForm(true);
  };

  const handleSaveLitter = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: LitterApiPayload = {
        ...formData,
        puppyCount: Number(formData.puppyCount) || 0
    };
    
    if (currentLitter && currentLitter.id) {
      updateLitterMutation.mutate({ id: currentLitter.id, data: payload });
    } else {
      addLitterMutation.mutate(payload);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "puppyCount" ? (parseInt(value) || 0) : value,
    }));
  };

  const filteredLitters = litters.filter(litter => 
    litter.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    litter.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isMutationLoading = addLitterMutation.isPending || updateLitterMutation.isPending;

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
        
        <Card className="shadow-lg border-t-4 border-t-brand-red animate-fade-in">
          <CardHeader className="bg-gray-50 dark:bg-gray-900/20">
            <CardTitle className="text-2xl">
              {currentLitter ? "Edit Litter" : "Add New Litter"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSaveLitter} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-lg font-medium mb-1">
                      Litter Name
                    </label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter litter name"
                      className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg font-medium mb-1">
                      Mother's Name
                    </label>
                    <input
                      required
                      type="text"
                      name="mother"
                      value={formData.mother}
                      onChange={handleInputChange}
                      placeholder="Enter mother's name"
                      className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg font-medium mb-1">
                      Father's Name
                    </label>
                    <input
                      required
                      type="text"
                      name="father"
                      value={formData.father}
                      onChange={handleInputChange}
                      placeholder="Enter father's name"
                      className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-lg font-medium mb-1">
                      Breed
                    </label>
                    <input
                      required
                      type="text"
                      name="breed"
                      value={formData.breed}
                      onChange={handleInputChange}
                      placeholder="Enter breed"
                      className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg font-medium mb-1">
                      Date of Birth
                    </label>
                    <input
                      required
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-lg font-medium mb-1">
                        Number of Puppies
                      </label>
                      <input
                        required
                        type="number"
                        name="puppyCount"
                        min="1"
                        value={formData.puppyCount}
                        onChange={handleInputChange}
                        placeholder="0"
                        className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-lg font-medium mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                      >
                        <option value="Active">Active</option>
                        <option value="Available Soon">Available Soon</option>
                        <option value="All Reserved">All Reserved</option>
                        <option value="All Sold">All Sold</option>
                        <option value="Archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-red hover:bg-red-700 text-white min-w-32"
                >
                  {currentLitter ? "Update Litter" : "Create Litter"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
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
              <Card key={litter.id} className="shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-brand-red h-2 rounded-t-lg" />
                
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-xl truncate">{litter.name}</h3>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditLitter(litter)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLitter(litter.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Breed:</span>
                      <span className="font-medium">{litter.breed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Parents:</span>
                      <span className="font-medium">{litter.mother} & {litter.father}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Born:</span>
                      <span className="font-medium">{new Date(litter.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Puppies:</span>
                      <span className="font-medium">{litter.puppyCount}</span>
                    </div>
                    <div className="pt-3">
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        litter.status === "Active" 
                          ? "bg-green-100 text-green-800" 
                          : litter.status === "Available Soon" 
                            ? "bg-blue-100 text-blue-800"
                            : litter.status === "All Reserved"
                              ? "bg-yellow-100 text-yellow-800"
                              : litter.status === "All Sold"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-gray-100 text-gray-800"
                      }`}>
                        {litter.status}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
    </div>
  );
};

export default LitterManagement;
