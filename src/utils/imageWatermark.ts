export interface WatermarkConfig {
  enabled: boolean;
  watermark_url: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  offset_x: number;
  offset_y: number;
  opacity: number;
  scale: number;
}

/**
 * Applies a watermark to an image file
 * @param imageFile - The original image file
 * @param watermarkUrl - URL of the watermark image
 * @param config - Watermark configuration settings
 * @returns Promise<Blob> - The watermarked image as a Blob
 */
export const applyWatermark = async (
  imageFile: File,
  watermarkUrl: string,
  config: WatermarkConfig
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return reject(new Error('Canvas not supported'));
    }

    const image = new Image();
    const watermark = new Image();
    watermark.crossOrigin = 'anonymous';

    image.onload = () => {
      // Set canvas dimensions to match image
      canvas.width = image.width;
      canvas.height = image.height;
      
      // Draw original image
      ctx.drawImage(image, 0, 0);

      watermark.onload = () => {
        // Calculate watermark dimensions based on scale
        const wmWidth = watermark.width * config.scale;
        const wmHeight = watermark.height * config.scale;

        // Calculate position
        let x = config.offset_x;
        let y = config.offset_y;

        switch (config.position) {
          case 'top-left':
            // x and y already set to offset values
            break;
          case 'top-right':
            x = canvas.width - wmWidth - config.offset_x;
            y = config.offset_y;
            break;
          case 'bottom-left':
            x = config.offset_x;
            y = canvas.height - wmHeight - config.offset_y;
            break;
          case 'bottom-right':
            x = canvas.width - wmWidth - config.offset_x;
            y = canvas.height - wmHeight - config.offset_y;
            break;
          case 'center':
            x = (canvas.width - wmWidth) / 2;
            y = (canvas.height - wmHeight) / 2;
            break;
        }

        // Apply opacity and draw watermark
        ctx.globalAlpha = config.opacity;
        ctx.drawImage(watermark, x, y, wmWidth, wmHeight);
        ctx.globalAlpha = 1.0; // Reset alpha

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create watermarked image'));
            }
          },
          'image/webp',
          0.95
        );
      };

      watermark.onerror = () => {
        reject(new Error('Failed to load watermark image'));
      };

      watermark.src = watermarkUrl;
    };

    image.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    image.src = URL.createObjectURL(imageFile);
  });
};

/**
 * Generates a default alt text based on entity type and data
 */
export const generateDefaultAltText = (
  entityType: string,
  entityData: any,
  imageNumber: number
): string => {
  switch (entityType) {
    case 'puppy':
      return `${entityData.name || 'Puppy'} - ${entityData.breed || 'Dog'} puppy${entityData.color ? ` - ${entityData.color}` : ''} - Image ${imageNumber}${entityData.price ? ` - $${entityData.price}` : ''}`;
    case 'parent':
      return `${entityData.name || 'Dog'} - ${entityData.breed || 'Breed'} dog - ${entityData.gender || 'Parent'} - Image ${imageNumber}`;
    case 'litter':
      return `${entityData.breed || 'Dog'} litter${entityData.name ? ` - ${entityData.name}` : ''} - Image ${imageNumber}`;
    case 'brand':
      return `GDS Puppies brand image ${imageNumber}`;
    default:
      return `Image ${imageNumber}`;
  }
};