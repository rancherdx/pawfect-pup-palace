
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Image, PlusCircle } from "lucide-react";

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
};

type PuppyFormProps = {
  puppy?: PuppyData;
  onSave: (puppy: PuppyData) => void;
  onCancel: () => void;
};

const PuppyForm = ({ puppy, onSave, onCancel }: PuppyFormProps) => {
  const [formData, setFormData] = useState<PuppyData>(
    puppy || {
      name: "",
      breed: "",
      birthdate: new Date().toISOString().split("T")[0],
      price: 0,
      description: "",
      status: "Available"
    }
  );

  const [photoPreview, setPhotoPreview] = useState<string | null>(
    puppy?.photoUrl || null
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Handle price as number
    if (name === "price") {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isEditing = Boolean(puppy);

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
            {isEditing ? "Edit Puppy Details" : "Add New Puppy"}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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

                <div className="space-y-2">
                  <label className="block text-lg font-medium">
                    Birthdate
                  </label>
                  <input
                    required
                    type="date"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
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
                    rows={5}
                    className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
                  />
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
