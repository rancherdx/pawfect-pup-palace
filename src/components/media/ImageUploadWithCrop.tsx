import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, X, Crop, Image as ImageIcon, Library } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ImageGalleryDialog from '../admin/ImageGalleryDialog';

interface ImageUploadWithCropProps {
  onImagesUploaded: (urls: string[]) => void;
  bucket: 'puppy-images' | 'litter-images' | 'brand-assets';
  maxImages?: number;
  existingImages?: string[];
  aspectRatio?: number; // width/height ratio for cropping
}

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

const ImageUploadWithCrop: React.FC<ImageUploadWithCropProps> = ({
  onImagesUploaded,
  bucket,
  maxImages = 10,
  existingImages = [],
  aspectRatio,
}) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = useCallback((files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    if (images.length + validFiles.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const newImages: ImageFile[] = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }));

    setImages(prev => [...prev, ...newImages]);
  }, [images.length, maxImages]);

  const compressImage = useCallback((file: File, quality = 0.8): Promise<Blob> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const maxWidth = 1920;
        const maxHeight = 1920;
        
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(resolve as BlobCallback, 'image/webp', quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const uploadImages = useCallback(async () => {
    if (images.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < images.length; i++) {
        const imageFile = images[i];
        
        // Compress image
        const compressedBlob = await compressImage(imageFile.file);
        
        // Generate unique filename
        const fileExt = 'webp';
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, compressedBlob, {
            contentType: 'image/webp',
            cacheControl: '3600',
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
        setUploadProgress(((i + 1) / images.length) * 100);
      }

      // Clean up
      images.forEach(img => URL.revokeObjectURL(img.preview));
      setImages([]);
      
      // Combine with existing images
      const allUrls = [...existingImages, ...uploadedUrls];
      onImagesUploaded(allUrls);
      
      toast.success(`Successfully uploaded ${uploadedUrls.length} images`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [images, bucket, existingImages, onImagesUploaded, compressImage]);

  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === id);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const removeExistingImage = useCallback((url: string) => {
    const updatedUrls = existingImages.filter(existing => existing !== url);
    onImagesUploaded(updatedUrls);
  }, [existingImages, onImagesUploaded]);

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Existing images */}
        {existingImages.map((url, index) => (
          <Card key={`existing-${index}`} className="relative group">
            <CardContent className="p-2">
              <div className="aspect-square relative overflow-hidden rounded-lg">
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeExistingImage(url)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* New images */}
        {images.map((image) => (
          <Card key={image.id} className="relative group">
            <CardContent className="p-2">
              <div className="aspect-square relative overflow-hidden rounded-lg">
                <img
                  src={image.preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(image.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Upload button */}
        {images.length + existingImages.length < maxImages && (
          <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
            <CardContent className="p-4">
              <div
                className="aspect-square flex flex-col items-center justify-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileSelect(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground text-center">
                  Drop images or click to upload
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
      />

      {uploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-sm text-muted-foreground text-center">
            Uploading images... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}

      <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setIsGalleryOpen(true)}>
            <Library className="h-4 w-4 mr-2" />
            Choose from Gallery
          </Button>
        {images.length > 0 && !uploading && (
          <>
            <Button variant="outline" onClick={() => setImages([])}>
              Clear All
            </Button>
            <Button onClick={uploadImages}>
              <ImageIcon className="h-4 w-4 mr-2" />
              Upload {images.length} Image{images.length > 1 ? 's' : ''}
            </Button>
          </>
        )}
      </div>

      <ImageGalleryDialog
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        onSelectImage={(url) => {
            const allUrls = [...existingImages, url];
            onImagesUploaded(allUrls);
        }}
      />

      <p className="text-xs text-muted-foreground">
        Maximum {maxImages} images • Max 10MB per file • Auto-converted to WebP for optimization
      </p>
    </div>
  );
};

export default ImageUploadWithCrop;
