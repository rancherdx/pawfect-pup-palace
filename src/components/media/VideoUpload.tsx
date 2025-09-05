import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Upload, X, Video, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface VideoUploadProps {
  onVideosUploaded: (urls: string[]) => void;
  maxVideos?: number;
  existingVideos?: string[];
}

interface VideoFile {
  file: File;
  preview: string;
  id: string;
}

const VideoUpload: React.FC<VideoUploadProps> = ({
  onVideosUploaded,
  maxVideos = 5,
  existingVideos = [],
}) => {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateVideoThumbnail = useCallback((videoFile: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      
      video.onloadedmetadata = () => {
        canvas.width = 320;
        canvas.height = (320 * video.videoHeight) / video.videoWidth;
        
        video.currentTime = 1; // Seek to 1 second for thumbnail
      };
      
      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/webp'));
      };
      
      video.src = URL.createObjectURL(videoFile);
    });
  }, []);

  const handleFileSelect = useCallback(async (files: FileList) => {
    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('video/')) {
        toast.error(`${file.name} is not a video file`);
        return false;
      }
      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        toast.error(`${file.name} is too large (max 100MB)`);
        return false;
      }
      return true;
    });

    if (videos.length + validFiles.length > maxVideos) {
      toast.error(`Maximum ${maxVideos} videos allowed`);
      return;
    }

    const newVideos: VideoFile[] = [];
    
    for (const file of validFiles) {
      const thumbnail = await generateVideoThumbnail(file);
      newVideos.push({
        file,
        preview: thumbnail,
        id: Math.random().toString(36).substr(2, 9),
      });
    }

    setVideos(prev => [...prev, ...newVideos]);
  }, [videos.length, maxVideos, generateVideoThumbnail]);

  const uploadVideos = useCallback(async () => {
    if (videos.length === 0) return;

    setUploading(true);
    setUploadProgress(0);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < videos.length; i++) {
        const videoFile = videos[i];
        
        // Generate unique filename
        const fileExt = videoFile.file.name.split('.').pop() || 'mp4';
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('videos')
          .upload(fileName, videoFile.file, {
            contentType: videoFile.file.type,
            cacheControl: '3600',
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
        setUploadProgress(((i + 1) / videos.length) * 100);
      }

      // Clean up
      setVideos([]);
      
      // Combine with existing videos
      const allUrls = [...existingVideos, ...uploadedUrls];
      onVideosUploaded(allUrls);
      
      toast.success(`Successfully uploaded ${uploadedUrls.length} videos`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload videos');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [videos, existingVideos, onVideosUploaded]);

  const removeVideo = useCallback((id: string) => {
    setVideos(prev => prev.filter(video => video.id !== id));
  }, []);

  const removeExistingVideo = useCallback((url: string) => {
    const updatedUrls = existingVideos.filter(existing => existing !== url);
    onVideosUploaded(updatedUrls);
  }, [existingVideos, onVideosUploaded]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {/* Existing videos */}
        {existingVideos.map((url, index) => (
          <Card key={`existing-${index}`} className="relative group">
            <CardContent className="p-2">
              <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
                <video
                  src={url}
                  className="w-full h-full object-cover"
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeExistingVideo(url)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* New videos */}
        {videos.map((video) => (
          <Card key={video.id} className="relative group">
            <CardContent className="p-2">
              <div className="aspect-video relative overflow-hidden rounded-lg">
                <img
                  src={video.preview}
                  alt="Video thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
                <Button
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeVideo(video.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Upload button */}
        {videos.length + existingVideos.length < maxVideos && (
          <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
            <CardContent className="p-4">
              <div
                className="aspect-video flex flex-col items-center justify-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFileSelect(e.dataTransfer.files);
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground text-center">
                  Drop videos or click to upload
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
        accept="video/*"
        className="hidden"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
      />

      {uploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-sm text-muted-foreground text-center">
            Uploading videos... {Math.round(uploadProgress)}%
          </p>
        </div>
      )}

      {videos.length > 0 && !uploading && (
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setVideos([])}>
            Clear All
          </Button>
          <Button onClick={uploadVideos}>
            <Video className="h-4 w-4 mr-2" />
            Upload {videos.length} Video{videos.length > 1 ? 's' : ''}
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Maximum {maxVideos} videos • Max 100MB per file • Supports MP4, WebM, MOV
      </p>
    </div>
  );
};

export default VideoUpload;
