import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Save, Star } from 'lucide-react'; // Assuming Star icon for rating

// Assuming Testimonial types are accessible, e.g., imported from where they are defined in client.ts or a global types file.
// For this subtask, we'll define them locally if not easily importable.
interface Testimonial {
  id: string;
  name: string;
  location?: string;
  testimonial_text: string;
  rating: number;
  puppy_name?: string;
  image_url?: string;
  created_at: string;
}
type TestimonialCreationData = Omit<Testimonial, 'id' | 'created_at'>;
type TestimonialUpdateData = Partial<TestimonialCreationData>;


interface TestimonialFormProps {
  testimonial?: Testimonial; // For editing
  onSave: (data: TestimonialCreationData | TestimonialUpdateData) => void;
  onCancel: () => void;
  isLoading?: boolean; // To disable form during submission
}

const TestimonialForm: React.FC<TestimonialFormProps> = ({ testimonial, onSave, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<TestimonialCreationData | TestimonialUpdateData>(
    testimonial ?
    { // Omit id and created_at for editing existing testimonial data
      name: testimonial.name,
      location: testimonial.location,
      testimonial_text: testimonial.testimonial_text,
      rating: testimonial.rating,
      puppy_name: testimonial.puppy_name,
      image_url: testimonial.image_url,
    }
    :
    { // Initial state for new testimonial
      name: '',
      location: '',
      testimonial_text: '',
      rating: 5, // Default rating
      puppy_name: '',
      image_url: '',
    }
  );

  useEffect(() => {
    if (testimonial) {
      setFormData({
        name: testimonial.name,
        location: testimonial.location || '',
        testimonial_text: testimonial.testimonial_text,
        rating: testimonial.rating,
        puppy_name: testimonial.puppy_name || '',
        image_url: testimonial.image_url || '',
      });
    } else {
      // Reset form for new testimonial
      setFormData({
        name: '',
        location: '',
        testimonial_text: '',
        rating: 5,
        puppy_name: '',
        image_url: '',
      });
    }
  }, [testimonial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value, 10) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation for rating
    const rating = Number(formData.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
        // In a real app, use a toast or proper form validation library message
        alert("Rating must be between 1 and 5.");
        return;
    }
    onSave(formData);
  };

  const isEditing = Boolean(testimonial?.id);

  return (
    <div className="animate-fade-in">
      <Button variant="ghost" onClick={onCancel} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Testimonials
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Testimonial' : 'Add New Testimonial'}</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required disabled={isLoading} />
            </div>
            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Input id="location" name="location" value={formData.location || ''} onChange={handleChange} disabled={isLoading} />
            </div>
            <div>
              <Label htmlFor="testimonial_text">Testimonial</Label>
              <Textarea id="testimonial_text" name="testimonial_text" value={formData.testimonial_text} onChange={handleChange} required rows={5} disabled={isLoading} />
            </div>
            <div>
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input id="rating" name="rating" type="number" min="1" max="5" value={formData.rating} onChange={handleChange} required disabled={isLoading} />
            </div>
            <div>
              <Label htmlFor="puppy_name">Puppy's Name (Optional)</Label>
              <Input id="puppy_name" name="puppy_name" value={formData.puppy_name || ''} onChange={handleChange} disabled={isLoading} />
            </div>
            <div>
              <Label htmlFor="image_url">Image URL (Optional)</Label>
              <Input id="image_url" name="image_url" type="url" value={formData.image_url || ''} onChange={handleChange} placeholder="https://example.com/image.jpg" disabled={isLoading} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (isEditing ? 'Saving...' : 'Adding...') : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? 'Save Changes' : 'Add Testimonial'}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default TestimonialForm;
