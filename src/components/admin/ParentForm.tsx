import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ParentCreationData } from "@/types/parent";

interface ParentFormProps {
  formData: ParentCreationData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (field: string, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const ParentForm: React.FC<ParentFormProps> = ({
  formData,
  onInputChange,
  onSelectChange,
  onSubmit,
  onCancel,
  isEditing
}) => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Parent' : 'Add New Parent'}</CardTitle>
      </CardHeader>
      
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={onInputChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="breed">Breed *</Label>
              <Input
                id="breed"
                name="breed"
                value={formData.breed}
                onChange={onInputChange}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value) => onSelectChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={onInputChange}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="bloodline_info">Bloodline Information</Label>
            <Textarea
              id="bloodline_info"
              name="bloodline_info"
              value={formData.bloodline_info || ''}
              onChange={onInputChange}
              rows={2}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-brand-red hover:bg-red-700">
            {isEditing ? 'Update Parent' : 'Add Parent'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ParentForm;