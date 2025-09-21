import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminApi } from '@/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ImageUploadWithCrop from '../media/ImageUploadWithCrop';
import { PuppyCreationData } from '@/types';
import { Loader2 } from 'lucide-react';

type BulkPuppyFormData = Partial<Omit<PuppyCreationData, 'image_urls'>> & { image_urls: string[] };

interface BulkPuppyCreatorProps {
  count: number;
  litterId: string;
  onClose: () => void;
  onSave: (puppies: PuppyCreationData[]) => void; // Will be used in next step
  isSaving: boolean; // Will be used in next step
}

const SimplifiedPuppyForm: React.FC<{
  index: number;
  formData: BulkPuppyFormData;
  onChange: (index: number, data: BulkPuppyFormData) => void;
}> = ({ index, formData, onChange }) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(index, { ...formData, [e.target.name]: e.target.value });
  };

  const handleImagesUploaded = (urls: string[]) => {
    onChange(index, { ...formData, image_urls: urls });
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
        <h4 className="font-semibold text-lg">Puppy {index + 1}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor={`name-${index}`}>Name</Label>
                <Input id={`name-${index}`} name="name" value={formData.name || ''} onChange={handleChange} placeholder="e.g., Buddy" />
            </div>
            <div className="space-y-2">
                <Label htmlFor={`color-${index}`}>Color</Label>
                <Input id={`color-${index}`} name="color" value={formData.color || ''} onChange={handleChange} placeholder="e.g., Golden" />
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor={`description-${index}`}>Description</Label>
            <Textarea id={`description-${index}`} name="description" value={formData.description || ''} onChange={handleChange} />
        </div>
        <div className="space-y-2">
            <Label>Images</Label>
            <ImageUploadWithCrop
                bucket="puppy-images"
                existingImages={formData.image_urls || []}
                onImagesUploaded={handleImagesUploaded}
                maxImages={5}
            />
        </div>
    </div>
  );
};


const BulkPuppyCreator: React.FC<BulkPuppyCreatorProps> = ({ count, litterId, onClose, onSave, isSaving }) => {
  const [puppies, setPuppies] = useState<BulkPuppyFormData[]>(() =>
    Array(count).fill({}).map(() => ({ image_urls: [] }))
  );

  const { data: litterData, isLoading: isLitterLoading } = useQuery({
      queryKey: ['litter', litterId],
      queryFn: () => adminApi.getLitterById(litterId),
      enabled: !!litterId,
  });

  const handlePuppyChange = (index: number, data: BulkPuppyFormData) => {
    const newPuppies = [...puppies];
    newPuppies[index] = data;
    setPuppies(newPuppies);
  };

  const handleSaveAll = () => {
    if (!litterData) {
        toast.error("Litter data is not available. Cannot save puppies.");
        return;
    }

    const newPuppiesData: PuppyCreationData[] = puppies.map((p, index) => {
        if (!p.name) {
            throw new Error(`Puppy ${index + 1} is missing a name.`);
        }
        return {
            name: p.name,
            description: p.description || `A beautiful ${litterData.breed} puppy.`,
            color: p.color || 'Not specified',
            image_urls: p.image_urls,
            litter_id: litterId,
            breed: litterData.breed,
            birth_date: litterData.date_of_birth,
            price: 0, // Default price, can be edited later
            status: 'Available',
            gender: 'Unknown', // Default gender
        } as PuppyCreationData;
    });

    try {
        onSave(newPuppiesData);
    } catch (error: any) {
        toast.error(`Validation failed: ${error.message}`);
    }
  };

  if (isLitterLoading) {
      return <div>Loading litter information...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Add Puppies</CardTitle>
        <CardDescription>
          You are adding {count} puppies to litter ID: {litterId}. The breed will be inherited from the litter.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto p-4">
        {puppies.map((puppyData, index) => (
          <SimplifiedPuppyForm
            key={index}
            index={index}
            formData={puppyData}
            onChange={handlePuppyChange}
          />
        ))}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSaveAll} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save All {count} Puppies
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BulkPuppyCreator;
