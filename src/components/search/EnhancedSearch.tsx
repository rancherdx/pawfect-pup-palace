import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, SlidersHorizontal } from "lucide-react";
import { publicApi } from "@/api/publicApi";
import { cn } from "@/lib/utils";

interface EnhancedSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
  className?: string;
}

export interface SearchFilters {
  search: string;
  breed: string;
  gender: string;
  status: string;
  priceRange: [number, number];
  ageRange: [number, number];
  temperament: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const defaultFilters: SearchFilters = {
  search: "",
  breed: "All Breeds",
  gender: "All",
  status: "All",
  priceRange: [0, 5000],
  ageRange: [0, 52], // weeks
  temperament: [],
  sortBy: "name",
  sortOrder: 'asc'
};

const temperamentOptions = [
  "Friendly", "Playful", "Calm", "Energetic", "Gentle", "Intelligent", 
  "Loyal", "Protective", "Independent", "Social", "Trainable", "Affectionate"
];

const sortOptions = [
  { value: "name", label: "Name" },
  { value: "price", label: "Price" },
  { value: "age", label: "Age" },
  { value: "breed", label: "Breed" },
  { value: "created_at", label: "Recently Added" }
];

export const EnhancedSearch = ({ onFiltersChange, initialFilters, className }: EnhancedSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
    ...defaultFilters,
    ...initialFilters
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Get available breeds
  const { data: breeds } = useQuery({
    queryKey: ['available-breeds'],
    queryFn: () => publicApi.getAvailableBreeds(),
    staleTime: 10 * 60 * 1000,
  });

  const availableBreeds = useMemo(() => 
    ["All Breeds", ...(breeds || [])], [breeds]
  );

  // Update filters when debounced search changes
  useEffect(() => {
    const updatedFilters = { ...filters, search: debouncedSearch };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  }, [debouncedSearch]);

  const updateFilter = <K extends keyof SearchFilters>(
    key: K, 
    value: SearchFilters[K]
  ) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const toggleTemperament = (trait: string) => {
    const newTemperament = filters.temperament.includes(trait)
      ? filters.temperament.filter(t => t !== trait)
      : [...filters.temperament, trait];
    updateFilter('temperament', newTemperament);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.breed !== "All Breeds") count++;
    if (filters.gender !== "All") count++;
    if (filters.status !== "All") count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 5000) count++;
    if (filters.ageRange[0] > 0 || filters.ageRange[1] < 52) count++;
    if (filters.temperament.length > 0) count++;
    return count;
  }, [filters]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter Puppies
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Advanced
            </Button>
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={resetFilters}>
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search by name or breed..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="breed">Breed</Label>
            <Select value={filters.breed} onValueChange={(value) => updateFilter('breed', value)}>
              <SelectTrigger id="breed">
                <SelectValue placeholder="Select breed" />
              </SelectTrigger>
              <SelectContent>
                {availableBreeds.map(breed => (
                  <SelectItem key={breed} value={breed}>{breed}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select value={filters.gender} onValueChange={(value) => updateFilter('gender', value)}>
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-6 border-t pt-4">
            {/* Price Range */}
            <div className="space-y-2">
              <Label>Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}</Label>
              <Slider
                value={filters.priceRange}
                onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
                max={5000}
                min={0}
                step={100}
                className="w-full"
              />
            </div>

            {/* Age Range */}
            <div className="space-y-2">
              <Label>Age Range: {filters.ageRange[0]} - {filters.ageRange[1]} weeks</Label>
              <Slider
                value={filters.ageRange}
                onValueChange={(value) => updateFilter('ageRange', value as [number, number])}
                max={52}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            {/* Temperament */}
            <div className="space-y-2">
              <Label>Temperament Traits</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {temperamentOptions.map(trait => (
                  <div key={trait} className="flex items-center space-x-2">
                    <Checkbox
                      id={trait}
                      checked={filters.temperament.includes(trait)}
                      onCheckedChange={() => toggleTemperament(trait)}
                    />
                    <Label htmlFor={trait} className="text-sm">{trait}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sortBy">Sort By</Label>
                <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
                  <SelectTrigger id="sortBy">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Select value={filters.sortOrder} onValueChange={(value) => updateFilter('sortOrder', value as 'asc' | 'desc')}>
                  <SelectTrigger id="sortOrder">
                    <SelectValue placeholder="Sort order" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Ascending</SelectItem>
                    <SelectItem value="desc">Descending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedSearch;