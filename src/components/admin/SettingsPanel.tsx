
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Settings, User, Save, CheckCircle } from "lucide-react";

const SettingsPanel = () => {
  const [formData, setFormData] = useState({
    businessName: "GDS Puppies",
    ownerName: "Jane Smith",
    email: "info@gdspuppies.com",
    phone: "(555) 123-4567",
    address: "123 Puppy Lane, Dogtown, CA 90210",
    taxRate: "7.25",
    defaultPriceCurrency: "USD",
    logoUrl: "",
    emailNotifications: true,
    smsNotifications: true,
    automaticReceipts: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <h2 className="text-3xl font-bold flex items-center">
          <Settings className="mr-2 h-8 w-8 text-brand-red" />
          Admin Settings
        </h2>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-md">
            <CardHeader className="bg-gray-50">
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Business Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Business Address
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red resize-none"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Tax Rate (%)
                    </label>
                    <input
                      type="text"
                      name="taxRate"
                      value={formData.taxRate}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Currency
                    </label>
                    <select
                      name="defaultPriceCurrency"
                      value={formData.defaultPriceCurrency}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="CAD">CAD (C$)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="AUD">AUD (A$)</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Business Logo
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      name="logoUrl"
                      value={formData.logoUrl}
                      onChange={handleInputChange}
                      placeholder="Upload or enter logo URL"
                      className="w-full p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-brand-red"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-l-none"
                    >
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-md">
            <CardHeader className="bg-gray-50">
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <span>Email notifications for new inquiries</span>
                  </label>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2">
                    <span 
                      className={`${formData.emailNotifications ? "bg-brand-red" : "bg-gray-200"} inline-flex h-6 w-11 items-center rounded-full transition-colors`} 
                    >
                      <span 
                        className={`${formData.emailNotifications ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 rounded-full bg-white transition-transform`} 
                      />
                    </span>
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={formData.emailNotifications}
                      onChange={handleInputChange}
                      className="absolute opacity-0 h-0 w-0"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <span>SMS notifications for sales</span>
                  </label>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2">
                    <span 
                      className={`${formData.smsNotifications ? "bg-brand-red" : "bg-gray-200"} inline-flex h-6 w-11 items-center rounded-full transition-colors`} 
                    >
                      <span 
                        className={`${formData.smsNotifications ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 rounded-full bg-white transition-transform`} 
                      />
                    </span>
                    <input
                      type="checkbox"
                      name="smsNotifications"
                      checked={formData.smsNotifications}
                      onChange={handleInputChange}
                      className="absolute opacity-0 h-0 w-0"
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <span>Send automatic receipts</span>
                  </label>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-red focus:ring-offset-2">
                    <span 
                      className={`${formData.automaticReceipts ? "bg-brand-red" : "bg-gray-200"} inline-flex h-6 w-11 items-center rounded-full transition-colors`} 
                    >
                      <span 
                        className={`${formData.automaticReceipts ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 rounded-full bg-white transition-transform`} 
                      />
                    </span>
                    <input
                      type="checkbox"
                      name="automaticReceipts"
                      checked={formData.automaticReceipts}
                      onChange={handleInputChange}
                      className="absolute opacity-0 h-0 w-0"
                    />
                  </div>
                </div>
                
                <div className="pt-4 mt-4 border-t">
                  <h3 className="font-medium mb-3">Security Settings</h3>
                  
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                    >
                      Change Password
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                    >
                      Two-Factor Authentication
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                    >
                      Manage API Keys
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 mt-4 border-t">
                  <h3 className="font-medium mb-3">Danger Zone</h3>
                  
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Clear All Transactions
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6 flex items-center justify-end">
          {saveSuccess && (
            <div className="flex items-center text-green-600 mr-4 animate-fade-in">
              <CheckCircle className="h-5 w-5 mr-1" />
              Settings saved successfully!
            </div>
          )}
          <Button
            type="submit"
            className="bg-brand-red hover:bg-red-700 text-white min-w-32"
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              <span className="flex items-center">
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPanel;
