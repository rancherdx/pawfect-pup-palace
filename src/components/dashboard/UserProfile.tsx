
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Check } from "lucide-react";

const UserProfile = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock user data
  const [userData, setUserData] = useState({
    name: "Alex Johnson",
    email: "alex@example.com",
    phone: "(555) 123-4567",
    address: "123 Main St, Anytown, CA 12345",
    preferences: "Please contact me by email for important updates. I'm interested in training resources for my puppies."
  });

  const [formData, setFormData] = useState({...userData});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserData({...formData});
    setIsEditing(false);
    
    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated."
    });
  };

  const handleCancel = () => {
    setFormData({...userData});
    setIsEditing(false);
  };

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
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
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
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-red hover:bg-red-700 text-white">
                  <Check className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Full Name</h3>
                  <p className="text-lg">{userData.name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email Address</h3>
                  <p className="text-lg">{userData.email}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3>
                  <p className="text-lg">{userData.phone}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                  <p className="text-lg">{userData.address}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Communication Preferences</h3>
                <p>{userData.preferences}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
