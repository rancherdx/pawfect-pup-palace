import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTheme } from '@/contexts/ThemeContext';
import { PawIcon } from '@/components/PuppyIcons';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  variant?: 'light' | 'dark' | 'mobile' | 'auto';
  className?: string;
  showFallback?: boolean;
}

/**
 * @component BrandLogo
 * @description Dynamic logo component that fetches brand assets from database
 * and displays the appropriate logo based on current theme.
 * Falls back to PawIcon + text if no logo is uploaded.
 */
export const BrandLogo = ({ 
  variant = 'auto', 
  className = '', 
  showFallback = true 
}: BrandLogoProps) => {
  const { resolvedTheme } = useTheme();

  const { data: brandAssets } = useQuery({
    queryKey: ['brand-assets', 'logos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_assets')
        .select('*')
        .eq('is_active', true)
        .in('asset_type', ['logo_light', 'logo_dark', 'logo_mobile']);
      
      if (error) throw error;
      return data;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  const { data: siteSettings } = useQuery({
    queryKey: ['site-settings', 'branding'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'branding')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data?.value as { companyName?: string; tagline?: string } | null;
    },
    staleTime: 10 * 60 * 1000,
  });

  // Determine which logo to use
  const getLogoUrl = () => {
    if (!brandAssets || brandAssets.length === 0) return null;
    
    // If specific variant requested
    if (variant === 'mobile') {
      const mobileLogo = brandAssets.find(a => a.asset_type === 'logo_mobile');
      if (mobileLogo) return mobileLogo.asset_url;
    }
    
    // Auto-select based on theme
    const targetType = variant === 'auto' 
      ? (resolvedTheme === 'dark' ? 'logo_dark' : 'logo_light')
      : `logo_${variant}`;
    
    const logo = brandAssets.find(a => a.asset_type === targetType);
    if (logo) return logo.asset_url;
    
    // Fallback to any available logo
    const anyLogo = brandAssets.find(a => a.asset_type.startsWith('logo_'));
    return anyLogo?.asset_url || null;
  };

  const logoUrl = getLogoUrl();
  const companyName = siteSettings?.companyName || 'GDS Puppies';

  // Show logo if available
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={companyName}
        className={cn(
          'object-contain max-h-10 w-auto transition-opacity duration-200',
          className
        )}
        style={{
          imageRendering: 'crisp-edges',
        }}
      />
    );
  }

  // Fallback to icon + text logo
  if (showFallback) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <PawIcon className="w-8 h-8 text-primary" />
        <span className="text-xl font-bold font-heading bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {companyName}
        </span>
      </div>
    );
  }

  return null;
};
