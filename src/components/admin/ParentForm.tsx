import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Parent } from '@/types/api';
import { ParentCreationData, ParentUpdateData } from '@/api/adminApi';

const parentFormSchema = z.object({
  name: z.string().min(2, "Name is required."),
  breed: z.string().min(2, "Breed is required."),
  gender: z.enum(['Male', 'Female'], { errorMap: () => ({ message: "Please select a gender." }) }),
  description: z.string().optional(),
  bloodline_info: z.string().optional(),
  image_urls: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  health_clearances: z.array(z.string()).optional(),
  is_active: z.boolean().default(true),
});

type ParentFormData = z.infer<typeof parentFormSchema>;

interface ParentFormProps {
  parent?: Parent;
  onSave: (data: ParentCreationData | ParentUpdateData, id?: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}

const ParentForm: React.FC<ParentFormProps> = ({ parent, onSave, onCancel, isSaving }) => {
  const { register, handleSubmit, control, formState: { errors } } = useForm<ParentFormData>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      name: parent?.name || '',
      breed: parent?.breed || '',
      gender: parent?.gender || undefined,
      description: parent?.description || '',
      bloodline_info: parent?.bloodline_info || '',
      is_active: parent?.is_active ?? true,
    },
  });

  const onSubmit = (data: ParentFormData) => {
    onSave(data, parent?.id);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{parent ? 'Edit Parent' : 'Add New Parent'}</CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="breed">Breed *</Label>
              <Input id="breed" {...register("breed")} />
              {errors.breed && <p className="text-red-500 text-sm mt-1">{errors.breed.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender.message}</p>}
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} rows={3} />
          </div>
          
          <div>
            <Label htmlFor="bloodline_info">Bloodline Information</Label>
            <Textarea id="bloodline_info" {...register("bloodline_info")} rows={2} />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" className="bg-brand-red hover:bg-red-700" disabled={isSaving}>
            {isSaving ? 'Saving...' : (parent ? 'Update Parent' : 'Add Parent')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ParentForm;