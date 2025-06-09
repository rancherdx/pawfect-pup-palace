import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from "@/api/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const DataDeletionRequestPage = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    account_creation_timeframe: "",
    puppy_ids: "",
    additional_details: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, account_creation_timeframe: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);

    if (!formData.email || (!formData.name && !formData.additional_details)) {
        setError("Email and either Name or Additional Details are required to help us identify your data.");
        setIsLoading(false);
        toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Email and either Name or Additional Details are required.",
        });
        return;
    }

    try {
      await apiRequest("/privacy/deletion-request", "POST", formData);
      setIsSuccess(true);
      toast({
        title: "Request Submitted",
        description: "Your data deletion request has been successfully submitted.",
        className: "bg-green-500 text-white",
      });
      setFormData({ name: "", email: "", account_creation_timeframe: "", puppy_ids: "", additional_details: "" }); // Reset form
    } catch (err: any) {
      const errorMsg = err.response?.data?.details?.[0] || err.response?.data?.error || err.message || "An unexpected error occurred.";
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container mx-auto max-w-2xl py-12 px-4">
        <Alert className="bg-green-50 border-green-400 text-green-700">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <AlertTitle className="font-semibold">Request Submitted Successfully!</AlertTitle>
          <AlertDescription>
            Thank you. Your data deletion request has been received. An administrator will review it shortly.
            You will be contacted via the email provided if further information is needed.
            <div className="mt-4">
                <Button asChild variant="link"><Link to="/">Return to Homepage</Link></Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-brand-blue">Request Data Deletion</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Submit a request to have your personal data removed from our systems.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
            <h4 className="font-semibold mb-2 text-blue-800">Important Information:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Submitting this form initiates a request for the deletion of your personal data, such as your name, email, address, and phone number.</li>
              <li>This process is manual. An administrator will review your request and may contact you for verification.</li>
              <li>Please provide as much accurate information as possible to help us locate your data.</li>
              <li>Transactional records related to purchases (e.g., adoption payments) may be retained for legal and financial auditing purposes with personal identifiers removed or anonymized where feasible.</li>
            </ul>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Full Name (Optional)</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                maxLength={250}
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                required
                maxLength={250}
              />
            </div>

            <div>
              <Label htmlFor="account_creation_timeframe">Approximate Account Creation Timeframe (Optional)</Label>
              <Select name="account_creation_timeframe" onValueChange={handleSelectChange} value={formData.account_creation_timeframe}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="within_last_6_months">Within last 6 months</SelectItem>
                  <SelectItem value="6_12_months_ago">6-12 months ago</SelectItem>
                  <SelectItem value="1_2_years_ago">1-2 years ago</SelectItem>
                  <SelectItem value="over_2_years_ago">Over 2 years ago</SelectItem>
                  <SelectItem value="unsure">Unsure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="puppy_ids">Associated Puppy ID(s) (Optional)</Label>
              <Input
                id="puppy_ids"
                name="puppy_ids"
                value={formData.puppy_ids}
                onChange={handleChange}
                placeholder="e.g., puppy-001, puppy-002 (IDs of puppies you inquired about or adopted)"
                maxLength={490}
              />
               <p className="text-xs text-muted-foreground mt-1">Comma-separated list if multiple.</p>
            </div>

            <div>
              <Label htmlFor="additional_details">Additional Details <span className="text-red-500">*</span></Label>
              <Textarea
                id="additional_details"
                name="additional_details"
                value={formData.additional_details}
                onChange={handleChange}
                rows={4}
                placeholder="Please provide any other information that could help us locate your account, especially if you used multiple emails or are unsure of the exact email used. E.g., other email addresses, specific puppy names you inquired about, approximate dates of interaction."
                required={!formData.name} // Required if name is not provided
                maxLength={1900}
              />
              <p className="text-xs text-muted-foreground mt-1">This field is required if Name is not provided.</p>
            </div>

            <Button type="submit" className="w-full bg-brand-red hover:bg-red-700 text-white" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : "Submit Deletion Request"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataDeletionRequestPage;
