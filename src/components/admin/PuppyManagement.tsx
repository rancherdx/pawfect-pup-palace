
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Dog, Edit, Trash, Search, ArrowRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PuppyForm from "./PuppyForm";

// Mock data for demo purposes
const initialPuppies = [
  { 
    id: "1", 
    name: "Max", 
    breed: "Golden Retriever", 
    birthdate: "2023-12-10", 
    price: 1200, 
    description: "Playful and friendly golden puppy with a beautiful coat",
    status: "Available", 
    squareStatus: "Synced" 
  },
  { 
    id: "2", 
    name: "Bella", 
    breed: "German Shepherd", 
    birthdate: "2024-01-15", 
    price: 1500, 
    description: "Smart and alert German Shepherd with excellent temperament",
    status: "Reserved", 
    squareStatus: "Synced" 
  },
  { 
    id: "3", 
    name: "Rocky", 
    breed: "French Bulldog", 
    birthdate: "2024-02-20", 
    price: 2000, 
    description: "Adorable Frenchie with a playful personality",
    status: "Sold", 
    squareStatus: "Not Synced" 
  },
];

const PuppyManagement = () => {
  const [puppies, setPuppies] = useState(initialPuppies);
  const [isAddingPuppy, setIsAddingPuppy] = useState(false);
  const [editingPuppy, setEditingPuppy] = useState<null | typeof initialPuppies[0]>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddPuppy = (newPuppy: any) => {
    const puppy = { ...newPuppy, id: String(Date.now()), squareStatus: "Not Synced" };
    setPuppies([...puppies, puppy]);
    setIsAddingPuppy(false);
  };

  const handleUpdatePuppy = (updatedPuppy: any) => {
    setPuppies(puppies.map(p => p.id === updatedPuppy.id ? updatedPuppy : p));
    setEditingPuppy(null);
  };

  const handleDeletePuppy = (id: string) => {
    if (window.confirm("Are you sure you want to delete this puppy?")) {
      setPuppies(puppies.filter(p => p.id !== id));
    }
  };

  const syncWithSquare = (id: string) => {
    setPuppies(puppies.map(p => 
      p.id === id ? { ...p, squareStatus: "Synced" } : p
    ));
    // In a real app, this would make an API call to Square
    alert("Puppy synced with Square! (Demo functionality)");
  };

  const filteredPuppies = puppies.filter(puppy => 
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
                {filteredPuppies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No puppies found. Add your first puppy!
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPuppies.map((puppy) => (
                    <TableRow key={puppy.id}>
                      <TableCell className="font-medium">{puppy.name}</TableCell>
                      <TableCell>{puppy.breed}</TableCell>
                      <TableCell>{new Date(puppy.birthdate).toLocaleDateString()}</TableCell>
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
                          {puppy.squareStatus}
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
                        {puppy.squareStatus === "Not Synced" && (
                          <Button 
                            size="sm"
                            variant="outline" 
                            onClick={() => syncWithSquare(puppy.id)}
                            className="text-xs border-blue-300 hover:bg-blue-50"
                          >
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
