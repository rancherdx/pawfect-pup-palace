
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash } from "lucide-react";
import { Litter } from "@/types";

/**
 * @interface LitterCardProps
 * @description Defines the props for the LitterCard component.
 */
interface LitterCardProps {
  /** The litter object containing the details to display. */
  litter: Litter;
  /** Callback function to be invoked when the edit button is clicked. */
  onEdit: (litter: Litter) => void;
  /** Callback function to be invoked when the delete button is clicked. */
  onDelete: (id: string) => void;
}

/**
 * @component LitterCard
 * @description A card component that displays a summary of a single litter's information,
 * including actions to edit or delete the litter.
 * @param {LitterCardProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered litter card.
 */
const LitterCard: React.FC<LitterCardProps> = ({ litter, onEdit, onDelete }) => {
  /**
   * Returns a Tailwind CSS class string for styling a status badge based on the litter's status.
   * @param {string} status - The status of the litter.
   * @returns {string} The corresponding CSS classes for the badge background and text color.
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Available Soon":
        return "bg-blue-100 text-blue-800";
      case "All Reserved":
        return "bg-yellow-100 text-yellow-800";
      case "All Sold":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <div className="bg-brand-red h-2 rounded-t-lg" />
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-xl truncate">{litter.name}</h3>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(litter)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(litter.id)}
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
            <span className="font-medium">{litter.dam_name || 'N/A'} & {litter.sire_name || 'N/A'}</span>
          </div>
          {litter.date_of_birth && (
            <div className="flex justify-between">
              <span className="text-gray-500">Born:</span>
              <span className="font-medium">{new Date(litter.date_of_birth).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Puppies:</span>
            <span className="font-medium">{litter.puppy_count || 0}</span>
          </div>
          <div className="pt-3">
            <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(litter.status)}`}>
              {litter.status}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LitterCard;
