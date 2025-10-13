
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Search, Bell, Moon, Sun, PawPrint, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import GlobalSearch from "@/components/search/GlobalSearch";
import NotificationDropdown from "@/components/NotificationDropdown";
import UserProfileDropdown from "@/components/UserProfileDropdown";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { 
      label: "Our Puppies",
      subLinks: [
        { path: "/puppies", label: "Available Puppies" },
        { path: "/litters", label: "Litters" },
      ]
    },
    { 
      label: "Services",
      subLinks: [
        { path: "/stud-service", label: "Stud Services" },
        { path: "/financing", label: "Financing Options" },
      ]
    },
    { path: "/about", label: "About" },
    { path: "/reviews", label: "Reviews" },
    { path: "/contact", label: "Contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b-2 border-border bg-background shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link 
              to="/" 
              aria-label="Pawfect Pup Palace, Homepage"
              className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-primary transition-colors"
            >
              <PawPrint className="h-6 w-6 text-primary" aria-hidden="true" />
              <span className="hidden sm:inline">Pawfect Pup Palace</span>
            </Link>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {navLinks.map((link) => {
                  if ('subLinks' in link) {
                    return (
                      <NavigationMenuItem key={link.label}>
                        <NavigationMenuTrigger className="text-foreground hover:bg-muted">
                          {link.label}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[200px] gap-2 p-3">
                            {link.subLinks.map((subLink) => (
                              <li key={subLink.path}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    to={subLink.path}
                                    className={`block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${
                                      isActive(subLink.path) ? "bg-primary text-primary-foreground" : ""
                                    }`}
                                  >
                                    <div className="text-sm font-medium">{subLink.label}</div>
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    );
                  }
                  return (
                    <NavigationMenuItem key={link.path}>
                      <Link to={link.path}>
                        <NavigationMenuLink
                          className={`px-4 py-2 rounded-md font-medium transition-colors ${
                            isActive(link.path)
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          {link.label}
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="h-11 w-11"
                aria-label="Open search"
              >
                <Search className="h-5 w-5" aria-hidden="true" />
              </Button>

              <NotificationDropdown />

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="h-11 w-11"
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === "light" ? (
                  <Moon className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Sun className="h-5 w-5" aria-hidden="true" />
                )}
              </Button>

              {isAuthenticated ? (
                <UserProfileDropdown />
              ) : (
                <Button asChild variant="default" className="hidden md:flex">
                  <Link to="/login">Sign In</Link>
                </Button>
              )}

              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden h-11 w-11" aria-label="Open menu">
                    <Menu className="h-6 w-6" aria-hidden="true" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                  <nav className="flex flex-col gap-4 mt-8">
                    {navLinks.map((link) => {
                      if ('subLinks' in link) {
                        return (
                          <div key={link.label} className="space-y-2">
                            <div className="px-4 py-2 font-semibold text-muted-foreground">
                              {link.label}
                            </div>
                            {link.subLinks.map((subLink) => (
                              <Link
                                key={subLink.path}
                                to={subLink.path}
                                className={`pl-8 pr-4 py-2 rounded-md font-medium transition-colors block ${
                                  isActive(subLink.path)
                                    ? "bg-primary text-primary-foreground"
                                    : "text-foreground hover:bg-muted"
                                }`}
                              >
                                {subLink.label}
                              </Link>
                            ))}
                          </div>
                        );
                      }
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          className={`px-4 py-3 rounded-md font-medium text-lg transition-colors ${
                            isActive(link.path)
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                    {!isAuthenticated && (
                      <Button asChild variant="default" className="mx-4 mt-4">
                        <Link to="/login">Sign In</Link>
                      </Button>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Navbar;
