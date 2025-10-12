import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Heart, User } from "lucide-react";
import { Parent } from '@/types/api';

interface ParentCardProps {
  parent: Parent;
  onEdit: (parent: Parent) => void;
  onDelete: (id: string) => void;
}

const ParentCard: React.FC<ParentCardProps> = ({ parent, onEdit, onDelete }) => {
  const displayImage = parent.image_urls && parent.image_urls.length > 0 
    ? parent.image_urls[0] 
    : '/placeholder.svg';

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {parent.gender === 'Male' ? (
              <User className="h-5 w-5 text-blue-500" />
            ) : (
              <Heart className="h-5 w-5 text-pink-500" />
            )}
            {parent.name}
          </CardTitle>
          <Badge variant={parent.gender === 'Male' ? 'default' : 'secondary'}>
            {parent.gender}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="aspect-video w-full overflow-hidden rounded-md bg-gray-100">
          <img
            src={displayImage}
            alt={parent.name}
            className="h-full w-full object-cover"
          />
        </div>
        
        <div className="space-y-1 text-sm">
          <p><span className="font-medium">Breed:</span> {parent.breed}</p>
          {parent.description && (
            <p className="text-gray-600 line-clamp-2">{parent.description}</p>
          )}
          {parent.bloodline_info && (
            <p><span className="font-medium">Bloodline:</span> {parent.bloodline_info}</p>
          )}
          {parent.certifications && parent.certifications.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {parent.certifications.map((cert, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {cert}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2 pt-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(parent)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(parent.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ParentCard;