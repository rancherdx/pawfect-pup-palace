import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Upload, X, Image as ImageIcon, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadManagerProps {
  bucket: string;
  folder?: string;
  maxFiles?: number;
  maxSizeBytes?: number;
  onUploadComplete?: (urls: string[]) => void;
  existingImages?: string[];
  allowReorder?: boolean;
}

interface UploadFile extends File {
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

const ImageUploadManager = ({
  bucket,
  folder = '',
  maxFiles = 10,
  maxSizeBytes = 10 * 1024 * 1024, // 10MB
  onUploadComplete,
  existingImages = [],
  allowReorder = true
}: ImageUploadManagerProps) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const totalFiles = files.length + existingImages.length + acceptedFiles.length;
    
    if (totalFiles > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} images allowed`,
        variant: "destructive"
      });
      return;
    }

    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substring(7),
      progress: 0,
      status: 'pending' as const
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, [files.length, existingImages.length, maxFiles, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: maxSizeBytes,
    multiple: true
  });

  const uploadFile = async (file: UploadFile): Promise<string> => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${folder}${folder ? '/' : ''}${timestamp}-${file.name}`;
    
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      throw error;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of files) {
        if (file.status === 'success') continue;

        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, status: 'uploading', progress: 0 } : f
        ));

        try {
          const url = await uploadFile(file);
          uploadedUrls.push(url);
          
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { 
              ...f, 
              status: 'success', 
              progress: 100, 
              url 
            } : f
          ));
        } catch (error) {
          console.error('Upload error:', error);
          setFiles(prev => prev.map(f => 
            f.id === file.id ? { 
              ...f, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed'
            } : f
          ));
        }
      }

      if (uploadedUrls.length > 0) {
        const allUrls = [...existingImages, ...uploadedUrls];
        onUploadComplete?.(allUrls);
        toast({
          title: "Upload successful",
          description: `${uploadedUrls.length} image(s) uploaded successfully`
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearAll = () => {
    setFiles([]);
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`text-center cursor-pointer transition-colors ${
              isDragActive ? 'bg-accent' : 'hover:bg-accent/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop images here...' : 'Drag & drop images here'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click to select files (max {maxFiles} files, {Math.round(maxSizeBytes / 1024 / 1024)}MB each)
            </p>
            <Button type="button" variant="outline">
              Select Images
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">
              Files to upload ({files.length})
            </h3>
            <div className="space-x-2">
              <Button 
                onClick={handleUpload} 
                disabled={isUploading || files.every(f => f.status === 'success')}
                size="sm"
              >
                {isUploading ? 'Uploading...' : 'Upload All'}
              </Button>
              <Button onClick={clearAll} variant="outline" size="sm">
                Clear All
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {files.map(file => (
              <Card key={file.id} className="p-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {file.status === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : file.status === 'error' ? (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(file.size / 1024)} KB
                    </p>
                    
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="mt-2 h-1" />
                    )}
                    
                    {file.status === 'error' && file.error && (
                      <Alert className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {file.error}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  
                  <Button
                    onClick={() => removeFile(file.id)}
                    variant="ghost"
                    size="sm"
                    disabled={file.status === 'uploading'}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Existing Images ({existingImages.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {existingImages.map((url, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={url}
                  alt={`Existing ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadManager;
