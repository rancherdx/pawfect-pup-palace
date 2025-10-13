import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CheckCircle2, ExternalLink } from "lucide-react";

interface RegisterStep5Props {
  data: {
    healthGuaranteeLinkClicked: boolean;
    healthGuaranteeAcknowledged: boolean;
  };
  onUpdate: (data: Partial<RegisterStep5Props["data"]>) => void;
  onBack: () => void;
  onComplete: () => void;
}

export default function RegisterStep5({ data, onUpdate, onBack, onComplete }: RegisterStep5Props) {
  const [submitting, setSubmitting] = useState(false);

  const handleLinkClick = () => {
    onUpdate({ healthGuaranteeLinkClicked: true });
    window.open("/health-guarantee", "_blank");
  };

  const handleSubmit = async () => {
    if (!data.healthGuaranteeLinkClicked || !data.healthGuaranteeAcknowledged) {
      return;
    }
    setSubmitting(true);
    await onComplete();
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Health Guarantee</h2>
        <p className="text-muted-foreground mt-2">Please review and acknowledge our health guarantee</p>
      </div>

      <div className="space-y-4">
        <div className="p-6 border-2 border-primary rounded-lg bg-primary/5">
          <h3 className="font-semibold text-lg mb-4">Our Commitment to You</h3>
          <p className="text-sm text-muted-foreground mb-4">
            At GDS Puppies, we stand behind the health and quality of every puppy we place. 
            Our comprehensive health guarantee protects you and ensures your new companion 
            gets the best start in life.
          </p>
          
          <Button
            variant="outline"
            onClick={handleLinkClick}
            className="w-full"
          >
            {data.healthGuaranteeLinkClicked && <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />}
            Read Full Health Guarantee
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>

          {!data.healthGuaranteeLinkClicked && (
            <p className="text-xs text-muted-foreground mt-2 text-center">
              You must open and review the health guarantee to continue
            </p>
          )}
        </div>

        <div className="flex items-start space-x-3 p-4 border rounded-lg">
          <Checkbox
            id="acknowledge"
            checked={data.healthGuaranteeAcknowledged}
            onCheckedChange={(checked) => onUpdate({ healthGuaranteeAcknowledged: !!checked })}
            disabled={!data.healthGuaranteeLinkClicked}
            className="mt-1"
          />
          <div className="flex-1">
            <Label 
              htmlFor="acknowledge" 
              className={`cursor-pointer ${!data.healthGuaranteeLinkClicked ? 'opacity-50' : ''}`}
            >
              I have read and acknowledge the GDS Puppies Health Guarantee
            </Label>
            <p className="text-xs text-muted-foreground mt-1">
              By checking this box, you confirm that you have reviewed and understand the 
              terms of our health guarantee. The timestamp of your acknowledgment will be 
              recorded for your protection.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={onBack} variant="outline" className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button 
          onClick={handleSubmit} 
          className="flex-1"
          disabled={!data.healthGuaranteeLinkClicked || !data.healthGuaranteeAcknowledged || submitting}
        >
          {submitting ? "Creating Account..." : "Complete Registration"}
        </Button>
      </div>
    </div>
  );
}
