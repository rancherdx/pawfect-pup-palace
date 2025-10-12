import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminApi } from "@/api";
import { Puppy, PuppyStatus } from "@/types/api";
import { PuppyCreationData, PuppyUpdateData } from "@/api/adminApi";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageUploadWithCrop from "../media/ImageUploadWithCrop";

const puppyFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  breed: z.string().min(3, "Breed is required."),
  birth_date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date format." }),
  gender: z.string().min(1, "Gender is required."),
  price: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().positive("Price must be a positive number.")),
  weight: z.preprocess((a) => parseFloat(z.string().parse(a)), z.number().optional()),
  mother_name: z.string().optional(),
  father_name: z.string().optional(),
  litter_id: z.string().optional(),
  status: z.enum(["Available", "Reserved", "Sold", "Not For Sale"]),
  temperament: z.array(z.string()).optional(),
  description: z.string().min(10, "Description must be at least 10 characters."),
  image_urls: z.array(z.string()).optional(),
});

type PuppyFormData = z.infer<typeof puppyFormSchema>;

interface PuppyFormProps {
  puppy?: Puppy;
  onClose: () => void;
}

const PUPPY_STATUS_VALUES: PuppyStatus[] = ["Available", "Reserved", "Sold", "Not For Sale"];

const PuppyForm: React.FC<PuppyFormProps> = ({ puppy, onClose }) => {
  const queryClient = useQueryClient();
  const { register, handleSubmit, control, setValue, formState: { errors } } = useForm<PuppyFormData>({
    resolver: zodResolver(puppyFormSchema),
    defaultValues: {
      name: puppy?.name || "",
      breed: puppy?.breed || "",
      birth_date: puppy?.birth_date ? new Date(puppy.birth_date).toISOString().split("T")[0] : "",
      gender: puppy?.gender || "",
      price: puppy?.price || 0,
      weight: puppy?.weight || 0,
          litter_id: puppy?.litter_id || "",
      status: puppy?.status || "Available",
      temperament: puppy?.temperament || [],
      description: puppy?.description || "",
      image_urls: puppy?.image_urls || [],
    },
  });

  const mutation = useMutation({
    mutationFn: (data: PuppyFormData) => {
      const submissionData = { ...data };
      if (puppy?.id) {
        return adminApi.updatePuppy(puppy.id, submissionData as PuppyUpdateData);
      }
      return adminApi.createPuppy(submissionData as PuppyCreationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["puppies"] });
      toast.success(`Puppy ${puppy ? "updated" : "created"} successfully!`);
      onClose();
    },
    onError: (error: Error) => {
      toast.error(`Failed to ${puppy ? "update" : "create"} puppy: ${error.message}`);
    },
  });

  const onSubmit = (data: PuppyFormData) => {
    mutation.mutate(data);
  };

  const handleImagesUploaded = (urls: string[]) => {
    setValue("image_urls", urls);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{puppy ? `Edit Puppy: ${puppy.name}` : "Add New Puppy"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
          <div>
            <Label>Puppy Images</Label>
            <ImageUploadWithCrop bucket="puppy-images" existingImages={puppy?.image_urls || []} onImagesUploaded={handleImagesUploaded} maxImages={5} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="name">Name</Label><Input id="name" {...register("name")} />{errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}</div>
            <div><Label htmlFor="breed">Breed</Label><Input id="breed" {...register("breed")} />{errors.breed && <p className="text-red-500 text-sm">{errors.breed.message}</p>}</div>
            <div><Label htmlFor="birth_date">Birth Date</Label><Input id="birth_date" type="date" {...register("birth_date")} />{errors.birth_date && <p className="text-red-500 text-sm">{errors.birth_date.message}</p>}</div>
            <div><Label htmlFor="gender">Gender</Label><Input id="gender" {...register("gender")} />{errors.gender && <p className="text-red-500 text-sm">{errors.gender.message}</p>}</div>
            <div><Label htmlFor="price">Price</Label><Input id="price" type="number" step="0.01" {...register("price")} />{errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}</div>
            <div><Label htmlFor="weight">Weight (lbs)</Label><Input id="weight" type="number" step="0.1" {...register("weight")} />{errors.weight && <p className="text-red-500 text-sm">{errors.weight.message}</p>}</div>
            <div><Label htmlFor="mother_name">Mother's Name</Label><Input id="mother_name" {...register("mother_name")} /></div>
            <div><Label htmlFor="father_name">Father's Name</Label><Input id="father_name" {...register("father_name")} /></div>
            <div><Label htmlFor="litter_id">Litter ID</Label><Input id="litter_id" {...register("litter_id")} /></div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Controller name="status" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>{PUPPY_STATUS_VALUES.map(st => <SelectItem key={st} value={st}>{st}</SelectItem>)}</SelectContent>
                </Select>
              )} />
              {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
            </div>
          </div>
          <div>
            <Label htmlFor="temperament">Temperament (comma-separated)</Label>
            <Controller name="temperament" control={control} render={({ field }) => (
              <Textarea id="temperament" value={field.value?.join(", ")} onChange={(e) => field.onChange(e.target.value.split(",").map(t => t.trim()))} />
            )} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} />
            {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between w-full">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</>) : (`${puppy ? "Update" : "Create"} Puppy`)}
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PuppyForm;