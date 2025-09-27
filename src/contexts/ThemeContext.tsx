import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type Holiday = 'halloween' | 'christmas' | 'valentine' | 'none';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  holiday: Holiday;
  setHoliday: (holiday: Holiday) => void;
  holidayEnabled: boolean;
  setHolidayEnabled: (enabled: boolean) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [holiday, setHoliday] = useState<Holiday>('halloween');
  const [holidayEnabled, setHolidayEnabled] = useState(true);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Determine actual theme
    let actualTheme: 'light' | 'dark' = 'light';
    if (theme === 'system') {
      actualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      actualTheme = theme === 'dark' ? 'dark' : 'light';
    }
    
    setResolvedTheme(actualTheme);
    
    // Apply theme classes
    root.classList.remove('light', 'dark', 'halloween', 'christmas', 'valentine');
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