import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ImageGalleryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
}

const ImageGalleryDialog: React.FC<ImageGalleryDialogProps> = ({ isOpen, onClose, onSelectImage }) => {
  const { data: puppyImages, isLoading: puppyImagesLoading } = useQuery({
    queryKey: ['storage-files', 'puppy-images'],
    queryFn: () => adminApi.getStorageBucketFiles('puppy-images'),
    enabled: isOpen,
  });

  const { data: litterImages, isLoading: litterImagesLoading } = useQuery({
    queryKey: ['storage-files', 'litter-images'],
    queryFn: () => adminApi.getStorageBucketFiles('litter-images'),
    enabled: isOpen,
  });

  const isLoading = puppyImagesLoading || litterImagesLoading;
  const allImages = [...(puppyImages || []), ...(litterImages || [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // A simple way to deduplicate images by URL if they appear in multiple places
  const uniqueImages = Array.from(new Map(allImages.map(item => [item.publicUrl, item])).values());

  const handleSelect = (url: string) => {
    onSelectImage(url);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Image Gallery</DialogTitle>
          <DialogDescription>
            Select an existing image from your storage buckets.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(12)].map((_, i) => <Skeleton key={i} className="aspect-square" />)}
            </div>
          ) : uniqueImages.length === 0 ? (
             <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>No Images Found</AlertTitle>
              <AlertDescription>
                You haven't uploaded any images to your storage buckets yet.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {uniqueImages.map((file) => (
                <div
                  key={file.id}
                  className="aspect-square border rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  onClick={() => handleSelect(file.publicUrl)}
                >
                  <img src={file.publicUrl} alt={file.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageGalleryDialog;
