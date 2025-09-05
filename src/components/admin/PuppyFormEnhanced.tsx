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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
import { Loader2, Star, Tag } from "lucide-react";
import ImageUploadWithCrop from "@/components/media/ImageUploadWithCrop";
import VideoUpload from "@/components/media/VideoUpload";

type PuppyFormData = Omit<PuppyCreationData, "status" | "size"> & {
  status: PuppyStatus;
  size: PuppySize;
  is_featured?: boolean;
  banner_text?: string;
  banner_color?: string;
  image_urls?: string[];
  video_urls?: string[];
};

interface PuppyFormEnhancedProps {
  puppy?: Puppy;
  onClose: () => void;
  isEditMode?: boolean;
}

const PUPPY_SIZE_VALUES: PuppySize[] = ["Toy", "Small", "Medium", "Large", "Giant", ""];
const PUPPY_STATUS_VALUES: PuppyStatus[] = ["Available", "Reserved", "Sold", "Not For Sale"];

const BANNER_PRESETS = [
  { text: "🔥 SALE", color: "#ef4444" },
  { text: "💝 LAST ONE LEFT", color: "#f97316" },
  { text: "⭐ FEATURED", color: "#3b82f6" },
  { text: "✅ ADOPTED", color: "#10b981" },
  { text: "📋 PENDING ADOPTION", color: "#8b5cf6" },
  { text: "❤️ RESERVED", color: "#ec4899" },
];

const PuppyFormEnhanced: React.FC<PuppyFormEnhancedProps> = ({ puppy, onClose, isEditMode }) => {
  const [formData, setFormData] = useState<PuppyFormData>({
    breed: puppy?.breed || "",
    description: puppy?.description || "",
    size: puppy?.size || "",
    temperament: puppy?.temperament || "",
    careNotes: puppy?.careNotes || "",
    name: puppy?.name || "",
    birthDate: puppy?.birthDate || new Date().toISOString().split("T")[0],
    price: puppy?.price || 0,
    photoUrl: puppy?.photoUrl || "",
    weight: puppy?.weight || 0,
    motherName: puppy?.motherName || "",
    fatherName: puppy?.fatherName || "",
    litterId: puppy?.litterId || "",
    gender: puppy?.gender || "",
    status: (puppy?.status || "Available") as PuppyStatus,
    is_featured: puppy?.is_featured || false,
    banner_text: puppy?.banner_text || "",
    banner_color: puppy?.banner_color || "#ef4444",
    image_urls: puppy?.image_urls || [],
    video_urls: puppy?.video_urls || [],
  });
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
      queryClient.invalidateQueries({ queryKey: ["featured-puppies"] });
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
        temperament: puppy.temperament || "",
        careNotes: puppy.careNotes || "",
        name: puppy.name || "",
        birthDate: puppy.birthDate || new Date().toISOString().split("T")[0],
        price: puppy.price || 0,
        photoUrl: puppy.photoUrl || "",
        weight: puppy.weight || 0,
        motherName: puppy.motherName || "",
        fatherName: puppy.fatherName || "",
        litterId: puppy.litterId || "",
        gender: puppy.gender || "",
        status: puppy.status as PuppyStatus || "Available",
        is_featured: puppy.is_featured || false,
        banner_text: puppy.banner_text || "",
        banner_color: puppy.banner_color || "#ef4444",
        image_urls: puppy.image_urls || [],
        video_urls: puppy.video_urls || [],
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBannerPreset = (preset: { text: string; color: string }) => {
    setFormData(prev => ({
      ...prev,
      banner_text: preset.text,
      banner_color: preset.color,
    }));
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditMode ? "Edit Puppy" : "Add New Puppy"}
          {formData.is_featured && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="featured">Featured & Banner</TabsTrigger>
            <TabsTrigger value="details">Additional Details</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <TabsContent value="basic" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
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
                  <Label htmlFor="birthDate">Birth Date *</Label>
                  <Input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="price">Price ($) *</Label>
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
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as PuppyStatus }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PUPPY_STATUS_VALUES.map(status => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                />
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-6 mt-6">
              <div>
                <Label className="text-base font-semibold">Puppy Images</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload high-quality images of the puppy. Images will be automatically optimized for web performance.
                </p>
                <ImageUploadWithCrop
                  onImagesUploaded={(urls) => setFormData(prev => ({ ...prev, image_urls: urls }))}
                  bucket="puppy-images"
                  maxImages={10}
                  existingImages={formData.image_urls}
                />
              </div>

              <Separator />

              <div>
                <Label className="text-base font-semibold">Puppy Videos</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Add videos to showcase the puppy's personality and movement.
                </p>
                <VideoUpload
                  onVideosUploaded={(urls) => setFormData(prev => ({ ...prev, video_urls: urls }))}
                  maxVideos={3}
                  existingVideos={formData.video_urls}
                />
              </div>
            </TabsContent>

            <TabsContent value="featured" className="space-y-6 mt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, is_featured: checked as boolean }))
                    }
                  />
                  <Label htmlFor="is_featured" className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Feature this puppy on the homepage
                  </Label>
                </div>
                
                {formData.is_featured && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground mb-3">
                      Featured puppies appear in the homepage banner with special styling
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <Label className="text-base font-semibold">Promotional Banner</Label>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {BANNER_PRESETS.map((preset, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-auto py-2"
                      style={{ borderColor: preset.color }}
                      onClick={() => handleBannerPreset(preset)}
                    >
                      <span style={{ color: preset.color }}>{preset.text}</span>
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="banner_text">Custom Banner Text</Label>
                    <Input
                      id="banner_text"
                      name="banner_text"
                      value={formData.banner_text}
                      onChange={handleChange}
                      placeholder="e.g., Special Price!"
                    />
                  </div>
                  <div>
                    <Label htmlFor="banner_color">Banner Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        id="banner_color"
                        name="banner_color"
                        value={formData.banner_color}
                        onChange={handleChange}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.banner_color}
                        onChange={handleChange}
                        name="banner_color"
                        placeholder="#ef4444"
                      />
                    </div>
                  </div>
                </div>

                {formData.banner_text && (
                  <div className="p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                    <div
                      className="inline-block px-3 py-1 rounded-full text-white font-bold text-sm"
                      style={{ backgroundColor: formData.banner_color }}
                    >
                      {formData.banner_text}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    type="number"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    step="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="size">Size Category</Label>
                  <Select
                    value={formData.size}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, size: value as PuppySize }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {PUPPY_SIZE_VALUES.map(size => (
                        <SelectItem key={size} value={size}>{size || "Unspecified"}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="motherName">Mother's Name</Label>
                  <Input
                    id="motherName"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="fatherName">Father's Name</Label>
                  <Input
                    id="fatherName"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="litterId">Litter ID</Label>
                  <Input
                    id="litterId"
                    name="litterId"
                    value={formData.litterId}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="temperament">Temperament</Label>
                <Textarea
                  id="temperament"
                  name="temperament"
                  value={formData.temperament}
                  onChange={handleChange}
                  placeholder="Describe the puppy's personality and temperament"
                />
              </div>

              <div>
                <Label htmlFor="careNotes">Care Notes</Label>
                <Textarea
                  id="careNotes"
                  name="careNotes"
                  value={formData.careNotes}
                  onChange={handleChange}
                  placeholder="Special care instructions, medical notes, etc."
                />
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
                  `${isEditMode ? "Update" : "Create"} Puppy`
                )}
              </Button>
            </CardFooter>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default PuppyFormEnhanced;