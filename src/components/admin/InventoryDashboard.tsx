import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/adminApi';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2,
  Heart,
  Calendar,
  MapPin,
  Weight
} from 'lucide-react';
import { format } from 'date-fns';

/**
 * @component InventoryDashboard
 * @description A dashboard component for viewing and managing puppy and litter inventory.
 * It provides summary statistics, a list of active litters, and a detailed, filterable table of all puppies.
 * @returns {React.ReactElement} The rendered inventory dashboard.
 */
const InventoryDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [breedFilter, setBreedFilter] = useState('all');

  const { data: puppies, isLoading } = useQuery({
    queryKey: ['admin-puppies', searchTerm, statusFilter, breedFilter],
    queryFn: () => adminApi.getAllPuppies()
  });

  const { data: litters } = useQuery({
    queryKey: ['admin-litters'],
    queryFn: () => adminApi.getAllLitters()
  });

  /**
   * Returns a Tailwind CSS class string for styling a status badge based on the status text.
   * @param {string} status - The status of the puppy.
   * @returns {string} The corresponding CSS classes for the badge.
   */
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'not available': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Calculates the age of a puppy based on its birth date.
   * @param {string} birthDate - The birth date of the puppy in a string format.
   * @returns {string} A human-readable string representing the puppy's age.
   */
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const diffMonths = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    
    if (diffMonths < 1) {
      const diffWeeks = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24 * 7));
      return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''}`;
    } else if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffMonths / 12);
      const remainingMonths = diffMonths % 12;
      return `${years} year${years !== 1 ? 's' : ''}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}` : ''}`;
    }
  };

  const puppiesData = puppies?.puppies || [];
  const littersData = litters?.litters || [];

  const inventoryStats = {
    total: puppiesData.length || 0,
    available: puppiesData.filter(p => p.status === 'Available').length || 0,
    reserved: puppiesData.filter(p => p.status === 'Reserved').length || 0,
    sold: puppiesData.filter(p => p.status === 'Sold').length || 0
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Puppies</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryStats.total}</div>
            <p className="text-xs text-muted-foreground">
              All puppies in system
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <Badge className="bg-green-100 text-green-800">{inventoryStats.available}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{inventoryStats.available}</div>
            <p className="text-xs text-muted-foreground">
              Ready for adoption
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reserved</CardTitle>
            <Badge className="bg-yellow-100 text-yellow-800">{inventoryStats.reserved}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{inventoryStats.reserved}</div>
            <p className="text-xs text-muted-foreground">
              Pending pickup
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sold</CardTitle>
            <Badge className="bg-blue-100 text-blue-800">{inventoryStats.sold}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inventoryStats.sold}</div>
            <p className="text-xs text-muted-foreground">
              Successfully adopted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Litters */}
      <Card>
        <CardHeader>
          <CardTitle>Active Litters</CardTitle>
          <CardDescription>Current breeding litters and expected dates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {littersData.slice(0, 6).map((litter: any) => (
              <div key={litter.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{litter.name}</h4>
                  <Badge variant="outline">{litter.status}</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Breed:</span>
                    <span>{litter.breed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected:</span>
                    <span>{litter.expected_date ? format(new Date(litter.expected_date), 'MMM dd, yyyy') : 'TBD'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Puppy Count:</span>
                    <span>{litter.puppy_count || 'TBD'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Puppy Inventory</CardTitle>
              <CardDescription>
                Manage all puppies and their details
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Puppy
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search puppies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
                <SelectItem value="Not Available">Not Available</SelectItem>
              </SelectContent>
            </Select>
            <Select value={breedFilter} onValueChange={setBreedFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Breed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Breeds</SelectItem>
                <SelectItem value="Golden Retriever">Golden Retriever</SelectItem>
                <SelectItem value="Labrador">Labrador</SelectItem>
                <SelectItem value="French Bulldog">French Bulldog</SelectItem>
                <SelectItem value="German Shepherd">German Shepherd</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Puppies Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Photo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Breed</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading inventory...
                    </TableCell>
                  </TableRow>
                ) : puppiesData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No puppies found
                    </TableCell>
                  </TableRow>
                ) : (
                  puppiesData.map((puppy: any) => (
                    <TableRow key={puppy.id}>
                      <TableCell>
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                          {puppy.photo_url ? (
                            <img 
                              src={puppy.photo_url} 
                              alt={puppy.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Heart className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{puppy.name}</TableCell>
                      <TableCell>{puppy.breed}</TableCell>
                      <TableCell>{puppy.gender}</TableCell>
                      <TableCell>
                        {puppy.birth_date ? calculateAge(puppy.birth_date) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Weight className="h-3 w-3 mr-1 text-muted-foreground" />
                          {puppy.weight ? `${puppy.weight} lbs` : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {puppy.price ? `$${puppy.price.toLocaleString()}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(puppy.status)}>
                          {puppy.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryDashboard;