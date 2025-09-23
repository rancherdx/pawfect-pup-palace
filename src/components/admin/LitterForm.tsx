
import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminApi } from '@/api';
import { Litter, LitterStatus, LitterCreationData, LitterUpdateData } from "@/types";
import { Loader2 } from 'lucide-react';

/**
 * @constant LITTER_STATUS_VALUES
 * @description An array of possible statuses for a litter.
 */
const LITTER_STATUS_VALUES: LitterStatus[] = ["Active", "Available Soon", "All Reserved", "All Sold", "Archived"];

/**
 * @typedef {Omit<LitterCreationData, "status"> & { status: LitterStatus }} LitterFormData
 * @description Defines the shape of the form data for creating or editing a litter.
 */
type LitterFormData = Omit<LitterCreationData, "status"> & { status: LitterStatus };

/**
 * @interface LitterFormProps
 * @description Defines the props for the LitterForm component, including legacy props for backward compatibility.
 */
interface LitterFormProps {
  litter?: Litter;
  onClose?: () => void;
  isEditMode?: boolean;
  // Legacy props for compatibility with LitterManagement
  formData?: any;
  onInputChange?: any;
  onSubmit?: any;
  onCancel?: any;
  isEditing?: boolean;
}

/**
 * @component LitterForm
 * @description A form component for creating and editing litter information.
 * It supports both creating a new litter and updating an existing one.
 * @param {LitterFormProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered litter form.
 */
const LitterForm: React.FC<LitterFormProps> = ({ 
  litter, 
  onClose, 
  isEditMode,
  // Legacy props
  formData: legacyFormData,
  onInputChange,
  onSubmit: legacyOnSubmit,
  onCancel,
  isEditing
}) => {
  // Use legacy props if provided
  const actualOnClose = onClose || onCancel || (() => {});
  const actualIsEditMode = isEditMode !== undefined ? isEditMode : !!isEditing;
  const [formData, setFormData] = useState<LitterFormData>({
    name: litter?.name || "",
    breed: litter?.breed || "",
    damName: litter?.damName || "",
    sireName: litter?.sireName || "",
    dateOfBirth: litter?.dateOfBirth ? new Date(litter.dateOfBirth).toISOString().split('T')[0] : "",
    status: litter?.status || "Active",
    description: litter?.description || "",
    coverImageUrl: litter?.coverImageUrl || "",
    puppyCount: litter?.puppyCount || 0,
    expectedDate: litter?.expectedDate ? new Date(litter.expectedDate).toISOString().split('T')[0] : "",
  });

  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, { id?: string; data: LitterFormData }>({
    mutationFn: ({ id, data }) => {
      const apiData = {
        ...data,
        dam_name: data.damName,
        sire_name: data.sireName,
        date_of_birth: data.dateOfBirth,
        cover_image_url: data.coverImageUrl,
        puppy_count: data.puppyCount,
        expected_date: data.expectedDate,
      };

      if (actualIsEditMode && id) {
        return adminApi.updateLitter(id, apiData as LitterUpdateData);
      } else {
        return adminApi.createLitter(apiData as LitterCreationData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["litters"] });
      toast.success(`Litter ${actualIsEditMode ? "updated" : "created"} successfully!`);
      actualOnClose();
    },
    onError: (error) => {
      toast.error(`Failed to ${actualIsEditMode ? "update" : "create"} litter: ${error.message}`);
    },
  });

  useEffect(() => {
    if (litter) {
      setFormData({
        name: litter.name || "",
        breed: litter.breed || "",
        damName: litter.damName || "",
        sireName: litter.sireName || "",
        dateOfBirth: litter.dateOfBirth ? new Date(litter.dateOfBirth).toISOString().split('T')[0] : "",
        status: litter.status || "Active",
        description: litter.description || "",
        coverImageUrl: litter.coverImageUrl || "",
        puppyCount: litter.puppyCount || 0,
        expectedDate: litter.expectedDate ? new Date(litter.expectedDate).toISOString().split('T')[0] : "",
      });
    }
  }, [litter]);

  /**
   * Handles changes to standard input and textarea elements.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handles changes to the status select element.
   * @param {keyof LitterFormData} name - The name of the form field to update.
   * @param {string} value - The new value from the select input.
   */
  const handleSelectChange = (name: keyof LitterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value as LitterStatus }));
  };

  /**
   * Handles the form submission.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ id: litter?.id, data: formData });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{actualIsEditMode ? `Edit Litter: ${litter?.name}` : "Add New Litter"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Litter Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Input id="breed" name="breed" value={formData.breed} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="damName">Dam (Mother's Name)</Label>
              <Input id="damName" name="damName" value={formData.damName} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sireName">Sire (Father's Name)</Label>
              <Input id="sireName" name="sireName" value={formData.sireName} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required />
            </div>
             <div className="space-y-2">
              <Label htmlFor="puppyCount">Number of Puppies</Label>
              <Input id="puppyCount" name="puppyCount" type="number" value={formData.puppyCount} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" value={formData.status} onValueChange={value => handleSelectChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {LITTER_STATUS_VALUES.map(statusValue => (
                    <SelectItem key={statusValue} value={statusValue}>{statusValue}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expectedDate">Expected Date (Optional)</Label>
              <Input id="expectedDate" name="expectedDate" type="date" value={formData.expectedDate} onChange={handleChange} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coverImageUrl">Cover Image URL (Optional)</Label>
            <Input id="coverImageUrl" name="coverImageUrl" value={formData.coverImageUrl} onChange={handleChange} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={actualOnClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {actualIsEditMode ? "Update Litter" : "Create Litter"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LitterForm;
