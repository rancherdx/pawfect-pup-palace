import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

/**
 * @interface CreatureProfileFormProps
 * @description Defines the props for the CreatureProfileForm component.
 */
interface CreatureProfileFormProps {
  /** Callback function to handle the submission of the form data. */
  onSubmit: (data: Record<string, string>) => void;
  /** Callback function to cancel the form operation. */
  onCancel: () => void;
}

/**
 * @component CreatureProfileForm
 * @description A form for users to create a profile for their creature (pet), including name, breed, birthday, and feeding notes.
 * @param {CreatureProfileFormProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered form for creating a creature profile.
 */
const CreatureProfileForm = ({ onSubmit, onCancel }: CreatureProfileFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    birthday: "",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3",
    feedingNotes: ""
  });

  /**
   * Handles changes to the form's input and textarea fields.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Handles the form submission, performs validation, and calls the onSubmit callback.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.name || !formData.breed || !formData.birthday) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Submit the new creature profile
    onSubmit(formData);
    
    toast({
      title: "Profile Created!",
      description: `${formData.name}'s profile has been added to your dashboard.`
    });
  };

  const demoImages = [
    "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1561037404-61cd46aa615b?ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1583511666372-62fc211f8377?ixlib=rb-4.0.3",
    "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?ixlib=rb-4.0.3"
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-xl font-semibold mb-4">Add New Creature</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your pet's name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="breed">Breed *</Label>
                <Input
                  id="breed"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  placeholder="e.g. Golden Retriever"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="birthday">Birthday *</Label>
                <Input
                  id="birthday"
                  name="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="feedingNotes">Feeding Notes</Label>
                <Textarea
                  id="feedingNotes"
                  name="feedingNotes"
                  value={formData.feedingNotes}
                  onChange={handleChange}
                  placeholder="Diet requirements, favorite treats, etc."
                  rows={4}
                />
              </div>
            </div>
            
            <div>
              <Label className="block mb-2">Choose a Profile Image</Label>
              <div className="grid grid-cols-2 gap-3">
                {demoImages.map((img, index) => (
                  <div 
                    key={index}
                    onClick={() => setFormData(prev => ({ ...prev, image: img }))}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      formData.image === img ? 'border-brand-red scale-[1.02] shadow-md' : 'border-transparent hover:border-muted'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Pet ${index + 1}`} 
                      className="w-full h-32 object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                These are sample images. You'll be able to upload your own photos in the future.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-brand-red hover:bg-red-700 text-white">
              Create Profile
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

