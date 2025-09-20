import React, { useState, useEffect } from 'react';
import { Puppy, Litter } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import PuppyForm from './PuppyForm';
import LitterForm from './LitterForm';

interface EntityDetailViewProps {
  entityId: string;
  entityType: 'puppy' | 'litter';
  puppies: Puppy[];
  litters: Litter[];
}

const PuppyDetailsView: React.FC<{ puppy: Puppy, onEdit: () => void }> = ({ puppy, onEdit }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle className="text-2xl">{puppy.name}</CardTitle>
        <CardDescription>{puppy.breed}</CardDescription>
      </div>
      <Button variant="outline" size="icon" onClick={onEdit}>
        <Pencil className="h-4 w-4" />
      </Button>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex justify-between">
        <strong>Status:</strong>
        <Badge>{puppy.status}</Badge>
      </div>
      <div className="flex justify-between">
        <strong>Gender:</strong>
        <span>{puppy.gender}</span>
      </div>
      <div className="flex justify-between">
        <strong>DOB:</strong>
        <span>{new Date(puppy.birth_date).toLocaleDateString()}</span>
      </div>
      <div className="flex justify-between">
        <strong>Price:</strong>
        <span>${puppy.price}</span>
      </div>
      <p className="text-sm text-muted-foreground pt-4">{puppy.description}</p>
    </CardContent>
  </Card>
);

const LitterDetailsView: React.FC<{ litter: Litter, puppies: Puppy[], onEdit: () => void }> = ({ litter, puppies, onEdit }) => {
    const litterPuppies = puppies.filter(p => p.litter_id === litter.id);
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl">{litter.name}</CardTitle>
                    <CardDescription>{litter.breed}</CardDescription>
                </div>
                <Button variant="outline" size="icon" onClick={onEdit}>
                    <Pencil className="h-4 w-4" />
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between">
                    <strong>Status:</strong>
                    <Badge>{litter.status}</Badge>
                </div>
                <div className="flex justify-between">
                    <strong>Dam:</strong>
                    <span>{litter.damName}</span>
                </div>
                <div className="flex justify-between">
                    <strong>Sire:</strong>
                    <span>{litter.sireName}</span>
                </div>
                <div className="flex justify-between">
                    <strong>DOB:</strong>
                    <span>{new Date(litter.dateOfBirth).toLocaleDateString()}</span>
                </div>
                <div>
                    <h4 className="font-semibold mt-4">Puppies in this Litter ({litterPuppies.length})</h4>
                    <ul className="list-disc pl-5 mt-2 text-muted-foreground">
                        {litterPuppies.map(p => <li key={p.id}>{p.name}</li>)}
                         {litterPuppies.length === 0 && <li>No puppies assigned.</li>}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};

const EntityDetailView: React.FC<EntityDetailViewProps> = ({ entityId, entityType, puppies, litters }) => {
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Exit edit mode whenever the selected entity changes
    setIsEditing(false);
  }, [entityId, entityType]);

  if (entityType === 'puppy') {
    const puppy = puppies.find(p => p.id === entityId);
    if (!puppy) return <div>Puppy not found.</div>;

    return isEditing ? (
      <PuppyForm puppy={puppy} onClose={() => setIsEditing(false)} isEditMode={true} />
    ) : (
      <PuppyDetailsView puppy={puppy} onEdit={() => setIsEditing(true)} />
    );
  }

  if (entityType === 'litter') {
    const litter = litters.find(l => l.id === entityId);
    if (!litter) return <div>Litter not found.</div>;

    return isEditing ? (
      <LitterForm litter={litter} onClose={() => setIsEditing(false)} isEditMode={true} />
    ) : (
      <LitterDetailsView litter={litter} puppies={puppies} onEdit={() => setIsEditing(true)} />
    );
  }

  return null;
};

export default EntityDetailView;
