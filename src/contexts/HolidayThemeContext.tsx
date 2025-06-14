
import React, { createContext, useContext, useMemo } from "react";

export type Holiday =
  | "juneteenth"
  | "fathersday"
  | "none";

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

function getHolidayAndColors(): HolidayThemeContextType {
  const today = new Date();
  const month = today.getMonth() + 1; // January = 0
  const date = today.getDate();

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

  // Default site theme
  return {
    holiday: "none",
    colors: {
      primary: "#E53E3E",
      secondary: "#1A1A1A",
      accent: "#FFD700",
      text: "#FFF",
      background: "#E53E3E"
    },
  };
}

const HolidayThemeContext = createContext<HolidayThemeContextType>({
  holiday: "none",
  colors: {
    primary: "#E53E3E",
    secondary: "#1A1A1A",
    accent: "#FFD700",
    text: "#FFF",
    background: "#E53E3E",
  }
});

export const HolidayThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useMemo(getHolidayAndColors, []);
  return (
    <HolidayThemeContext.Provider value={theme}>{children}</HolidayThemeContext.Provider>
  );
};

export function useHolidayTheme() {
  return useContext(HolidayThemeContext);
}
