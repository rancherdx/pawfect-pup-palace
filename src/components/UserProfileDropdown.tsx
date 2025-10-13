import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  MessageSquare, 
  PawPrint, 
  LayoutDashboard, 
  LogOut, 
  Settings,
  ShieldCheck 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function UserProfileDropdown() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const userRoles = user?.roles || [];

  useEffect(() => {
    if (user?.id) {
      supabase
        .from("profiles")
        .select("profile_photo_url")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data?.profile_photo_url) {
            setProfilePhoto(data.profile_photo_url);
          }
        });
    }
  }, [user?.id]);

  if (!isAuthenticated) {
    return (
      <div className="flex gap-2">
        <Button variant="ghost" asChild>
          <Link to="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link to="/register">Register</Link>
        </Button>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isSuperAdmin = userRoles.includes("super-admin");
  const isAdmin = userRoles.includes("admin") || isSuperAdmin;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={profilePhoto || undefined} alt="Profile" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <PawPrint className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user?.email}</p>
            <p className="text-xs text-muted-foreground">
              {isSuperAdmin ? "Super Admin" : isAdmin ? "Admin" : "User"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isSuperAdmin && (
          <DropdownMenuItem asChild>
            <Link to="/admin" className="cursor-pointer">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Admin Dashboard
            </Link>
          </DropdownMenuItem>
        )}

        {isAdmin && !isSuperAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/admin" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Admin Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard" className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                User Dashboard
              </Link>
            </DropdownMenuItem>
          </>
        )}

        {!isAdmin && (
          <>
            <DropdownMenuItem asChild>
              <Link to="/dashboard" className="cursor-pointer">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard?tab=profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard?tab=messages" className="cursor-pointer">
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard?tab=creatures" className="cursor-pointer">
                <PawPrint className="mr-2 h-4 w-4" />
                Creature Profiles
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
