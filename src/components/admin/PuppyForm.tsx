import { useState, useEffect } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/api";
import {
  Puppy,
  PuppyCreationData,
  PuppyUpdateData,
  PuppyStatus,
  PuppySize,
} from "@/types";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploadWithCrop from "../media/ImageUploadWithCrop";

// Define a type for the form data that includes all the fields
type PuppyFormData = Omit<PuppyCreationData, "status" | "size"> & {
  status: PuppyStatus;
  size: PuppySize;
};

interface PuppyFormProps {
  puppy?: Puppy;
  onClose: () => void;
  isEditMode?: boolean;
}

const PUPPY_SIZE_VALUES: PuppySize[] = ["Toy", "Small", "Medium", "Large", "Giant", ""];
const PUPPY_STATUS_VALUES: PuppyStatus[] = ["Available", "Reserved", "Sold", "Not For Sale"];

const PuppyForm: React.FC<PuppyFormProps> = ({ puppy, onClose, isEditMode }) => {
  const [formData, setFormData] = useState<PuppyFormData>({
    breed: puppy?.breed || "",
    description: puppy?.description || "",
    size: puppy?.size || "",
    temperament: Array.isArray(puppy?.temperament) ? puppy.temperament : (puppy?.temperament ? [puppy.temperament] : []),
    care_notes: puppy?.care_notes || "",
    name: puppy?.name || "",
    birth_date: puppy?.birth_date || new Date().toISOString().split("T")[0],
    price: puppy?.price || 0,
    photo_url: puppy?.photo_url || "", // Keep for now, but prioritize image_urls
    image_urls: puppy?.image_urls || [],
    weight: puppy?.weight || 0,
    mother_name: puppy?.mother_name || "",
    father_name: puppy?.father_name || "",
    litter_id: puppy?.litter_id || "",
    gender: puppy?.gender || "",
    status: (puppy?.status || "Available") as PuppyStatus,
  });

  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, { id?: string; data: PuppyFormData }>({
    mutationFn: ({ id, data }) => {
      // Prioritize image_urls and remove photo_url if it exists
      const submissionData = { ...data };
      delete submissionData.photo_url;

      if (isEditMode && id) {
        return adminApi.updatePuppy(id, submissionData as PuppyUpdateData);
      } else {
        return adminApi.createPuppy(submissionData as PuppyCreationData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["puppies"] });
      toast.success(`Puppy ${isEditMode ? "updated" : "created"} successfully!`);
      onClose();
    },
    onError: (error) => {
      toast.error(
        `Failed to ${isEditMode ? "update" : "create"} puppy: ${error.message}`
      );
    },
  });

  useEffect(() => {
    if (puppy) {
      setFormData({
        breed: puppy.breed || "",
        description: puppy.description || "",
        size: puppy.size || "",
        temperament: Array.isArray(puppy.temperament) ? puppy.temperament : (puppy.temperament ? [puppy.temperament] : []),
        care_notes: puppy.care_notes || "",
        name: puppy.name || "",
        birth_date: puppy.birth_date || new Date().toISOString().split("T")[0],
        price: puppy.price || 0,
        photo_url: puppy.photo_url || "",
        image_urls: puppy.image_urls || [],
        weight: puppy.weight || 0,
        mother_name: puppy.mother_name || "",
        father_name: puppy.father_name || "",
        litter_id: puppy.litter_id || "",
        gender: puppy.gender || "",
        status: puppy.status as PuppyStatus || "Available",
      });
    }
  }, [puppy]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ id: puppy?.id, data: formData });
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImagesUploaded = (urls: string[]) => {
    setFormData(prev => ({
      ...prev,
      image_urls: urls,
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditMode ? `Edit Puppy: ${puppy?.name}` : "Add New Puppy"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label>Puppy Images</Label>
            <ImageUploadWithCrop
              bucket="puppy-images"
              existingImages={formData.image_urls}
              onImagesUploaded={handleImagesUploaded}
              maxImages={5}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Input id="breed" name="breed" value={formData.breed} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth_date">Birth Date</Label>
              <Input id="birth_date" name="birth_date" type="date" value={formData.birth_date} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Input id="gender" name="gender" value={formData.gender} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (lbs)</Label>
              <Input id="weight" name="weight" type="number" value={formData.weight} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mother_name">Mother's Name</Label>
              <Input id="mother_name" name="mother_name" value={formData.mother_name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="father_name">Father's Name</Label>
              <Input id="father_name" name="father_name" value={formData.father_name} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="litter_id">Litter ID</Label>
              <Input id="litter_id" name="litter_id" value={formData.litter_id} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="size">Size</Label>
              <Select name="size" value={formData.size} onValueChange={value => setFormData(prev => ({...prev, size: value as PuppySize}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {PUPPY_SIZE_VALUES.map(sz => (
                    <SelectItem key={sz} value={sz}>{sz || "Unspecified"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" value={formData.status} onValueChange={value => setFormData(prev => ({...prev, status: value as PuppyStatus}))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {PUPPY_STATUS_VALUES.map(st => (
                    <SelectItem key={st} value={st}>{st}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="temperament">Temperament (comma-separated)</Label>
            <Textarea
              id="temperament"
              name="temperament"
              value={Array.isArray(formData.temperament) ? formData.temperament.join(', ') : formData.temperament}
              onChange={e => setFormData(prev => ({ ...prev, temperament: e.target.value.split(',').map(t => t.trim()) }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="care_notes">Care Notes</Label>
            <Textarea id="care_notes" name="care_notes" value={formData.care_notes} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required />
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                `${isEditMode ? "Update" : "Create"} Puppy`
              )}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PuppyForm;
