import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import HeroSection from "@/components/HeroSection";
import Section from "@/components/Section";
import { supabase } from "@/integrations/supabase/client";
import { calculateAge } from "@/utils/dateUtils";
import { useQuery } from "@tanstack/react-query";
import { Puppy } from "@/types/api";

const AdoptionProcess = () => {
  const steps = [
    { title: "Complete the Application", description: "Fill out our comprehensive adoption application to help us understand your home environment and lifestyle." },
    { title: "Application Review", description: "Our team will review your application and contact you within 24-48 hours to discuss next steps." },
    { title: "Meet the Puppy", description: "Schedule a visit to meet your potential new family member in person or via video call." },
    { title: "Adoption Fee & Contract", description: "Upon approval, you'll pay the adoption fee and sign our adoption contract, which includes our health guarantee." },
    { title: "Take Your Puppy Home", description: "Once all steps are complete, you can welcome your new puppy to their forever home!" },
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

const adoptionFormSchema = z.object({
  firstName: z.string().min(2, "First name is required."),
  lastName: z.string().min(2, "Last name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(10, "A valid phone number is required."),
  address: z.string().min(5, "Address is required."),
  city: z.string().min(2, "City is required."),
  state: z.string().min(2, "State is required."),
  zip: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code."),
  housingType: z.string().min(1, "Please select a housing type."),
  hasYard: z.boolean().default(false),
  hasChildren: z.boolean().default(false),
  hasPets: z.boolean().default(false),
  existingPets: z.string().optional(),
  experience: z.string().optional(),
  referral: z.string().optional(),
  additionalInfo: z.string().optional(),
}).refine(data => !data.hasPets || (data.hasPets && data.existingPets && data.existingPets.length > 5), {
  message: "Please describe your existing pets.",
  path: ["existingPets"],
});

type AdoptionFormData = z.infer<typeof adoptionFormSchema>;

const Adopt = () => {
  const [searchParams] = useSearchParams();
  const puppyId = searchParams.get("puppy");
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: selectedPuppy } = useQuery<Puppy, Error>({
    queryKey: ['puppy', puppyId],
    queryFn: async () => {
      const { data, error } = await supabase.from('puppies').select('*').eq('id', puppyId!).single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!puppyId,
  });

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<AdoptionFormData>({
    resolver: zodResolver(adoptionFormSchema),
    defaultValues: {
      hasYard: false,
      hasChildren: false,
      hasPets: false,
    }
  });

  const hasPetsValue = watch("hasPets");

  const onSubmit = (data: AdoptionFormData) => {
    if (process.env.NODE_ENV === 'development') {
      console.log("[DEV] Adoption form submitted:", data);
    }
    toast({
      title: "Application Submitted!",
      description: "We've received your adoption application and will be in touch soon.",
    });
    if (selectedPuppy) {
      navigate(`/checkout?puppy=${selectedPuppy.id}`);
    } else {
      navigate('/checkout');
    }
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

      <Section withPawPrintBg><AdoptionProcess /></Section>

      <Section title="Adoption Application" className="bg-secondary">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {selectedPuppy && (
            <Card>
              <CardContent className="p-6 flex items-center space-x-4">
                <div className="w-20 h-20 rounded-full overflow-hidden">
                  <img src={selectedPuppy.image_urls?.[0] || selectedPuppy.photo_url || "https://images.unsplash.com/photo-1591160690555-5debfba289f0?ixlib=rb-4.0.3"} alt={selectedPuppy.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">You're applying to adopt {selectedPuppy.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedPuppy.breed} • {calculateAge(selectedPuppy.birth_date || "")} • {selectedPuppy.gender}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label htmlFor="firstName">First Name *</Label><Input id="firstName" {...register("firstName")} />{errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}</div>
              <div><Label htmlFor="lastName">Last Name *</Label><Input id="lastName" {...register("lastName")} />{errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><Label htmlFor="email">Email *</Label><Input id="email" type="email" {...register("email")} />{errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}</div>
              <div><Label htmlFor="phone">Phone Number *</Label><Input id="phone" type="tel" {...register("phone")} />{errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}</div>
            </div>
            <div><Label htmlFor="address">Address *</Label><Input id="address" {...register("address")} />{errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div><Label htmlFor="city">City *</Label><Input id="city" {...register("city")} />{errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}</div>
              <div><Label htmlFor="state">State *</Label><Input id="state" {...register("state")} />{errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}</div>
              <div><Label htmlFor="zip">ZIP Code *</Label><Input id="zip" {...register("zip")} />{errors.zip && <p className="text-red-500 text-sm mt-1">{errors.zip.message}</p>}</div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Home Environment</h3>
            <div>
              <Label htmlFor="housingType">Housing Type *</Label>
              <Controller name="housingType" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="housingType"><SelectValue placeholder="Select housing type" /></SelectTrigger>
                  <SelectContent><SelectItem value="house">House</SelectItem><SelectItem value="apartment">Apartment</SelectItem><SelectItem value="condo">Condo</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                </Select>
              )} />
              {errors.housingType && <p className="text-red-500 text-sm mt-1">{errors.housingType.message}</p>}
            </div>
            <div className="space-y-2">
              <Controller name="hasYard" control={control} render={({ field }) => (<div className="flex items-center space-x-2"><Checkbox id="hasYard" checked={field.value} onCheckedChange={field.onChange} /><Label htmlFor="hasYard">Do you have a fenced yard?</Label></div>)} />
              <Controller name="hasChildren" control={control} render={({ field }) => (<div className="flex items-center space-x-2"><Checkbox id="hasChildren" checked={field.value} onCheckedChange={field.onChange} /><Label htmlFor="hasChildren">Do you have children at home?</Label></div>)} />
              <Controller name="hasPets" control={control} render={({ field }) => (<div className="flex items-center space-x-2"><Checkbox id="hasPets" checked={field.value} onCheckedChange={field.onChange} /><Label htmlFor="hasPets">Do you have other pets?</Label></div>)} />
            </div>
            {hasPetsValue && (
              <div><Label htmlFor="existingPets">Please describe your existing pets</Label><Textarea id="existingPets" {...register("existingPets")} rows={3} />{errors.existingPets && <p className="text-red-500 text-sm mt-1">{errors.existingPets.message}</p>}</div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Additional Information</h3>
            <div><Label htmlFor="experience">Previous experience with dogs</Label><Textarea id="experience" {...register("experience")} rows={3} placeholder="Please describe your previous experience with dogs, if any." /></div>
            <div><Label htmlFor="referral">How did you hear about us?</Label><Input id="referral" {...register("referral")} /></div>
            <div><Label htmlFor="additionalInfo">Anything else you'd like us to know?</Label><Textarea id="additionalInfo" {...register("additionalInfo")} rows={4} placeholder="Share any additional information that might be relevant to your application." /></div>
          </div>

          <div className="flex justify-center">
            <Button type="submit" size="lg" className="bg-brand-red hover:bg-red-700">
              <PawPrint className="mr-2 h-5 w-5" />
              Continue to Checkout
            </Button>
          </div>
        </form>
      </Section>
    </div>
  );
};

export default Adopt;