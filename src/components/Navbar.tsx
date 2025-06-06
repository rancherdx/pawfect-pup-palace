
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Sun, Moon, PawPrint, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useTheme } from "@/components/ThemeProvider";
import { motion } from "framer-motion";
import GlobalSearch from "@/components/search/GlobalSearch";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { theme, setTheme } = useTheme();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    
    toast({
      title: newTheme === "light" ? "Light mode activated" : "Dark mode activated",
      description: newTheme === "light" ? "Bright and playful, just like our puppies!" : "Cozy and calm, like puppy nap time.",
    });
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Litters", path: "/litters" },
    { name: "Stud Service", path: "/stud" },
    { name: "Payment Options", path: "/financing" },
    { name: "Blog", path: "/blog" },
    { name: "Reviews", path: "/reviews" },
    { name: "Health Guarantee", path: "/health" },
    { name: "FAQ", path: "/faq" }, // Added FAQ link
    { name: "Contact", path: "/contact" },
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border shadow-sm"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <PawPrint className="h-8 w-8 text-brand-red group-hover:animate-wiggle" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-red to-red-700 bg-clip-text text-transparent">GDS Puppies</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path} 
                  className="nav-link font-medium"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Search, Theme Toggle and Mobile Menu */}
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSearchOpen(true)} 
                aria-label="Search"
                className="rounded-full hover:bg-primary/10 transition-colors"
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme} 
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="rounded-full hover:bg-primary/10 transition-colors"
              >
                {theme === "dark" ? 
                  <Sun className="h-5 w-5 text-yellow-300" /> : 
                  <Moon className="h-5 w-5 text-slate-700" />
                }
              </Button>

              {/* Mobile Menu Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden rounded-full"
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobile && isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="pt-4 pb-3 border-t border-border mt-2"
            >
              <div className="flex flex-col space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="px-4 py-2 rounded-md hover:bg-accent transition-colors flex items-center space-x-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <PawPrint className="h-4 w-4 text-brand-red" />
                    <span>{link.name}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>

      {/* Global Search Dialog */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
