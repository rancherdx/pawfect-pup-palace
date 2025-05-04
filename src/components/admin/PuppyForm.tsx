import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Image, PlusCircle, Calendar, Scale, Dog, Save } from "lucide-react";
import { toast } from "sonner";
import { BreedTemplate } from "@/types/breedTemplate";

// Mock data for breed templates
const breedTemplates = [
  {
    id: "1",
    breedName: "Golden Retriever",
    description: "Friendly, intelligent dogs with a lustrous golden coat. Excellent family pets that are eager to please.",
    size: "Large",
    temperament: "Friendly, Reliable, Trustworthy",
    careInstructions: "Regular grooming needed, moderate exercise requirements, prone to hip issues.",
    commonTraits: ["Friendly", "Intelligent", "Devoted"],
    averageWeight: {
      min: 55,
      max: 75
    }
  },
  {
    id: "2",
    breedName: "French Bulldog",
    description: "Charming small dogs with bat-like ears and a playful disposition.",
    size: "Small",
    temperament: "Playful, Alert, Affectionate",
    careInstructions: "Minimal grooming, low exercise requirements, watch for breathing issues.",
    commonTraits: ["Playful", "Adaptable", "Sociable"],
    averageWeight: {
      min: 16,
      max: 28
    }
  },
  {
    id: "3",
    breedName: "German Shepherd",
    description: "Confident, courageous and smart working dogs that excel at various tasks.",
    size: "Large",
    temperament: "Confident, Courageous, Smart",
    careInstructions: "Regular exercise needed, moderate grooming, watch for hip dysplasia.",
    commonTraits: ["Loyal", "Intelligent", "Trainable"],
    averageWeight: {
      min: 50,
      max: 90
    }
  }
];

type PuppyData = {
  id?: string;
  name: string;
  breed: string;
  birthdate: string;
  price: number;
  description: string;
  status: string;
  squareStatus?: string;
  photoUrl?: string;
  weight?: number;
  size?: string;
  temperament?: string;
  careNotes?: string;
  motherName?: string;
  fatherName?: string;
  litterId?: string;
};

type PuppyFormProps = {
  puppy?: PuppyData;
  onSave: (puppy: PuppyData) => void;
  onCancel: () => void;
  litters?: Array<{id: string, name: string}>;
};

const calculateAge = (birthdate: string): string => {
  const today = new Date();
  const birth = new Date(birthdate);
  
  let months = (today.getFullYear() - birth.getFullYear()) * 12;
  months -= birth.getMonth();
  months += today.getMonth();
  
  if (months < 0) months = 0;
  
  if (months < 1) {
    const days = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    return `${days} days`;
  } else if (months < 24) {
    return `${months} months`;
  } else {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 ? `${years} years, ${remainingMonths} months` : `${years} years`;
  }
};

const PuppyForm = ({ puppy, onSave, onCancel, litters = [] }: PuppyFormProps) => {
  const [formData, setFormData] = useState<PuppyData>(
    puppy || {
      name: "",
      breed: "",
      birthdate: new Date().toISOString().split("T")[0],
      price: 0,
      description: "",
      status: "Available",
      weight: undefined,
      size: "",
      temperament: "",
      careNotes: "",
      motherName: "",
      fatherName: "",
      litterId: ""
    }
  );

  const [photoPreview, setPhotoPreview] = useState<string | null>(
    puppy?.photoUrl || null
  );

  const [age, setAge] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  useEffect(() => {
    if (formData.birthdate) {
      setAge(calculateAge(formData.birthdate));
    }
  }, [formData.birthdate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (name === "price" || name === "weight") {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Update age when birthdate changes
    if (name === "birthdate") {
      setAge(calculateAge(value));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload this to your server or cloud storage
      // For demo purposes, we're just creating a local URL
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreview(objectUrl);
      setFormData({
        ...formData,
        photoUrl: objectUrl // In real app, this would be the URL from your server
      });
    }
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    
    if (!templateId) return;
    
    const template = breedTemplates.find(t => t.id === templateId);
    if (template) {
      // Apply template values to form but keep existing values for name, price, status, etc.
      setFormData(prev => ({
        ...prev,
        breed: template.breedName,
        description: template.description || prev.description,
        size: template.size || prev.size,
        temperament: template.temperament || prev.temperament,
        careNotes: template.careInstructions || prev.careNotes
      }));
      
      toast.success(`Applied ${template.breedName} template`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate syncing with Square
    const willSyncToSquare = formData.status !== "Not For Sale";
    
    if (willSyncToSquare) {
      toast.success("Puppy data will be synced to Square inventory");
    }
    
    onSave({
      ...formData,
      squareStatus: willSyncToSquare ? "Synced" : "Not Synced"
    });
  };

  const isEditing = Boolean(puppy);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="animate-fade-in">
      <Button 
        variant="ghost" 
        onClick={onCancel}
        className="mb-6 hover:bg-gray-100"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Puppy List
      </Button>
      
      <Card className="shadow-lg border-t-4 border-t-brand-red">
        <CardHeader className="bg-gray-50 dark:bg-gray-900/20">
          <CardTitle className="text-2xl flex items-center">
            <Dog className="mr-2 h-6 w-6 text-brand-red" />
            {isEditing ? "Edit Puppy Details" : "Add New Puppy"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="mb-6">
              <label className="block text-lg font-medium mb-2">
                Apply Breed Template (Optional)
              </label>
              <select
                value={selectedTemplate}
                onChange={handleTemplateChange}
                className="w-full md:w-1/2 p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
              >
                <option value="">Select a template...</option>
                {breedTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.breedName}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Templates auto-fill breed-specific details
              </p>
            </div>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-lg font-medium">
                    Puppy Name
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter puppy name"
                    className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-lg font-medium">
                    Breed
                  </label>
                  <input
                    required
                    type="text"
                    name="breed"
                    value={formData.breed}
                    onChange={handleInputChange}
                    placeholder="Enter breed"
                    className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-lg font-medium flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-brand-red" />
                      Birthdate
                    </label>
                    <input
                      required
                      type="date"
                      name="birthdate"
                      max={today}
                      value={formData.birthdate}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                    {formData.birthdate && (
                      <div className="flex items-center mt-1">
                        <span className="text-sm font-medium mr-2">Age:</span>
                        <span className="text-sm bg-red-50 text-red-700 px-2 py-1 rounded-md">
                          {age}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-lg font-medium flex items-center">
                      <Scale className="mr-2 h-4 w-4 text-brand-red" />
                      Weight (lbs)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      min="0"
                      step="0.1"
                      value={formData.weight || ""}
                      onChange={handleInputChange}
                      placeholder="Current weight"
                      className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-lg font-medium">
                    Size
                  </label>
                  <select
                    name="size"
                    value={formData.size || ""}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                  >
                    <option value="">Select size...</option>
                    <option value="Toy">Toy</option>
                    <option value="Small">Small</option>
                    <option value="Medium">Medium</option>
                    <option value="Large">Large</option>
                    <option value="Giant">Giant</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-lg font-medium">
                    Price ($)
                  </label>
                  <input
                    required
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Enter price"
                    className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-lg font-medium">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                    <option value="Not For Sale">Not For Sale</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.status === "Not For Sale" ? 
                      "Puppy won't be synced to Square" : 
                      "Puppy will be synced to Square inventory"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-lg font-medium">
                    Litter (Optional)
                  </label>
                  <select
                    name="litterId"
                    value={formData.litterId || ""}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                  >
                    <option value="">No litter</option>
                    {litters.map(litter => (
                      <option key={litter.id} value={litter.id}>
                        {litter.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-lg font-medium">
                    Photo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center h-60 bg-gray-50 hover:bg-gray-100 transition">
                    {photoPreview ? (
                      <>
                        <img 
                          src={photoPreview} 
                          alt="Puppy preview" 
                          className="max-h-40 max-w-full object-contain mb-4" 
                        />
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => document.getElementById('photo-upload')?.click()}
                        >
                          Change Photo
                        </Button>
                      </>
                    ) : (
                      <>
                        <Image className="h-16 w-16 text-gray-400 mb-2" />
                        <p className="text-gray-500 text-center mb-4">
                          Click to upload a photo
                        </p>
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => document.getElementById('photo-upload')?.click()}
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Upload Photo
                        </Button>
                      </>
                    )}
                    <input
                      id="photo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-lg font-medium">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter a detailed description"
                    rows={3}
                    className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-lg font-medium">
                    Temperament
                  </label>
                  <input
                    type="text"
                    name="temperament"
                    value={formData.temperament || ""}
                    onChange={handleInputChange}
                    placeholder="E.g., Friendly, Playful, Calm"
                    className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-lg font-medium">
                    Care Notes
                  </label>
                  <textarea
                    name="careNotes"
                    value={formData.careNotes || ""}
                    onChange={handleInputChange}
                    placeholder="Special care instructions or notes"
                    rows={3}
                    className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-lg font-medium">
                      Mother's Name
                    </label>
                    <input
                      type="text"
                      name="motherName"
                      value={formData.motherName || ""}
                      onChange={handleInputChange}
                      placeholder="Mother's name"
                      className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-lg font-medium">
                      Father's Name
                    </label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName || ""}
                      onChange={handleInputChange}
                      placeholder="Father's name"
                      className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-brand-red hover:bg-red-700 text-white min-w-32"
              >
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? "Update Puppy" : "Add Puppy"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PuppyForm;
