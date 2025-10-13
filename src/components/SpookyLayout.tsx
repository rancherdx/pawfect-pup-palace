import { ReactNode } from "react";
import { useHolidayTheme } from "@/contexts/HolidayThemeContext";
import HalloweenDecorations from "@/components/HalloweenDecorations";
import { NavbarRedesigned } from "@/components/NavbarRedesigned";
import Footer from "@/components/Footer";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface SpookyLayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
  centered?: boolean;
}

/**
 * Enhanced Layout component with Halloween theming and decorations
 */
const SpookyLayout = ({ children, fullWidth = false, centered = false }: SpookyLayoutProps) => {
  const { holiday } = useHolidayTheme();
  const [fontSize, setFontSize] = useLocalStorage("gds-font-size", "normal");
  
  return (
    <div className={`flex flex-col min-h-screen bg-background text-foreground transition-colors duration-500 ${holiday === 'halloween' ? 'halloween-bg' : 'paw-print-bg'}`}>
      {/* Halloween decorations overlay */}
      <HalloweenDecorations />
      
      <NavbarRedesigned />
      <main className={`flex-grow ${!fullWidth && "container mx-auto px-4"} ${centered && "flex items-center justify-center"} relative z-10`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default SpookyLayout;