import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ArrowLeft, Save, Star } from 'lucide-react'; // Assuming Star icon for rating

/**
 * @interface Testimonial
 * @description Defines the structure of a testimonial object.
 */
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
/**
 * @typedef {Omit<Testimonial, 'id' | 'created_at'>} TestimonialCreationData
 * @description Defines the data structure for creating a new testimonial.
 */
type TestimonialCreationData = Omit<Testimonial, 'id' | 'created_at'>;
/**
 * @typedef {Partial<TestimonialCreationData>} TestimonialUpdateData
 * @description Defines the data structure for updating an existing testimonial.
 */
type TestimonialUpdateData = Partial<TestimonialCreationData>;


/**
 * @interface TestimonialFormProps
 * @description Defines the props for the TestimonialForm component.
 */
interface TestimonialFormProps {
  /** The testimonial data to populate the form for editing. If not provided, the form is in creation mode. */
  testimonial?: Testimonial;
  /** Callback function to save the testimonial data. */
  onSave: (data: TestimonialCreationData | TestimonialUpdateData) => void;
  /** Callback function to cancel the form operation. */
  onCancel: () => void;
  /** A boolean to indicate if the form submission is in progress. */
  isLoading?: boolean;
}

/**
 * @component TestimonialForm
 * @description A form component for creating and editing customer testimonials.
 * @param {TestimonialFormProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered testimonial form.
 */
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

  /**
   * Handles changes to the form's input and textarea fields.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value, 10) || 0 : value,
    }));
  };

  /**
   * Handles the form submission, validates the data, and calls the onSave callback.
   * @param {React.FormEvent} e - The form submission event.
   */
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
