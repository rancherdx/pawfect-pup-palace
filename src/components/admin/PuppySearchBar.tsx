
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";

interface PuppySearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddPuppy: () => void;
}

const PuppySearchBar: React.FC<PuppySearchBarProps> = ({ 
  searchQuery, 
  onSearchChange, 
  onAddPuppy 
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <h2 className="text-3xl font-bold flex items-center">
        Puppy Management
      </h2>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search puppies..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-brand-red"
          />
        </div>

        <Button
          onClick={onAddPuppy}
          className="bg-brand-red hover:bg-red-700 text-white flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Puppy
        </Button>
      </div>
    </div>
  );
};

export default PuppySearchBar;
