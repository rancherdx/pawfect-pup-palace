
import React from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";

/**
 * @interface PuppySearchBarProps
 * @description Defines the props for the PuppySearchBar component.
 */
interface PuppySearchBarProps {
  /** The current value of the search input. */
  searchQuery: string;
  /** Callback function to be invoked when the search query changes. */
  onSearchChange: (query: string) => void;
  /** Callback function to be invoked when the 'Add New Puppy' button is clicked. */
  onAddPuppy: () => void;
}

/**
 * @component PuppySearchBar
 * @description A component that provides a search input and an 'Add New Puppy' button for the puppy management interface.
 * @param {PuppySearchBarProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered search bar and action button section.
 */
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
