import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type Theme = 'light' | 'dark' | 'dimmed' | 'system';
export type Holiday = 'halloween' | 'christmas' | 'valentine' | 'none';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  holiday: Holiday;
  setHoliday: (holiday: Holiday) => void;
  holidayEnabled: boolean;
  setHolidayEnabled: (enabled: boolean) => void;
  resolvedTheme: 'light' | 'dark' | 'dimmed';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [theme, setTheme] = useState<Theme>('dimmed'); // Default to dimmed
  const [holiday, setHoliday] = useState<Holiday>('none');
  const [holidayEnabled, setHolidayEnabled] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark' | 'dimmed'>('dimmed');

  // Load user theme preference from database
  useEffect(() => {
    const loadUserTheme = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_theme_preferences')
          .select('theme_mode, custom_tokens')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          setTheme(data.theme_mode as Theme);
        }
      } catch (err) {
        console.error('Failed to load user theme:', err);
      }
    };

    loadUserTheme();
  }, [user]);

  // Save user theme preference to database
  useEffect(() => {
    const saveUserTheme = async () => {
      if (!user || theme === 'system') return;
      
      try {
        await supabase
          .from('user_theme_preferences')
          .upsert({
            user_id: user.id,
            theme_mode: theme,
            custom_tokens: {}
          });
      } catch (err) {
        console.error('Failed to save user theme:', err);
      }
    };

    saveUserTheme();
  }, [user, theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Determine actual theme
    let actualTheme: 'light' | 'dark' | 'dimmed' = 'dimmed';
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      actualTheme = prefersDark ? 'dark' : 'light';
    } else {
      actualTheme = theme;
    }
    
    setResolvedTheme(actualTheme);
    
    // Apply theme classes
    root.classList.remove('light', 'dark', 'dimmed', 'halloween', 'christmas', 'valentine');
    root.classList.add(actualTheme);
    
    // Apply holiday theme if enabled
    if (holidayEnabled && holiday !== 'none') {
      root.classList.add(holiday);
    }
  }, [theme, holiday, holidayEnabled]);

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      holiday,
      setHoliday,
      holidayEnabled,
      setHolidayEnabled,
      resolvedTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}