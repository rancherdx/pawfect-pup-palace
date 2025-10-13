import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RegisterStep3Props {
  data: {
    streetAddress: string;
    streetAddress2: string;
    city: string;
    state: string;
    zipCode: string;
  };
  onUpdate: (data: Partial<RegisterStep3Props["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function RegisterStep3({ data, onUpdate, onNext, onBack }: RegisterStep3Props) {
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAddress = async () => {
    const newErrors: Record<string, string> = {};

    if (!data.streetAddress.trim()) newErrors.streetAddress = "Street address is required";
    if (!data.city.trim()) newErrors.city = "City is required";
    if (!data.state.trim()) newErrors.state = "State is required";
    if (!data.zipCode.trim()) newErrors.zipCode = "ZIP code is required";
    if (!/^\d{5}(-\d{4})?$/.test(data.zipCode)) newErrors.zipCode = "Invalid ZIP code format";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setValidating(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("usps-address-validation", {
        body: {
          street_address: data.streetAddress,
          street_address_2: data.streetAddress2,
          city: data.city,
          state: data.state,
          zip_code: data.zipCode,
        },
      });

      if (error) throw error;

      if (result.validated) {
        setValidated(true);
        toast.success("Address validated successfully");
        // Update with standardized address
        if (result.standardized) {
          onUpdate(result.standardized);
        }
      } else {
        toast.error("Could not validate address. Please check your entry.");
      }
    } catch (error) {
      console.error("Validation error:", error);
      toast.error("Address validation unavailable. You can still continue.");
      setValidated(true); // Allow them to continue anyway
    } finally {
      setValidating(false);
    }
  };

  const handleNext = () => {
    if (!validated) {
      toast.error("Please validate your address first");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Your Address</h2>
        <p className="text-muted-foreground mt-2">We'll validate this with USPS for accuracy</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="streetAddress">Street Address *</Label>
          <Input
            id="streetAddress"
            placeholder="123 Main Street"
            value={data.streetAddress}
            onChange={(e) => {
              onUpdate({ streetAddress: e.target.value });
              setValidated(false);
            }}
            className={errors.streetAddress ? "border-destructive" : ""}
          />
          {errors.streetAddress && <p className="text-sm text-destructive">{errors.streetAddress}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="streetAddress2">Apartment, Suite, etc. (Optional)</Label>
          <Input
            id="streetAddress2"
            placeholder="Apt 4B"
            value={data.streetAddress2}
            onChange={(e) => {
              onUpdate({ streetAddress2: e.target.value });
              setValidated(false);
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              placeholder="San Francisco"
              value={data.city}
              onChange={(e) => {
                onUpdate({ city: e.target.value });
                setValidated(false);
              }}
              className={errors.city ? "border-destructive" : ""}
            />
            {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              placeholder="CA"
              maxLength={2}
              value={data.state}
              onChange={(e) => {
                onUpdate({ state: e.target.value.toUpperCase() });
                setValidated(false);
              }}
              className={errors.state ? "border-destructive" : ""}
            />
            {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">ZIP Code *</Label>
          <Input
            id="zipCode"
            placeholder="94102"
            value={data.zipCode}
            onChange={(e) => {
              onUpdate({ zipCode: e.target.value });
              setValidated(false);
            }}
            className={errors.zipCode ? "border-destructive" : ""}
          />
          {errors.zipCode && <p className="text-sm text-destructive">{errors.zipCode}</p>}
        </div>

        <Button
          onClick={validateAddress}
          disabled={validating || validated}
          variant={validated ? "outline" : "default"}
          className="w-full"
        >
          {validating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Validating...
            </>
          ) : validated ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              Address Validated
            </>
          ) : (
            "Validate Address"
          )}
        </Button>
      </div>

      <div className="flex gap-4">
        <Button onClick={onBack} variant="outline" className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={handleNext} className="flex-1" disabled={!validated}>
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
