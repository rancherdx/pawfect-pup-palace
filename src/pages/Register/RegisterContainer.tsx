import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import RegisterStep1 from "./RegisterStep1";
import RegisterStep2 from "./RegisterStep2";
import RegisterStep3 from "./RegisterStep3";
import RegisterStep4 from "./RegisterStep4";
import RegisterStep5 from "./RegisterStep5";

export default function RegisterContainer() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Step 2
    phone: "",
    secondaryEmail: "",
    preferredContact: "email",
    preferredName: "",
    profilePhotoUrl: "",
    // Step 3
    streetAddress: "",
    streetAddress2: "",
    city: "",
    state: "",
    zipCode: "",
    // Step 4
    homeType: "",
    hasKids: false,
    kidsAges: [] as Array<{ count: number; ageRange: string }>,
    hasOtherPets: false,
    otherPets: [] as Array<{ species: string; gender: string; breed: string; age: number; temperament: string }>,
    hasFencedYard: false,
    // Step 5
    healthGuaranteeLinkClicked: false,
    healthGuaranteeAcknowledged: false,
  });

  if (isAuthenticated) {
    navigate("/dashboard");
    return null;
  }

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleComplete = async () => {
    try {
      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: `${formData.firstName} ${formData.lastName}`,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed");

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone || null,
          secondary_email: formData.secondaryEmail || null,
          preferred_contact: formData.preferredContact || null,
          preferred_name: formData.preferredName || null,
          profile_photo_url: formData.profilePhotoUrl || null,
        })
        .eq("id", authData.user.id);

      if (profileError) throw profileError;

      // Create address
      const { error: addressError } = await supabase.from("user_addresses").insert({
        user_id: authData.user.id,
        street_address: formData.streetAddress,
        street_address_2: formData.streetAddress2 || null,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        validated_by_usps: true,
      });

      if (addressError) throw addressError;

      // Create adoption preferences
      const { error: preferencesError } = await supabase.from("adoption_preferences").insert({
        user_id: authData.user.id,
        home_type: formData.homeType || null,
        has_kids: formData.hasKids,
        kids_ages: formData.kidsAges.length > 0 ? formData.kidsAges : null,
        has_other_pets: formData.hasOtherPets,
        other_pets: formData.otherPets.length > 0 ? formData.otherPets : null,
        has_fenced_yard: formData.hasFencedYard,
        health_guarantee_acknowledged: formData.healthGuaranteeAcknowledged,
        health_guarantee_acknowledged_at: new Date().toISOString(),
      });

      if (preferencesError) throw preferencesError;

      toast.success("Registration successful! Welcome to GDS Puppies!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error instanceof Error ? error.message : "Registration failed. Please try again.");
    }
  };

  const progress = (currentStep / 5) * 100;

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-2xl">
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep} of 5</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {currentStep === 1 && (
            <RegisterStep1
              data={formData}
              onUpdate={updateFormData}
              onNext={() => setCurrentStep(2)}
            />
          )}
          {currentStep === 2 && (
            <RegisterStep2
              data={formData}
              onUpdate={updateFormData}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <RegisterStep3
              data={formData}
              onUpdate={updateFormData}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}
          {currentStep === 4 && (
            <RegisterStep4
              data={formData}
              onUpdate={updateFormData}
              onNext={() => setCurrentStep(5)}
              onBack={() => setCurrentStep(3)}
            />
          )}
          {currentStep === 5 && (
            <RegisterStep5
              data={formData}
              onUpdate={updateFormData}
              onBack={() => setCurrentStep(4)}
              onComplete={handleComplete}
            />
          )}
        </CardContent>
        <CardFooter className="justify-center border-t pt-6">
          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
