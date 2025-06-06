import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export interface StudDogFormData {
  id?: string; // Present if editing
  name: string;
  breed_id: string;
  age: number | string; // Allow string for input, parse to number
  description: string;
  temperament: string;
  certifications: string; // User types JSON string or comma-separated
  stud_fee: number | string; // Allow string for input, parse to number
  image_urls: string; // User types JSON string of URLs or comma-separated
  is_available: boolean;
}

// Data that will be sent to the API (parsed/cleaned)
export interface StudDogApiPayload {
  name: string;
  breed_id: string;
  age?: number | null;
  description?: string | null;
  temperament?: string | null;
  certifications?: string[] | null; // Processed into array
  stud_fee: number;
  image_urls?: string[] | null; // Processed into array
  is_available: boolean;
}


interface StudDogFormProps {
  studDog?: StudDogFormData | null; // Data for editing, null for new
  onSave: (data: StudDogApiPayload, id?: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const StudDogForm: React.FC<StudDogFormProps> = ({ studDog, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<StudDogFormData>(
    studDog || {
      name: '',
      breed_id: '',
      age: '',
      description: '',
      temperament: '',
      certifications: '[]',
      stud_fee: '',
      image_urls: '[]',
      is_available: true,
    }
  );

  useEffect(() => {
    if (studDog) {
      setFormData({
        ...studDog,
        age: studDog.age ?? '',
        stud_fee: studDog.stud_fee ?? '',
        certifications: studDog.certifications || '[]',
        image_urls: studDog.image_urls || '[]',
      });
    } else {
      // Reset for new form
      setFormData({
        name: '', breed_id: '', age: '', description: '', temperament: '',
        certifications: '[]', stud_fee: '', image_urls: '[]', is_available: true,
      });
    }
  }, [studDog]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const parseStringToArray = (input: string): string[] | null => {
    try {
        // Try to parse as JSON array first
        const parsed = JSON.parse(input);
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
            return parsed;
        }
    } catch (e) {
        // If JSON parsing fails, try to split by comma
        if (input.trim() === "" || input.trim() === "[]") return []; // Handle empty or "[]" as empty array
        return input.split(',').map(item => item.trim()).filter(item => item !== "");
    }
    // If input was valid JSON but not an array of strings (e.g. "[1,2,3]")
    toast.error(`Invalid array format for input: ${input}. Must be JSON array of strings or comma-separated strings.`);
    return null; // Indicate parsing failure for non-string arrays
};


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required.");
      return;
    }
    if (!formData.breed_id.trim()) {
      toast.error("Breed ID is required.");
      return;
    }
    const studFeeNum = parseFloat(String(formData.stud_fee));
    if (isNaN(studFeeNum) || studFeeNum <= 0) {
      toast.error("Stud Fee must be a positive number.");
      return;
    }
    const ageNum = formData.age !== '' ? parseInt(String(formData.age), 10) : null;
    if (formData.age !== '' && (isNaN(ageNum!) || ageNum! < 0)) {
      toast.error("Age, if provided, must be a non-negative number.");
      return;
    }

    const parsedCertifications = parseStringToArray(formData.certifications);
    if (formData.certifications.trim() && parsedCertifications === null) { // Only error if input was provided but invalid
        toast.error("Certifications format is invalid. Please use a JSON array of strings or comma-separated values.");
        return;
    }

    const parsedImageUrls = parseStringToArray(formData.image_urls);
     if (formData.image_urls.trim() && parsedImageUrls === null) { // Only error if input was provided but invalid
        toast.error("Image URLs format is invalid. Please use a JSON array of strings or comma-separated values.");
        return;
    }


    const apiPayload: StudDogApiPayload = {
      name: formData.name,
      breed_id: formData.breed_id,
      age: ageNum,
      description: formData.description.trim() || null,
      temperament: formData.temperament.trim() || null,
      certifications: parsedCertifications,
      stud_fee: studFeeNum,
      image_urls: parsedImageUrls,
      is_available: formData.is_available,
    };
    onSave(apiPayload, formData.id);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{formData.id ? 'Edit Stud Dog' : 'Add New Stud Dog'}</CardTitle>
        <CardDescription>
          {formData.id ? `Editing details for ${formData.name}.` : 'Enter details for the new stud dog.'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="breed_id">Breed ID</Label>
              <Input id="breed_id" name="breed_id" value={formData.breed_id} onChange={handleChange} placeholder="e.g., breed-001" required />
               {/* TODO: Replace with a Select dropdown populated from /api/breeds */}
               <p className="text-xs text-muted-foreground">Enter the ID of an existing breed.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="age">Age (Years)</Label>
              <Input id="age" name="age" type="number" min="0" value={formData.age} onChange={handleChange} placeholder="e.g., 3" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stud_fee">Stud Fee ($)</Label>
              <Input id="stud_fee" name="stud_fee" type="number" min="0.01" step="0.01" value={formData.stud_fee} onChange={handleChange} required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="temperament">Temperament</Label>
            <Textarea id="temperament" name="temperament" value={formData.temperament} onChange={handleChange} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="certifications">Certifications</Label>
            <Textarea id="certifications" name="certifications" value={formData.certifications} onChange={handleChange} rows={2} placeholder='e.g., ["CH", "OFA Good"] or CH, OFA Good' />
            <p className="text-xs text-muted-foreground">Enter as a JSON array of strings or comma-separated values.</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="image_urls">Image URLs</Label>
            <Textarea id="image_urls" name="image_urls" value={formData.image_urls} onChange={handleChange} rows={3} placeholder='e.g., ["url1.jpg", "url2.jpg"] or url1.jpg, url2.jpg' />
            <p className="text-xs text-muted-foreground">Enter as a JSON array of strings or comma-separated values.</p>
          </div>
          <div className="flex items-center space-x-2 pt-2">
            <Checkbox id="is_available" name="is_available" checked={formData.is_available} onCheckedChange={(checked) => setFormData(prev => ({...prev, is_available: Boolean(checked)}))} />
            <Label htmlFor="is_available">Available for Stud Service</Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {formData.id ? 'Save Changes' : 'Add Stud Dog'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default StudDogForm;
