import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminApi } from '@/api';
import { Litter, LitterStatus, LitterCreationData, LitterUpdateData } from "@/types/api";
import { Loader2 } from 'lucide-react';

const LITTER_STATUS_VALUES: LitterStatus[] = ["Active", "Available Soon", "All Reserved", "All Sold", "Archived", "Upcoming", "Past"];

const litterFormSchema = z.object({
  name: z.string().min(2, "Litter name is required."),
  breed: z.string().min(2, "Breed is required."),
  dam_id: z.string().optional(),
  sire_id: z.string().optional(),
  date_of_birth: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: "A valid birth date is required." }),
  puppy_count: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().int().min(0, "Puppy count cannot be negative.")),
  status: z.enum(LITTER_STATUS_VALUES),
  expected_date: z.string().optional(),
  description: z.string().optional(),
  cover_image_url: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
});

type LitterFormData = z.infer<typeof litterFormSchema>;

interface LitterFormProps {
  litter?: Litter;
  onClose: () => void;
}

const LitterForm: React.FC<LitterFormProps> = ({ litter, onClose }) => {
  const queryClient = useQueryClient();
  const { data: parentsData } = useQuery({
    queryKey: ['parents'],
    queryFn: () => adminApi.getAllParents(),
  });

  const { register, handleSubmit, control, formState: { errors } } = useForm<LitterFormData>({
    resolver: zodResolver(litterFormSchema),
    defaultValues: {
      name: litter?.name || "",
      breed: litter?.breed || "",
      dam_id: litter?.dam_id || "",
      sire_id: litter?.sire_id || "",
      date_of_birth: litter?.date_of_birth ? new Date(litter.date_of_birth).toISOString().split('T')[0] : "",
      puppy_count: litter?.puppy_count || 0,
      status: litter?.status || "Active",
      expected_date: litter?.expected_date ? new Date(litter.expected_date).toISOString().split('T')[0] : "",
      description: litter?.description || "",
      cover_image_url: litter?.cover_image_url || "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: LitterFormData) => {
      const apiData = { ...data };
      if (litter?.id) {
        return adminApi.updateLitter(litter.id, apiData as LitterUpdateData);
      }
      return adminApi.createLitter(apiData as LitterCreationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["litters"] });
      toast.success(`Litter ${litter ? "updated" : "created"} successfully!`);
      onClose();
    },
    onError: (error: Error) => {
      toast.error(`Failed to ${litter ? "update" : "create"} litter: ${error.message}`);
    },
  });

  const onSubmit = (data: LitterFormData) => {
    mutation.mutate(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{litter ? `Edit Litter: ${litter.name}` : "Add New Litter"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label htmlFor="name">Litter Name</Label><Input id="name" {...register("name")} />{errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}</div>
            <div><Label htmlFor="breed">Breed</Label><Input id="breed" {...register("breed")} />{errors.breed && <p className="text-red-500 text-sm">{errors.breed.message}</p>}</div>
            <div>
              <Label htmlFor="dam_id">Dam (Mother)</Label>
              <Controller name="dam_id" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select dam" /></SelectTrigger>
                  <SelectContent>{parentsData?.parents?.filter(p => p.gender === 'Female').map(parent => <SelectItem key={parent.id} value={parent.id}>{parent.name} ({parent.breed})</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </div>
            <div>
              <Label htmlFor="sire_id">Sire (Father)</Label>
              <Controller name="sire_id" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select sire" /></SelectTrigger>
                  <SelectContent>{parentsData?.parents?.filter(p => p.gender === 'Male').map(parent => <SelectItem key={parent.id} value={parent.id}>{parent.name} ({parent.breed})</SelectItem>)}</SelectContent>
                </Select>
              )} />
            </div>
            <div><Label htmlFor="date_of_birth">Date of Birth</Label><Input id="date_of_birth" type="date" {...register("date_of_birth")} />{errors.date_of_birth && <p className="text-red-500 text-sm">{errors.date_of_birth.message}</p>}</div>
            <div><Label htmlFor="puppy_count">Number of Puppies</Label><Input id="puppy_count" type="number" {...register("puppy_count")} />{errors.puppy_count && <p className="text-red-500 text-sm">{errors.puppy_count.message}</p>}</div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Controller name="status" control={control} render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>{LITTER_STATUS_VALUES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              )} />
              {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
            </div>
            <div><Label htmlFor="expected_date">Expected Date (Optional)</Label><Input id="expected_date" type="date" {...register("expected_date")} /></div>
          </div>
          <div><Label htmlFor="description">Description</Label><Textarea id="description" {...register("description")} /></div>
          <div><Label htmlFor="cover_image_url">Cover Image URL (Optional)</Label><Input id="cover_image_url" {...register("cover_image_url")} />{errors.cover_image_url && <p className="text-red-500 text-sm">{errors.cover_image_url.message}</p>}</div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {litter ? "Update Litter" : "Create Litter"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LitterForm;