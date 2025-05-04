
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";

// Mock puppy data for selected puppy
const puppiesData = [
  {
    id: "1",
    name: "Bella",
    breed: "Golden Retriever",
    age: "8 weeks",
    gender: "Female",
    image: "https://images.unsplash.com/photo-1615233500064-caa995e2f9dd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
  },
  // Add more puppies as needed
];

const AdoptionProcess = () => {
  const steps = [
    {
      title: "Complete the Application",
      description: "Fill out our comprehensive adoption application to help us understand your home environment and lifestyle.",
    },
    {
      title: "Application Review",
      description: "Our team will review your application and contact you within 24-48 hours to discuss next steps.",
    },
    {
      title: "Meet the Puppy",
      description: "Schedule a visit to meet your potential new family member in person or via video call.",
    },
    {
      title: "Adoption Fee & Contract",
      description: "Upon approval, you'll pay the adoption fee and sign our adoption contract, which includes our health guarantee.",
    },
    {
      title: "Take Your Puppy Home",
      description: "Once all steps are complete, you can welcome your new puppy to their forever home!",
    },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold">The Adoption Process</h2>
      
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mt-1">
              <span className="font-semibold text-primary">{index + 1}</span>
            </div>
            <div>
              <h3 className="text-lg font-medium">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Adopt = () => {
  const [searchParams] = useSearchParams();
  const puppyId = searchParams.get("puppy");
  const selectedPuppy = puppiesData.find(p => p.id === puppyId);
  
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    housingType: "",
    hasYard: false,
    hasChildren: false,
    hasPets: false,
    existingPets: "",
    experience: "",
    referral: "",
    additionalInfo: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    
    // Show success toast
    toast({
      title: "Application Submitted!",
      description: "We've received your adoption application and will be in touch soon.",
    });
  };

  return (
    <div>
      <HeroSection
        title="Adopt a Puppy"
        subtitle="Start your journey to bringing a new puppy into your home"
        imageSrc="https://images.unsplash.com/photo-1560807707-8cc77767d783?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
        ctaText="View Available Puppies"
        ctaLink="/puppies"
      />

      <Section withPawPrintBg>
        <AdoptionProcess />
      </Section>

      <Section title="Adoption Application" className="bg-secondary">
        <form onSubmit={handleSubmit} className="space-y-8">
          {selectedPuppy && (
            <Card>
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full overflow-hidden">
                  <img 
                    src={selectedPuppy.image} 
                    alt={selectedPuppy.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium">You're applying to adopt {selectedPuppy.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedPuppy.breed} • {selectedPuppy.age} • {selectedPuppy.gender}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Personal Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input 
                  id="firstName" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input 
                  id="lastName" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  required 
                />
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
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  type="tel" 
                  value={formData.phone} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input 
                id="address" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input 
                  id="city" 
                  name="city" 
                  value={formData.city} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input 
                  id="state" 
                  name="state" 
                  value={formData.state} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code *</Label>
                <Input 
                  id="zip" 
                  name="zip" 
                  value={formData.zip} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Home Environment */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Home Environment</h3>
            
            <div className="space-y-2">
              <Label htmlFor="housingType">Housing Type *</Label>
              <Select 
                value={formData.housingType} 
                onValueChange={(value) => handleSelectChange("housingType", value)}
              >
                <SelectTrigger id="housingType">
                  <SelectValue placeholder="Select housing type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="condo">Condo</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hasYard" 
                  checked={formData.hasYard}
                  onCheckedChange={(checked) => handleCheckboxChange("hasYard", checked === true)}
                />
                <Label htmlFor="hasYard">Do you have a fenced yard?</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hasChildren" 
                  checked={formData.hasChildren}
                  onCheckedChange={(checked) => handleCheckboxChange("hasChildren", checked === true)}
                />
                <Label htmlFor="hasChildren">Do you have children at home?</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="hasPets" 
                  checked={formData.hasPets}
                  onCheckedChange={(checked) => handleCheckboxChange("hasPets", checked === true)}
                />
                <Label htmlFor="hasPets">Do you have other pets?</Label>
              </div>
            </div>

            {formData.hasPets && (
              <div className="space-y-2">
                <Label htmlFor="existingPets">Please describe your existing pets</Label>
                <Textarea 
                  id="existingPets" 
                  name="existingPets" 
                  value={formData.existingPets} 
                  onChange={handleChange} 
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Additional Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="experience">Previous experience with dogs</Label>
              <Textarea 
                id="experience" 
                name="experience" 
                value={formData.experience} 
                onChange={handleChange} 
                rows={3}
                placeholder="Please describe your previous experience with dogs, if any."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="referral">How did you hear about us?</Label>
              <Input 
                id="referral" 
                name="referral" 
                value={formData.referral} 
                onChange={handleChange} 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Anything else you'd like us to know?</Label>
              <Textarea 
                id="additionalInfo" 
                name="additionalInfo" 
                value={formData.additionalInfo} 
                onChange={handleChange} 
                rows={4}
                placeholder="Share any additional information that might be relevant to your application."
              />
            </div>
          </div>

          <div className="flex justify-center">
            <Button type="submit" size="lg" className="bg-brand-red hover:bg-red-700">
              <PawPrint className="mr-2 h-5 w-5" />
              Submit Application
            </Button>
          </div>
        </form>
      </Section>
    </div>
  );
};

export default Adopt;
