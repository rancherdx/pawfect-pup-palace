import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User as UserIcon, Check, AlertCircle, Loader2 } from "lucide-react"; // Renamed User to UserIcon to avoid conflict
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/api/unifiedApi"; // Fixed import
import { User, UserProfileUpdateData } from "@/types"; // Import User and UserProfileUpdateData

const UserProfile = () => {
  const { toast } = useToast();
  const { user, updateUser, isLoading: isAuthLoading } = useAuth(); // Get user and updateUser from AuthContext

  const [isEditing, setIsEditing] = useState(false);
  // Form data will only hold fields that can be updated.
  // Initialize with user's current data when editing starts.
  const [formData, setFormData] = useState<UserProfileUpdateData>({});
  
  const [isUpdating, setIsUpdating] = useState(false); // Separate loading state for profile update
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (user && isEditing) {
      // Initialize formData with fields from the global User type that are updatable
      // Currently UserProfileUpdateData is Partial<Omit<User, 'id' | 'email' | 'roles' | 'createdAt' | 'lastLogin'>>
      // This means only 'name' is directly updatable from the core User fields.
      // If UserProfileUpdateData is expanded to include other fields like 'avatarUrl', they would be set here.
      setFormData({
        name: user.name || "",
        // If other fields like phone, address, preferences were part of UserProfileUpdateData and User type:
        // phone: user.phone || "",
        // address: user.address || "",
        // preferences: user.preferences || ""
      });
    }
  }, [user, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);
    try {
      const updatedUserFromApi: User = await authApi.updateProfile(formData);
      updateUser(updatedUserFromApi); // Update context with the full user object from API
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
        className: "bg-green-500 text-white",
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    // Reset formData from current user state if needed, or just exit editing mode
    if (user) {
      setFormData({ name: user.name }); // Reset to current user's name
    }
    setIsEditing(false);
  };

  if (isAuthLoading && !user) { // Auth context is loading user
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
        <p className="ml-2">Loading your profile...</p>
      </div>
    );
  }

  if (!user) { // No user and auth is not loading (e.g. not logged in)
    return (
      <div className="text-center py-10">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-red-600">Profile Not Available</h3>
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </div>
    );
  }

  // Display error from profile update attempt if any
   if (error && !isEditing) { // Show general error if not in editing mode (where form might show field specific errors)
     return (
       <div className="text-center py-10">
         <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
         <h3 className="text-xl font-semibold text-red-600">An Error Occurred</h3>
         <p className="text-muted-foreground">{error}</p>
       </div>
     );
   }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <UserIcon className="h-6 w-6 mr-2 text-brand-red" />
          Your Profile
        </h2>
        
        {!isEditing && (
          <Button 
            onClick={() => setIsEditing(true)}
            variant="outline"
            disabled={isUpdating}
          >
            Edit Profile
          </Button>
        )}
      </div>
      
      <Card>
        <CardContent className="pt-6">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-50 p-3 rounded-md flex items-start gap-3 text-red-800">
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name || ""} // Controlled component from UserProfileUpdateData
                    onChange={handleChange}
                    required
                    disabled={isUpdating}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={user.email} // Email is not part of UserProfileUpdateData, display only
                    readOnly
                    disabled
                    className="bg-muted/50"
                  />
                </div>
                
                {/* Add other fields here if they become part of UserProfileUpdateData and User type */}
                {/* Example for a hypothetical 'phone' field:
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    disabled={isUpdating}
                  />
                </div>
                */}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isUpdating}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-red hover:bg-red-700 text-white" disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                  <p className="text-lg">{user.name || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email Address</h3>
                  <p className="text-lg">{user.email || "-"}</p>
                </div>
                
                {/* Display other fields from user object if they exist and are relevant */}
                {/* Example for hypothetical 'phone' field:
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3>
                  <p className="text-lg">{user.phone || "Not provided"}</p>
                </div>
                */}
              </div>
              <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Roles</h3>
                  <p className="text-lg">{user.roles?.join(', ') || "No roles assigned"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
