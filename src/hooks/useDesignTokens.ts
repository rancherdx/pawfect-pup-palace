import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DesignToken {
  token_name: string;
  token_category: string;
  light_value: string | null;
  dark_value: string | null;
  dimmed_value: string | null;
  description: string | null;
}

/**
 * Hook to load and apply design tokens from the database
 * This enables dynamic theme customization across the application
 */
export const useDesignTokens = () => {
  const [tokens, setTokens] = useState<DesignToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadDesignTokens = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('design_tokens')
          .select('*')
          .eq('token_category', 'color')
          .order('token_name');

        if (fetchError) throw fetchError;

        setTokens(data || []);
        
        // Apply tokens to CSS variables if they exist
        if (data && data.length > 0) {
          applyTokensToCSS(data);
        }
      } catch (err) {
        console.error('Failed to load design tokens:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadDesignTokens();
  }, []);

  const applyTokensToCSS = (tokenData: DesignToken[]) => {
    const root = document.documentElement;
    
    tokenData.forEach((token) => {
      // Apply to each theme class
      if (token.light_value) {
        root.style.setProperty(`--${token.token_name}`, token.light_value);
      }
      
      // Note: Dark and dimmed values would need to be applied when those themes are active
      // This is handled by the ThemeContext
    });
  };

  return { tokens, loading, error, applyTokensToCSS };
};
