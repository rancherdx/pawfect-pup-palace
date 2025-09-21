import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { adminApi } from '@/api';
import { StudDog, StudDogCreationData, StudDogUpdateData } from "@/types";
import { Loader2 } from 'lucide-react';

interface StudDogFormProps {
  studDog?: StudDog;
  onClose: () => void;
  onSave?: (formData: StudDogCreationData, id?: string) => void;
  onCancel?: () => void;
  isEditMode?: boolean;
  isLoading?: boolean;
}

const StudDogForm: React.FC<StudDogFormProps> = ({ studDog, onClose, isEditMode }) => {
  const [formData, setFormData] = useState<StudDogCreationData>({
    name: studDog?.name || "",
    breed_id: studDog?.breed_id || "",
    age: studDog?.age || undefined,
    description: studDog?.description || "",
    stud_fee: studDog?.stud_fee || 0,
    is_available: studDog?.is_available ?? true,
    temperament: studDog?.temperament || "",
    certifications: studDog?.certifications || [],
    image_urls: studDog?.image_urls || [],
  });

  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, { id?: string; data: StudDogCreationData }>({
    mutationFn: ({ id, data }) => {
      if (isEditMode && id) {
        return adminApi.updateStudDog(id, data as StudDogUpdateData);
      } else {
        return adminApi.createStudDog(data as StudDogCreationData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stud_dogs"] });
      toast.success(`Stud Dog ${isEditMode ? "updated" : "created"} successfully!`);
      onClose();
    },
    onError: (error) => {
      toast.error(`Failed to ${isEditMode ? "update" : "create"} Stud Dog: ${error.message}`);
    },
  });

  useEffect(() => {
    if (studDog) {
      setFormData({
        name: studDog.name || "",
        breed_id: studDog.breed_id || "",
        age: studDog.age || undefined,
        description: studDog.description || "",
        stud_fee: studDog.stud_fee || 0,
        is_available: studDog.is_available ?? true,
        temperament: studDog.temperament || "",
        certifications: studDog.certifications || [],
        image_urls: studDog.image_urls || [],
      });
    }
  }, [studDog]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isNumber = type === 'number';
    setFormData(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };

  const handleArrayChange = (name: 'certifications' | 'image_urls', value: string) => {
    setFormData(prev => ({ ...prev, [name]: value.split(',').map(item => item.trim()) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ id: studDog?.id, data: formData });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditMode ? `Edit Stud Dog: ${studDog?.name}` : "Add New Stud Dog"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breed_id">Breed</Label>
              <Input id="breed_id" name="breed_id" value={formData.breed_id} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stud_fee">Stud Fee ($)</Label>
              <Input id="stud_fee" name="stud_fee" type="number" value={formData.stud_fee} onChange={handleChange} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperament">Temperament</Label>
            <Textarea id="temperament" name="temperament" value={formData.temperament} onChange={handleChange} />
          </div>
           <div className="space-y-2">
            <Label htmlFor="certifications">Certifications (comma-separated)</Label>
            <Input
                id="certifications"
                name="certifications"
                value={Array.isArray(formData.certifications) ? formData.certifications.join(', ') : ''}
                onChange={(e) => handleArrayChange('certifications', e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_available"
              checked={formData.is_available}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_available: Boolean(checked) }))}
            />
            <Label htmlFor="is_available">Available for Stud Service</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? "Update Stud Dog" : "Create Stud Dog"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export type StudDogFormData = StudDogCreationData;
export type StudDogApiPayload = StudDogCreationData;

export default StudDogForm;
