import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Check, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { authApi } from "@/api/client"; // Import the centralized API client

const UserProfile = () => {
  const { toast } = useToast();
  const { token, user } = useAuth(); // Get token and user from AuthContext
  const [isEditing, setIsEditing] = useState(false);
  
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    preferences: ""
  });

  const [formData, setFormData] = useState({...userData});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use the new authApi client
        const data = await authApi.getProfile();
        setUserData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          preferences: data.preferences || ""
        });
        setFormData({ // Initialize form data with fetched user data
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          preferences: data.preferences || ""
        });
      } catch (err: any) {
        setError(err.message);
        toast({
          variant: "destructive",
          title: "Error fetching profile",
          description: err.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    // Check if user is authenticated (token exists) before fetching
    if (token) {
      loadUserProfile();
    } else if (!user && !isLoading) { // If no user and not already loading (e.g. initial state)
        setError("Not authenticated. Please log in.");
        setIsLoading(false);
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to view your profile.",
        });
    }
  }, [token, user, toast, isLoading]); // Added user and isLoading to dependency array

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Use the new authApi client for updating profile
      const updatedUser = await authApi.updateProfile(formData);
      setUserData({ // Update local state with response from API
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        address: updatedUser.address || "",
        preferences: updatedUser.preferences || ""
      });
      setFormData({...updatedUser});
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
        className: "bg-green-500 text-white", // Keep success styling
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({...userData});
    setIsEditing(false);
  };

  if (isLoading && !error && !userData.email) { // Initial load
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand-red" />
        <p className="ml-2">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
        <h3 className="text-xl font-semibold text-red-600">An Error Occurred</h3>
        <p className="text-muted-foreground">{error}</p>
        {/* Optionally, add a retry button or link to login */}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <User className="h-6 w-6 mr-2 text-brand-red" />
          Your Profile
        </h2>
        
        {!isEditing && (
          <Button 
            onClick={() => setIsEditing(true)}
            variant="outline"
            disabled={isLoading} // Disable edit button during any loading state
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
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading} // Email usually not editable, or requires verification. For now, allow.
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="preferences">Communication Preferences</Label>
                  <Textarea
                    id="preferences"
                    name="preferences"
                    value={formData.preferences}
                    onChange={handleChange}
                    rows={3}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-red hover:bg-red-700 text-white" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                  <p className="text-lg">{userData.name || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email Address</h3>
                  <p className="text-lg">{userData.email || "-"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3>
                  <p className="text-lg">{userData.phone || "Not provided"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                  <p className="text-lg">{userData.address || "Not provided"}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Communication Preferences</h3>
                <p className="whitespace-pre-wrap">{userData.preferences || "Not specified"}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
