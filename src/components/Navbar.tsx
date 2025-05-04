
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Sun, Moon, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useMediaQuery } from "@/hooks/use-media-query";

const Navbar = () => {
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
    
    toast({
      title: isDark ? "Light mode activated" : "Dark mode activated",
      description: isDark ? "Bright and playful, just like our puppies!" : "Cozy and calm, like puppy nap time.",
    });
  };

  useEffect(() => {
    // Check user's preferred theme
    const userPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDark(userPrefersDark);
    if (userPrefersDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Available Puppies", path: "/puppies" },
    { name: "Adopt", path: "/adopt" },
    { name: "Reviews", path: "/reviews" },
    { name: "Health Guarantee", path: "/health" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="relative">
              <PawPrint className="h-8 w-8 text-brand-red animate-wiggle" />
            </div>
            <span className="text-xl font-bold text-foreground">GDS Puppies</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className="nav-link font-medium">
                {link.name}
              </Link>
            ))}
          </div>

          {/* Theme Toggle and Mobile Menu */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobile && isMenuOpen && (
          <div className="pt-4 pb-3 border-t border-border mt-2 animate-accordion-down">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="px-2 py-1 rounded-md hover:bg-accent transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
