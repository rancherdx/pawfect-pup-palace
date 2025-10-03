
import { ReactNode, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface LayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
  centered?: boolean;
}

const Layout = ({ children, fullWidth = false, centered = false }: LayoutProps) => {
  // Font size preference with localStorage persistence
  const [fontSize, setFontSize] = useLocalStorage("gds-font-size", "normal");
  
  // Apply font size class to body
  useEffect(() => {
    const body = document.body;
    body.classList.remove("text-size-base", "text-size-large", "text-size-xlarge");
    
    switch (fontSize) {
      case "large":
        body.classList.add("text-size-large");
        break;
      case "xlarge":
        body.classList.add("text-size-xlarge");
        break;
      default:
        body.classList.add("text-size-base");
    }
  }, [fontSize]);
  
  // Check for user's system preferences on font size
  useEffect(() => {
    // Check if the user has a system preference for larger text
    const prefersLargerText = window.matchMedia('(prefers-contrast: more)').matches;
    
    if (prefersLargerText && localStorage.getItem("gds-font-size-initialized") !== "true") {
      setFontSize("large");
      localStorage.setItem("gds-font-size-initialized", "true");
    }
  }, [setFontSize]);

  return (
    <div className="flex flex-col min-h-screen bg-background paw-print-bg transition-colors duration-500">
      <Navbar />
      <main className={`flex-grow ${!fullWidth && "container mx-auto px-4"} ${centered && "flex items-center justify-center"}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
