import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api";
import {
  Puppy,
  PuppyCreationData,
  PuppyUpdateData,
  PuppyStatus,
  PuppySize,
} from "@/types";
import { Loader2 } from "lucide-react";

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
  const [formData, setFormData] = useState<PuppyFormData>(
    {
      breed: puppy?.breed || "",
      description: puppy?.description || "",
      size: puppy?.size || "",
      temperament: Array.isArray(puppy?.temperament) ? puppy.temperament : (puppy?.temperament ? [puppy.temperament] : []),
      care_notes: puppy?.care_notes || "",
      name: puppy?.name || "",
      birth_date: puppy?.birth_date || new Date().toISOString().split("T")[0],
      price: puppy?.price || 0,
      photo_url: puppy?.photo_url || "",
      weight: puppy?.weight || 0,
      mother_name: puppy?.mother_name || "",
      father_name: puppy?.father_name || "",
      litter_id: puppy?.litter_id || "",
      gender: puppy?.gender || "",
      status: (puppy?.status || "Available") as PuppyStatus,
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const mutation = useMutation<unknown, Error, { id?: string; data: PuppyFormData }>({
    mutationFn: ({ id, data }) => {
      setIsLoading(true);
      if (isEditMode && id) {
        return adminApi.updatePuppy(id, data as PuppyUpdateData);
      } else {
        return adminApi.createPuppy(data as PuppyCreationData);
      }
    },
    onSuccess: () => {
      setIsLoading(false);
      queryClient.invalidateQueries({ queryKey: ["puppies"] });
      toast.success(`Puppy ${isEditMode ? "updated" : "created"} successfully!`);
      onClose();
    },
    onError: (error) => {
      setIsLoading(false);
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
    if (isEditMode && puppy?.id) {
      mutation.mutate({ id: puppy.id, data: formData });
    } else {
      mutation.mutate({ data: formData });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditMode ? "Edit Puppy" : "Add New Puppy"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="breed">Breed</Label>
            <Input
              type="text"
              id="breed"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="birth_date">Birth Date</Label>
            <Input
              type="date"
              id="birth_date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <Input
              type="text"
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="photoUrl">Photo URL</Label>
            <Input
              type="text"
              id="photo_url"
              name="photo_url"
              value={formData.photo_url}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="weight">Weight</Label>
            <Input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="motherName">Mother's Name</Label>
            <Input
              type="text"
              id="mother_name"
              name="mother_name"
              value={formData.mother_name}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="father_name">Father's Name</Label>
            <Input
              type="text"
              id="father_name"
              name="father_name"
              value={formData.father_name}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="litter_id">Litter ID</Label>
            <Input
              type="text"
              id="litter_id"
              name="litter_id"
              value={formData.litter_id}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="size">Size</Label>
            <select
              name="size"
              value={formData.size}
              onChange={e => setFormData(prev => ({ ...prev, size: e.target.value as PuppySize }))}
            >
              {PUPPY_SIZE_VALUES.map(sz => (
                <option key={sz} value={sz}>{sz || "Unspecified"}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="temperament">Temperament</Label>
            <Textarea
              id="temperament"
              name="temperament"
              value={formData.temperament}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="care_notes">Care Notes</Label>
            <Textarea
              id="care_notes"
              name="care_notes"
              value={formData.care_notes}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              name="status"
              value={formData.status}
              onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as PuppyStatus }))}
            >
              {PUPPY_STATUS_VALUES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <div className="flex justify-between w-full">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-brand-red hover:bg-red-700 text-white"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
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
    </Card>
  );
};

export default PuppyForm;
