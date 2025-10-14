import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Sun, Moon, Sparkles, User, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import GlobalSearch from '@/components/search/GlobalSearch';
import NotificationDropdown from '@/components/NotificationDropdown';
import { PawIcon, BoneIcon, HeartPawIcon } from '@/components/PuppyIcons';
import { BrandLogo } from '@/components/BrandLogo';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Home', path: '/', icon: HeartPawIcon },
  { label: 'Puppies', path: '/puppies', icon: PawIcon },
  { label: 'Litters', path: '/litters', icon: BoneIcon },
  { label: 'About', path: '/about' },
  { label: 'Health', path: '/health' },
  { label: 'Reviews', path: '/reviews' },
  { label: 'Contact', path: '/contact' },
];

export const NavbarRedesigned = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  const cycleTheme = () => {
    const themes: ('light' | 'dimmed' | 'dark')[] = ['light', 'dimmed', 'dark'];
    const currentIndex = themes.indexOf(resolvedTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  const ThemeIcon = resolvedTheme === 'dark' ? Moon : resolvedTheme === 'dimmed' ? Sparkles : Sun;

  return (
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <BrandLogo variant="auto" className="h-10" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden laptop:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      "hover:bg-accent/10 hover:text-accent",
                      "flex items-center gap-2 group relative"
                    )}
                  >
                    {Icon && <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                    {link.label}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300" />
                  </Link>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:flex relative group"
              >
                <Search className="w-5 h-5" />
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>

              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={cycleTheme}
                className="relative group"
              >
                <ThemeIcon className="w-5 h-5 transition-transform group-hover:rotate-12" />
              </Button>

              {/* Notifications (for logged in users) */}
              {user && <NotificationDropdown />}

              {/* User Menu */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative group">
                      <User className="w-5 h-5" />
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      Admin Panel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  onClick={() => navigate('/login')}
                  className="hidden md:flex gap-2 group"
                  variant="default"
                >
                  <User className="w-4 h-4" />
                  Sign In
                </Button>
              )}

              {/* Mobile Menu */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="laptop:hidden">
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-background">
                  <SheetTitle className="flex items-center gap-2 mb-6">
                    <PawIcon className="w-6 h-6 text-primary" />
                    <span className="font-heading">Menu</span>
                  </SheetTitle>
                  <div className="flex flex-col gap-2">
                    {/* Search on mobile */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsOpen(false);
                        setIsSearchOpen(true);
                      }}
                      className="w-full justify-start gap-3 mb-4"
                    >
                      <Search className="w-5 h-5" />
                      <span>Search</span>
                    </Button>
                    
                    {/* Navigation Links */}
                    {navLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.path}
                          to={link.path}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/10 transition-colors group"
                        >
                          {Icon && <Icon className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />}
                          <span className="font-medium">{link.label}</span>
                        </Link>
                      );
                    })}
                    
                    <div className="my-4 border-t border-border" />
                    
                    {/* User Actions */}
                    {user ? (
                      <>
                        <Link
                          to="/dashboard"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/10 transition-colors"
                        >
                          <User className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">Dashboard</span>
                        </Link>
                        <Link
                          to="/admin"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent/10 transition-colors"
                        >
                          <Bell className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">Admin Panel</span>
                        </Link>
                        <Button
                          onClick={() => {
                            setIsOpen(false);
                            handleSignOut();
                          }}
                          variant="outline"
                          className="w-full justify-start gap-3 mt-2"
                        >
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/login');
                        }}
                        className="w-full gap-2"
                      >
                        <User className="w-4 h-4" />
                        Sign In
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Decorative Border */}
        <div className="h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-50" />
      </nav>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
