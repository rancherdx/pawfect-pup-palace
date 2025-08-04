import { useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdoptionQuestionsProps {
  data: Record<string, unknown>;
  onDataChange: (data: Record<string, unknown>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

const AdoptionQuestions = ({ data, onDataChange, onNext, onPrevious }: AdoptionQuestionsProps) => {
  const [formData, setFormData] = useState({
    firstName: (data.firstName as string) || "",
    lastName: (data.lastName as string) || "",
    email: (data.email as string) || "",
    phone: (data.phone as string) || "",
    housingType: (data.housingType as string) || "",
    hasYard: (data.hasYard as string) || "no",
    hasChildren: (data.hasChildren as string) || "no",
    childrenAges: (data.childrenAges as string) || "",
    hasPets: (data.hasPets as string) || "no",
    existingPets: (data.existingPets as string) || "",
    workSchedule: (data.workSchedule as string) || "",
    experience: (data.experience as string) || "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Basic validation
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phone) newErrors.phone = "Phone number is required";
    if (!formData.housingType) newErrors.housingType = "Housing type is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onDataChange(formData);
      onNext();
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6">Adoption Questions</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Personal Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input 
                  id="firstName" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && <p className="text-red-500 text-xs">{errors.firstName}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input 
                  id="lastName" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && <p className="text-red-500 text-xs">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  type="tel" 
                  value={formData.phone} 
                  onChange={handleChange}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && <p className="text-red-500 text-xs">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Home Environment */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Home Environment</h3>
            
            <div className="space-y-2">
              <Label htmlFor="housingType">Housing Type *</Label>
              <Select 
                value={formData.housingType} 
                onValueChange={(value) => handleSelectChange("housingType", value)}
              >
                <SelectTrigger id="housingType" className={errors.housingType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select housing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.housingType && <p className="text-red-500 text-xs">{errors.housingType}</p>}
            </div>

            <div className="space-y-2">
              <Label>Do you have a fenced yard?</Label>
              <RadioGroup 
                value={formData.hasYard} 
                onValueChange={(value) => handleSelectChange("hasYard", value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="yard-yes" />
                  <Label htmlFor="yard-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="yard-no" />
                  <Label htmlFor="yard-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Do you have children?</Label>
              <RadioGroup 
                value={formData.hasChildren} 
                onValueChange={(value) => handleSelectChange("hasChildren", value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="children-yes" />
                  <Label htmlFor="children-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="children-no" />
                  <Label htmlFor="children-no">No</Label>
                </div>
              </RadioGroup>
            </div>
            
            {formData.hasChildren === "yes" && (
              <div className="space-y-2">
                <Label htmlFor="childrenAges">Ages of children</Label>
                <Input 
                  id="childrenAges" 
                  name="childrenAges" 
                  value={formData.childrenAges} 
                  onChange={handleChange}
                  placeholder="e.g., 5, 8, 12"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Do you have other pets?</Label>
              <RadioGroup 
                value={formData.hasPets} 
                onValueChange={(value) => handleSelectChange("hasPets", value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="pets-yes" />
                  <Label htmlFor="pets-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="pets-no" />
                  <Label htmlFor="pets-no">No</Label>
                </div>
              </RadioGroup>
            </div>
            
            {formData.hasPets === "yes" && (
              <div className="space-y-2">
                <Label htmlFor="existingPets">Please describe your existing pets</Label>
                <Textarea 
                  id="existingPets" 
                  name="existingPets" 
                  value={formData.existingPets} 
                  onChange={handleChange}
                  placeholder="Types, breeds, ages, etc."
                  rows={2}
                />
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium border-b pb-2">Additional Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="workSchedule">What is your typical work schedule?</Label>
              <Textarea 
                id="workSchedule" 
                name="workSchedule" 
                value={formData.workSchedule}
                onChange={handleChange}
                placeholder="Please describe your work hours and arrangements for pet care"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="experience">Previous experience with dogs</Label>
              <Textarea 
                id="experience" 
                name="experience" 
                value={formData.experience} 
                onChange={handleChange}
                placeholder="Please describe your previous experience with dogs, if any"
                rows={2}
              />
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onPrevious}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            <Button 
              type="submit" 
              className="bg-brand-red hover:bg-red-700 text-white"
            >
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdoptionQuestions;
