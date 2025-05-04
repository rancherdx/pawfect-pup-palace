
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash, Search, Dog, Save } from "lucide-react";
import { toast } from "sonner";
import { BreedTemplate } from "@/types/breedTemplate";

// Mock data for demo purposes
const initialTemplates: BreedTemplate[] = [
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
    },
    photo: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?q=80&w=600"
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
    },
    photo: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=600"
  }
];

const BreedTemplateManager = () => {
  const [templates, setTemplates] = useState<BreedTemplate[]>(initialTemplates);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingTemplate, setEditingTemplate] = useState<BreedTemplate | null>(null);
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  
  const [formData, setFormData] = useState<BreedTemplate>({
    id: "",
    breedName: "",
    description: "",
    size: "Medium",
    temperament: "",
    careInstructions: "",
    commonTraits: [],
    averageWeight: {
      min: 0,
      max: 0
    }
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "min" || name === "max") {
      setFormData({
        ...formData,
        averageWeight: {
          ...formData.averageWeight,
          [name]: parseInt(value) || 0
        }
      });
    } else if (name === "commonTraits") {
      setFormData({
        ...formData,
        commonTraits: value.split(',').map(trait => trait.trim())
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleAddTemplate = () => {
    setIsAddingTemplate(true);
    setEditingTemplate(null);
    setFormData({
      id: "",
      breedName: "",
      description: "",
      size: "Medium",
      temperament: "",
      careInstructions: "",
      commonTraits: [],
      averageWeight: {
        min: 0,
        max: 0
      }
    });
  };

  const handleEditTemplate = (template: BreedTemplate) => {
    setEditingTemplate(template);
    setIsAddingTemplate(false);
    setFormData({...template});
  };

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm("Are you sure you want to delete this breed template?")) {
      setTemplates(templates.filter(template => template.id !== id));
      toast.success("Breed template deleted successfully");
    }
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTemplate) {
      // Update existing template
      setTemplates(templates.map(template => 
        template.id === editingTemplate.id ? { ...formData, id: editingTemplate.id } : template
      ));
      toast.success("Breed template updated successfully");
    } else {
      // Add new template
      const newTemplate = {
        ...formData,
        id: String(Date.now())
      };
      setTemplates([...templates, newTemplate]);
      toast.success("Breed template added successfully");
    }
    
    // Reset form
    setEditingTemplate(null);
    setIsAddingTemplate(false);
  };

  const filteredTemplates = templates.filter(template => 
    template.breedName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold flex items-center">
          <Dog className="mr-2 h-8 w-8 text-brand-red" />
          Breed Templates
        </h2>
        
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-brand-red"
            />
          </div>
          
          <Button 
            onClick={handleAddTemplate}
            className="bg-brand-red hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Template
          </Button>
        </div>
      </div>
      
      {(isAddingTemplate || editingTemplate) ? (
        <Card className="shadow-lg border-t-4 border-t-brand-red">
          <CardHeader className="bg-gray-50 dark:bg-gray-900/20">
            <CardTitle className="text-2xl">
              {editingTemplate ? "Edit Breed Template" : "Add New Breed Template"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={handleSaveTemplate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-lg font-medium mb-1">
                      Breed Name
                    </label>
                    <input
                      required
                      type="text"
                      name="breedName"
                      value={formData.breedName}
                      onChange={handleInputChange}
                      placeholder="Enter breed name"
                      className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg font-medium mb-1">
                      Size
                    </label>
                    <select
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    >
                      <option value="Toy">Toy</option>
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                      <option value="Large">Large</option>
                      <option value="Giant">Giant</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-lg font-medium mb-1">
                      Temperament
                    </label>
                    <input
                      type="text"
                      name="temperament"
                      value={formData.temperament}
                      onChange={handleInputChange}
                      placeholder="E.g., Friendly, Playful, Calm"
                      className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg font-medium mb-1">
                      Common Traits (comma separated)
                    </label>
                    <input
                      type="text"
                      name="commonTraits"
                      value={formData.commonTraits.join(", ")}
                      onChange={handleInputChange}
                      placeholder="E.g., Loyal, Smart, Active"
                      className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-lg font-medium mb-1">
                        Min Weight (lbs)
                      </label>
                      <input
                        type="number"
                        name="min"
                        min="0"
                        value={formData.averageWeight.min}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-lg font-medium mb-1">
                        Max Weight (lbs)
                      </label>
                      <input
                        type="number"
                        name="max"
                        min="0"
                        value={formData.averageWeight.max}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-lg font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter a detailed description of the breed"
                      rows={3}
                      className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg font-medium mb-1">
                      Care Instructions
                    </label>
                    <textarea
                      name="careInstructions"
                      value={formData.careInstructions}
                      onChange={handleInputChange}
                      placeholder="Enter care instructions for this breed"
                      rows={3}
                      className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg font-medium mb-1">
                      Photo URL
                    </label>
                    <input
                      type="text"
                      name="photo"
                      value={formData.photo || ""}
                      onChange={handleInputChange}
                      placeholder="Enter photo URL"
                      className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                    {formData.photo && (
                      <div className="mt-2 border rounded-lg p-2 bg-gray-50">
                        <img 
                          src={formData.photo} 
                          alt={formData.breedName} 
                          className="h-32 object-cover rounded-lg mx-auto" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddingTemplate(false);
                    setEditingTemplate(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-brand-red hover:bg-red-700 text-white min-w-32"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {editingTemplate ? "Update Template" : "Save Template"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <Dog className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Breed Templates Found</h3>
              <p className="text-gray-500 mb-4">Add your first breed template to get started</p>
              <Button 
                onClick={handleAddTemplate}
                className="bg-brand-red hover:bg-red-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Template
              </Button>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <Card key={template.id} className="shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                {template.photo ? (
                  <div className="h-40 overflow-hidden">
                    <img 
                      src={template.photo}
                      alt={template.breedName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-20 bg-gradient-to-r from-brand-red to-red-400"></div>
                )}
                
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-xl truncate">{template.breedName}</h3>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Size:</span>
                      <span className="font-medium">{template.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Weight:</span>
                      <span className="font-medium">{template.averageWeight.min}-{template.averageWeight.max} lbs</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mt-2">{template.description}</p>
                    
                    {template.commonTraits.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1">
                        {template.commonTraits.map((trait, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
      
      {!isAddingTemplate && !editingTemplate && filteredTemplates.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 border border-dashed border-gray-300 mt-6">
          <h3 className="font-medium">Breed Templates Tips:</h3>
          <ul className="mt-2 text-sm text-gray-600 space-y-1">
            <li>• Create templates for breeds you commonly work with to save time when adding puppies.</li>
            <li>• Templates can be applied when adding a new puppy to auto-fill breed-specific details.</li>
            <li>• Include detailed care instructions to help new owners.</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default BreedTemplateManager;
