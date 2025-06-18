
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LitterCreationData, LitterStatus } from "@/types";

const LITTER_STATUS_VALUES: LitterStatus[] = ["Active", "Available Soon", "All Reserved", "All Sold", "Archived"];

interface LitterFormProps {
  formData: LitterCreationData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

const LitterForm: React.FC<LitterFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  onCancel,
  isEditing
}) => {
  return (
    <Card className="shadow-lg border-t-4 border-t-brand-red animate-fade-in">
      <CardHeader className="bg-gray-50 dark:bg-gray-900/20">
        <CardTitle className="text-2xl">
          {isEditing ? "Edit Litter" : "Add New Litter"}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-medium mb-1">
                  Litter Name
                </label>
                <input
                  required
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onInputChange}
                  placeholder="Enter litter name"
                  className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-1">
                  Dam (Mother's Name)
                </label>
                <input
                  required
                  type="text"
                  name="damName"
                  value={formData.damName}
                  onChange={onInputChange}
                  placeholder="Enter dam's name"
                  className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-1">
                  Sire (Father's Name)
                </label>
                <input
                  required
                  type="text"
                  name="sireName"
                  value={formData.sireName}
                  onChange={onInputChange}
                  placeholder="Enter sire's name"
                  className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-medium mb-1">
                  Breed
                </label>
                <input
                  required
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={onInputChange}
                  placeholder="Enter breed"
                  className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>
              
              <div>
                <label className="block text-lg font-medium mb-1">
                  Date of Birth
                </label>
                <input
                  required
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={onInputChange}
                  className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-lg font-medium mb-1">
                    Number of Puppies
                  </label>
                  <input
                    required
                    type="number"
                    name="puppyCount"
                    min="1"
                    value={formData.puppyCount}
                    onChange={onInputChange}
                    placeholder="0"
                    className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>
                
                <div>
                  <label className="block text-lg font-medium mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={onInputChange}
                    className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                  >
                    {LITTER_STATUS_VALUES.map(statusValue => (
                      <option key={statusValue} value={statusValue}>{statusValue}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-lg font-medium mb-1">
                  Expected Date (Optional)
                </label>
                <input
                  type="date"
                  name="expectedDate"
                  value={formData.expectedDate || ""}
                  onChange={onInputChange}
                  className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>
              
              <div>
                <label className="block text-lg font-medium mb-1">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={onInputChange}
                  placeholder="Brief description of the litter"
                  rows={3}
                  className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
                />
              </div>
              
              <div>
                <label className="block text-lg font-medium mb-1">
                  Cover Image URL (Optional)
                </label>
                <input
                  type="text"
                  name="coverImageUrl"
                  value={formData.coverImageUrl || ""}
                  onChange={onInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full p-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
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
              {isEditing ? "Update Litter" : "Create Litter"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LitterForm;
