import React, { useState } from 'react';
import { Parent, Litter } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Heart, Calendar, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api';
import ParentForm from './ParentForm';

/**
 * @interface ParentDetailViewProps
 * @description Defines the props for the ParentDetailView component.
 */
interface ParentDetailViewProps {
  /** The parent to display details for. */
  parent: Parent;
  /** Callback function to close the detail view. */
  onClose?: () => void;
}

/**
 * @component ParentDetailView
 * @description A detailed view component for displaying comprehensive parent information
 * including their litter history and breeding records.
 * @param {ParentDetailViewProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered parent detail view.
 */
const ParentDetailView: React.FC<ParentDetailViewProps> = ({ parent, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Fetch litters where this parent was involved
  const { data: littersData } = useQuery({
    queryKey: ['litters'],
    queryFn: () => adminApi.getAllLitters(),
  });
  
  // Filter litters where this parent was dam or sire
  const parentLitters = littersData?.litters?.filter((litter: any) => 
    litter.dam_id === parent.id || litter.sire_id === parent.id
  ) || [];

  if (isEditing) {
    return (
      <ParentForm
        formData={{
          name: parent.name,
          breed: parent.breed,
          gender: parent.gender as 'Male' | 'Female',
          description: parent.description || '',
          image_urls: parent.image_urls || [],
          certifications: parent.certifications || [],
          bloodline_info: parent.bloodline_info || '',
          health_clearances: parent.health_clearances || [],
          is_active: parent.is_active
        }}
        onInputChange={() => {}} // Will be handled by the form
        onSelectChange={() => {}} // Will be handled by the form
        onSubmit={() => {}} // Will be handled by the form
        onCancel={() => setIsEditing(false)}
        isEditing={true}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Heart className={`h-8 w-8 ${parent.gender === 'Female' ? 'text-pink-500' : 'text-blue-500'}`} />
              {parent.name}
            </CardTitle>
            <CardDescription className="text-lg">{parent.breed} • {parent.gender}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={parent.is_active ? "default" : "secondary"}>
              {parent.is_active ? "Active" : "Inactive"}
            </Badge>
            <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Parent Images */}
          {parent.image_urls && parent.image_urls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {parent.image_urls.map((url, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                  <img 
                    src={url} 
                    alt={`${parent.name} photo ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {parent.description && (
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Award className="h-4 w-4" />
                About {parent.name}
              </h4>
              <p className="text-muted-foreground">{parent.description}</p>
            </div>
          )}

          {/* Bloodline Information */}
          {parent.bloodline_info && (
            <div>
              <h4 className="font-semibold mb-2">Bloodline Information</h4>
              <p className="text-sm text-muted-foreground">{parent.bloodline_info}</p>
            </div>
          )}

          {/* Health Clearances */}
          {parent.health_clearances && parent.health_clearances.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Health Clearances</h4>
              <div className="flex flex-wrap gap-2">
                {parent.health_clearances.map((clearance, index) => (
                  <Badge key={index} variant="outline">{clearance}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {parent.certifications && parent.certifications.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Certifications</h4>
              <div className="flex flex-wrap gap-2">
                {parent.certifications.map((cert, index) => (
                  <Badge key={index} variant="secondary">{cert}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Litter History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Litter History ({parentLitters.length})
          </CardTitle>
          <CardDescription>
            Litters where {parent.name} was the {parent.gender === 'Female' ? 'dam (mother)' : 'sire (father)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {parentLitters.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No litters recorded for {parent.name} yet.
            </p>
          ) : (
            <div className="space-y-4">
              {parentLitters.map((litter: Litter) => (
                <Card key={litter.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{litter.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Born: {litter.dateOfBirth ? new Date(litter.dateOfBirth).toLocaleDateString() : 'TBD'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Puppies: {litter.puppyCount || 0}
                        </p>
                      </div>
                      <Badge>{litter.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParentDetailView;