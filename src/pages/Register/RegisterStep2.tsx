import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, ArrowLeft, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RegisterStep2Props {
  data: {
    phone: string;
    secondaryEmail: string;
    preferredContact: string;
    preferredName: string;
    profilePhotoUrl: string;
  };
  onUpdate: (data: Partial<RegisterStep2Props["data"]>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function RegisterStep2({ data, onUpdate, onNext, onBack }: RegisterStep2Props) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("puppy-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("puppy-images")
        .getPublicUrl(filePath);

      onUpdate({ profilePhotoUrl: publicUrl });
      toast.success("Photo uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = () => {
    onUpdate({ profilePhotoUrl: "" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Complete Your Profile</h2>
        <p className="text-muted-foreground mt-2">Help us personalize your experience</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Profile Photo (Optional)</Label>
          {data.profilePhotoUrl ? (
            <div className="relative w-32 h-32 mx-auto">
              <img
                src={data.profilePhotoUrl}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-4 border-border"
              />
              <button
                onClick={removePhoto}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-32 h-32 rounded-full border-2 border-dashed border-border flex flex-col items-center justify-center hover:border-primary transition-colors"
              >
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">
                  {uploading ? "Uploading..." : "Upload Photo"}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={data.phone}
            onChange={(e) => onUpdate({ phone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="secondaryEmail">Secondary Email (Optional)</Label>
          <Input
            id="secondaryEmail"
            type="email"
            placeholder="alternate@example.com"
            value={data.secondaryEmail}
            onChange={(e) => onUpdate({ secondaryEmail: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredContact">Preferred Contact Method</Label>
          <Select value={data.preferredContact} onValueChange={(value) => onUpdate({ preferredContact: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select contact method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preferredName">Preferred Name (Optional)</Label>
          <Input
            id="preferredName"
            placeholder="What should we call you?"
            value={data.preferredName}
            onChange={(e) => onUpdate({ preferredName: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">How you'd like to be addressed in communications</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={onBack} variant="outline" className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
