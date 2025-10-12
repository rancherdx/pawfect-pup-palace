
import React, { createContext, useContext, useMemo } from "react";

/**
 * @typedef {'juneteenth' | 'fathersday' | 'halloween' | 'none'} Holiday
 * @description A type representing the possible holiday themes.
 */
export type Holiday =
  | "juneteenth"
  | "fathersday"
  | "halloween"
  | "none";

/**
 * @interface HolidayThemeContextType
 * @description Defines the shape of the holiday theme context.
 */
interface HolidayThemeContextType {
  holiday: Holiday;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    background: string;
  };
}

/**
 * Determines the current holiday and returns the corresponding theme colors.
 * @returns {HolidayThemeContextType} The theme object for the current holiday, or the default theme.
 */
function getHolidayAndColors(): HolidayThemeContextType {
  // Holiday themes disabled - always return default theme
  // To re-enable, uncomment the date checks below and remove the early return
  
  // Default site theme - Holiday themes disabled
  return {
    holiday: "none",
    colors: {
      primary: "#DC2626", // Brand red
      secondary: "#1A1A1A",
      accent: "#FFD700",
      text: "#FFF",
      background: "#FFFFFF"
    },
  };
  
  /* HOLIDAY THEMES DISABLED - Uncomment to re-enable
  const today = new Date();
  const month = today.getMonth() + 1; // January = 0
  const date = today.getDate();

  // --- Halloween: October ---
  if (month === 10) {
    return {
      holiday: "halloween",
      colors: {
        primary: "#FF6B1A", // Pumpkin orange
        secondary: "#2D1B69", // Midnight purple
        accent: "#39FF14", // Spooky green
        text: "#F8F8FF", // Ghost white
        background: "#1A0B2E", // Dark purple night
      }
    };
  }

  // --- Juneteenth: June 19 ---
  if (month === 6 && date === 19) {
    return {
      holiday: "juneteenth",
      colors: {
        primary: "#E53E3E", // Red (Pan-African)
        secondary: "#1A1A1A", // Black
        accent: "#228B22", // Green
        text: "#FFF",
        background: "#1A1A1A",
      }
    };
  }

  // --- Father's Day: 3rd Sunday in June ---
  // Find the 3rd Sunday in June of this year
  if (month === 6) {
    const d = new Date(today.getFullYear(), 5, 1);
    let sundays = 0;
    for (let i = 1; i <= 30; i++) {
      d.setDate(i);
      if (d.getDay() === 0) sundays++;
      if (sundays === 3 && date === i) {
        return {
          holiday: "fathersday",
          colors: {
            primary: "#223A5E", // Deep blue
            secondary: "#795548", // Earth brown
            accent: "#FFD700", // Gold
            text: "#FFF", 
            background: "#223A5E",
          }
        };
      }
    }
  }

  // Default fallback
  return {
    holiday: "none",
    colors: {
      primary: "#DC2626",
      secondary: "#1A1A1A",
      accent: "#FFD700",
      text: "#FFF",
      background: "#FFFFFF"
    },
  };
  */
}

const HolidayThemeContext = createContext<HolidayThemeContextType>({
  holiday: "none",
  colors: {
    primary: "#DC2626", // Brand red
    secondary: "#1A1A1A",
    accent: "#FFD700",
    text: "#FFF",
    background: "#FFFFFF",
  }
});

/**
 * @component HolidayThemeProvider
 * @description Provides the holiday theme context to its children components.
 * It calculates the current theme once and provides it to the context.
 * @param {{ children: React.ReactNode }} props - The props for the component.
 * @returns {React.ReactElement} The rendered provider component.
 */
export const HolidayThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useMemo(getHolidayAndColors, []);
  return (
    <HolidayThemeContext.Provider value={theme}>{children}</HolidayThemeContext.Provider>
  );
};

/**
 * @hook useHolidayTheme
 * @description A custom hook to access the holiday theme context.
 * @returns {HolidayThemeContextType} The holiday theme context.
 */
export function useHolidayTheme() {
  return useContext(HolidayThemeContext);
}
