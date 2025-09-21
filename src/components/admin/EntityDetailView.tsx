import React, { useState, useEffect } from 'react';
import { Puppy, Litter, StudDog } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, PlusCircle } from 'lucide-react';
import PuppyForm from './PuppyForm';
import LitterForm from './LitterForm';

interface EntityDetailViewProps {
  entityId: string;
  entityType: 'puppy' | 'litter' | 'stud';
  puppies: Puppy[];
  litters: Litter[];
  studDogs: StudDog[];
  onBulkAddPuppies: (litterId: string) => void;
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

const LitterDetailsView: React.FC<{ litter: Litter, puppies: Puppy[], onEdit: () => void, onBulkAdd: () => void }> = ({ litter, puppies, onEdit, onBulkAdd }) => {
    const litterPuppies = puppies.filter(p => p.litter_id === litter.id);
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl">{litter.name}</CardTitle>
                    <CardDescription>{litter.breed}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={onBulkAdd}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Puppies
                    </Button>
                    <Button variant="outline" size="icon" onClick={onEdit}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                </div>
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

const EntityDetailView: React.FC<EntityDetailViewProps> = ({ entityId, entityType, puppies, litters, studDogs, onBulkAddPuppies }) => {
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
      <LitterDetailsView litter={litter} puppies={puppies} onEdit={() => setIsEditing(true)} onBulkAdd={() => onBulkAddPuppies(litter.id)} />
    );
  }

const StudDogDetailsView: React.FC<{ studDog: StudDog, onEdit: () => void }> = ({ studDog, onEdit }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-2xl">{studDog.name}</CardTitle>
                <CardDescription>{studDog.breed_id}</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={onEdit}>
                <Pencil className="h-4 w-4" />
            </Button>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex justify-between">
                <strong>Status:</strong>
                <Badge>{studDog.is_available ? 'Available' : 'Unavailable'}</Badge>
            </div>
            <div className="flex justify-between">
                <strong>Age:</strong>
                <span>{studDog.age} years</span>
            </div>
            <div className="flex justify-between">
                <strong>Stud Fee:</strong>
                <span>${studDog.stud_fee}</span>
            </div>
            <p className="text-sm text-muted-foreground pt-4">{studDog.description}</p>
        </CardContent>
    </Card>
);

  if (entityType === 'stud') {
    const studDog = studDogs.find(s => s.id === entityId);
    if (!studDog) return <div>Stud dog not found.</div>;

    return isEditing ? (
      <div>StudDogForm component needed</div>
    ) : (
      <StudDogDetailsView studDog={studDog} onEdit={() => setIsEditing(true)} />
    );
  }

  return <div>Unknown entity type.</div>;
};

export default EntityDetailView;
