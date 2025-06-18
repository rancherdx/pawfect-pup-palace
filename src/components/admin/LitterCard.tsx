
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash } from "lucide-react";
import { Litter } from "@/types";

interface LitterCardProps {
  litter: Litter;
  onEdit: (litter: Litter) => void;
  onDelete: (id: string) => void;
}

const LitterCard: React.FC<LitterCardProps> = ({ litter, onEdit, onDelete }) => {
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
            <span className="font-medium">{litter.damName} & {litter.sireName}</span>
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
