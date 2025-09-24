import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { adminApi } from "@/api";
import { Litter, LitterCreationData, LitterUpdateData, LitterStatus, Parent } from "@/types";
import { Loader2 } from "lucide-react";
import ImageUploadWithCrop from "@/components/media/ImageUploadWithCrop";
import VideoUpload from "@/components/media/VideoUpload";

/**
 * @typedef {Omit<LitterCreationData, "status"> & { status: LitterStatus; image_urls?: string[]; video_urls?: string[]; dam_id?: string; sire_id?: string; }} LitterFormData
 * @description Defines the shape of the form data for the enhanced litter form, including media URLs and parent IDs.
 */
type LitterFormData = Omit<LitterCreationData, "status"> & { 
  status: LitterStatus; 
  image_urls?: string[]; 
  video_urls?: string[];
  dam_id?: string;
  sire_id?: string;
};

/**
 * @interface LitterFormEnhancedProps
 * @description Defines the props for the LitterFormEnhanced component.
 */
interface LitterFormEnhancedProps {
  /** The litter data to populate the form for editing. If not provided, the form is in creation mode. */
  litter?: Litter;
  /** Callback function to be invoked when the form is closed or cancelled. */
  onClose: () => void;
  /** A boolean to explicitly set the form to edit mode. */
  isEditMode?: boolean;
}

/**
 * @constant LITTER_STATUS_VALUES
 * @description An array of possible statuses for a litter.
 */
const LITTER_STATUS_VALUES: LitterStatus[] = [
  "Active",
  "Available Soon", 
  "All Reserved",
  "All Sold",
  "Archived"
];

/**
 * @component LitterFormEnhanced
 * @description An advanced form for creating and editing litters, featuring a tabbed interface for better organization of information, including media uploads.
 * @param {LitterFormEnhancedProps} props - The props for the component.
 * @returns {React.ReactElement} The rendered enhanced litter form.
 */
const LitterFormEnhanced: React.FC<LitterFormEnhancedProps> = ({ litter, onClose, isEditMode }) => {
  const [formData, setFormData] = useState<LitterFormData>({
    name: litter?.name || "",
    damName: litter?.damName || "",
    sireName: litter?.sireName || "",
    breed: litter?.breed || "",
    dateOfBirth: litter?.dateOfBirth || "",
    expectedDate: litter?.expectedDate || "",
    puppyCount: litter?.puppyCount || 0,
    status: litter?.status || "Active",
    description: litter?.description || "",
    coverImageUrl: litter?.coverImageUrl || "",
    image_urls: litter?.image_urls || [],
    video_urls: litter?.video_urls || [],
  });

  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch available parents
  const { data: parentsData } = useQuery({
    queryKey: ['parents'],
    queryFn: () => adminApi.getAllParents(),
  });

  const mutation = useMutation<unknown, Error, { id?: string; data: LitterFormData }>({
    mutationFn: ({ id, data }) => {
      setIsLoading(true);
      if (isEditMode && id) {
        return adminApi.updateLitter(id, data as LitterUpdateData);
      } else {
        return adminApi.createLitter(data as LitterCreationData);
      }
    },
    onSuccess: () => {
      setIsLoading(false);
      queryClient.invalidateQueries({ queryKey: ["litters"] });
      toast.success(`Litter ${isEditMode ? "updated" : "created"} successfully!`);
      onClose();
    },
    onError: (error) => {
      setIsLoading(false);
      toast.error(
        `Failed to ${isEditMode ? "update" : "create"} litter: ${error.message}`
      );
    },
  });

  useEffect(() => {
    if (litter) {
      setFormData({
        name: litter.name || "",
        damName: litter.damName || "",
        sireName: litter.sireName || "",
        breed: litter.breed || "",
        dateOfBirth: litter.dateOfBirth || "",
        expectedDate: litter.expectedDate || "",
        puppyCount: litter.puppyCount || 0,
        status: litter.status || "Active",
        description: litter.description || "",
        coverImageUrl: litter.coverImageUrl || "",
        image_urls: litter.image_urls || [],
        video_urls: litter.video_urls || [],
      });
    }
  }, [litter]);

  /**
   * Handles the form submission for creating or updating a litter.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && litter?.id) {
      mutation.mutate({ id: litter.id, data: formData });
    } else {
      mutation.mutate({ data: formData });
    }
  };

  /**
   * Handles changes in form input fields and updates the component's state.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The input change event.
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "puppyCount" ? parseInt(value) || 0 : value,
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditMode ? "Edit Litter" : "Add New Litter"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="details">Additional Details</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <TabsContent value="basic" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Litter Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Spring 2024 Golden Litter"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="breed">Breed *</Label>
                  <Input
                    id="breed"
                    name="breed"
                    value={formData.breed}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dam_id">Dam (Mother)</Label>
                  <Select name="dam_id" value={formData.dam_id} onValueChange={value => setFormData(prev => ({ ...prev, dam_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select dam" />
                    </SelectTrigger>
                    <SelectContent>
                      {parentsData?.parents?.filter(p => p.gender === 'Female').map(parent => (
                        <SelectItem key={parent.id} value={parent.id}>{parent.name} ({parent.breed})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sire_id">Sire (Father)</Label>
                  <Select name="sire_id" value={formData.sire_id} onValueChange={value => setFormData(prev => ({ ...prev, sire_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sire" />
                    </SelectTrigger>
                    <SelectContent>
                      {parentsData?.parents?.filter(p => p.gender === 'Male').map(parent => (
                        <SelectItem key={parent.id} value={parent.id}>{parent.name} ({parent.breed})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="expectedDate">Expected Date (if not born yet)</Label>
                  <Input
                    type="date"
                    id="expectedDate"
                    name="expectedDate"
                    value={formData.expectedDate}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="puppyCount">Number of Puppies</Label>
                  <Input
                    type="number"
                    id="puppyCount"
                    name="puppyCount"
                    value={formData.puppyCount}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as LitterStatus }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LITTER_STATUS_VALUES.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the litter, breeding details, expected traits, etc."
                />
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-6 mt-6">
              <div>
                <Label className="text-base font-semibold">Litter Images</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload images of the parents, previous litters, or ultrasound photos.
                </p>
                <ImageUploadWithCrop
                  onImagesUploaded={(urls) => setFormData(prev => ({ ...prev, image_urls: urls }))}
                  bucket="litter-images"
                  maxImages={8}
                  existingImages={formData.image_urls}
                />
              </div>

              <Separator />

              <div>
                <Label className="text-base font-semibold">Litter Videos</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Add videos of the parents or previous litters to showcase bloodline quality.
                </p>
                <VideoUpload
                  onVideosUploaded={(urls) => setFormData(prev => ({ ...prev, video_urls: urls }))}
                  maxVideos={3}
                  existingVideos={formData.video_urls}
                />
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-6">
              <div>
                <Label htmlFor="coverImageUrl">Legacy Cover Image URL</Label>
                <Input
                  id="coverImageUrl"
                  name="coverImageUrl"
                  value={formData.coverImageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  For compatibility with existing systems. Use the Media tab for new uploads.
                </p>
              </div>
            </TabsContent>

            <CardFooter className="flex justify-between px-0">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  `${isEditMode ? "Update" : "Create"} Litter`
                )}
              </Button>
            </CardFooter>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LitterFormEnhanced;