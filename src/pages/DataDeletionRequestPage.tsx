import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertTriangle, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

// Input validation schema
const dataDeletionSchema = z.object({
  name: z.string().trim().max(255, "Name must be less than 255 characters").optional().or(z.literal("")),
  email: z.string().trim().email("Invalid email address").max(255, "Email must be less than 255 characters"),
  account_creation_timeframe: z.string().max(100, "Timeframe must be less than 100 characters").optional().or(z.literal("")),
  puppy_ids: z.string().trim().max(500, "Puppy IDs must be less than 500 characters").optional().or(z.literal("")),
  additional_details: z.string().trim().max(2000, "Additional details must be less than 2000 characters").optional().or(z.literal(""))
});

/**
 * @component DataDeletionRequestPage
 * @description A secure page for authenticated users to submit requests for the deletion of their personal data.
 * Includes comprehensive input validation, authentication checks, and proper error handling.
 * The form collects information to help identify the user's data and submits the request to a secure
 * Supabase edge function with enhanced security measures.
 *
 * @returns {JSX.Element} The rendered data deletion request page.
 */
const DataDeletionRequestPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Auth check error:', error);
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(!!session);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);

  /**
   * @function handleChange
   * @description Handles changes for the input and textarea elements in the form with real-time validation.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The event object.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * @function handleSelectChange
   * @description Handles changes for the Select component in the form.
   * @param {string} value - The new value from the select component.
   */
  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, account_creation_timeframe: value });
  };

  /**
   * @function handleSubmit
   * @description Handles the secure form submission for the data deletion request with comprehensive validation.
   * @param {React.FormEvent<HTMLFormElement>} e - The form event object.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    setValidationErrors({});

    // Check authentication before proceeding
    if (!isAuthenticated) {
      setError("You must be logged in to submit a data deletion request. Please log in and try again.");
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to submit a data deletion request.",
        action: (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
        ),
      });
      return;
    }

    // Validate form data using zod schema
    try {
      dataDeletionSchema.parse(formData);
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        validationError.issues.forEach((err) => {
          if (err.path[0]) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setValidationErrors(errors);
        setIsLoading(false);
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please fix the errors in the form and try again.",
        });
        return;
      }
    }

    // Business logic validation
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
      // Use Supabase edge function for secure data deletion requests
      const { error } = await supabase.functions.invoke('secure-data-deletion-request', {
        body: formData
      });
      
      if (error) throw error;
      setIsSuccess(true);
      toast({
        title: "Request Submitted",
        description: "Your data deletion request has been successfully submitted and logged for security.",
        className: "bg-green-500 text-white",
      });
      setFormData({ name: "", email: "", account_creation_timeframe: "", puppy_ids: "", additional_details: "" });
    } catch (err: any) {
      let errorMsg = "An unexpected error occurred.";
      
      if (err.message?.includes("JWT")) {
        errorMsg = "Session expired. Please log in again.";
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.message?.includes("rate")) {
        errorMsg = "Too many requests. Please wait before submitting again.";
      } else {
        errorMsg = err.response?.data?.details?.[0] || err.response?.data?.error || err.message || errorMsg;
      }
      
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

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="container mx-auto max-w-2xl py-12 px-4 flex items-center justify-center">
        <Card className="w-full">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Verifying authentication...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show login requirement if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto max-w-2xl py-12 px-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-brand-blue flex items-center justify-center gap-2">
              <Shield className="h-6 w-6" />
              Authentication Required
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              You must be logged in to submit a data deletion request for security purposes.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Alert className="mb-6">
              <Shield className="h-4 w-4" />
              <AlertTitle>Security Notice</AlertTitle>
              <AlertDescription>
                Data deletion requests require authentication to prevent unauthorized access to personal information and ensure request legitimacy.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <Button asChild className="w-full">
                <Link to="/login">Login to Submit Request</Link>
              </Button>
              
              <p className="text-sm text-muted-foreground">
                Don't have an account? <Link to="/register" className="text-brand-red hover:underline">Create one here</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-brand-blue flex items-center justify-center gap-2">
            <Shield className="h-6 w-6" />
            Request Data Deletion
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Submit a secure, authenticated request to have your personal data removed from our systems.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
            <h4 className="font-semibold mb-2 text-blue-800 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Secure Data Deletion Process:
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>This form is secure and requires authentication to prevent unauthorized requests.</li>
              <li>All submissions are automatically logged for security audit purposes.</li>
              <li>An administrator will review your request and may contact you for identity verification.</li>
              <li>Please provide accurate information to help us locate your data efficiently.</li>
              <li>Transactional records may be retained for legal/financial auditing with personal identifiers anonymized.</li>
              <li>You will receive confirmation once your request has been processed.</li>
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
                maxLength={255}
                className={validationErrors.name ? "border-red-500" : ""}
              />
              {validationErrors.name && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.name}</p>
              )}
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
                maxLength={255}
                className={validationErrors.email ? "border-red-500" : ""}
              />
              {validationErrors.email && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>
              )}
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
                maxLength={500}
                className={validationErrors.puppy_ids ? "border-red-500" : ""}
              />
              {validationErrors.puppy_ids && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.puppy_ids}</p>
              )}
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
                required={!formData.name}
                maxLength={2000}
                className={validationErrors.additional_details ? "border-red-500" : ""}
              />
              {validationErrors.additional_details && (
                <p className="text-sm text-red-500 mt-1">{validationErrors.additional_details}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">This field is required if Name is not provided.</p>
            </div>

            <Button type="submit" className="w-full bg-brand-red hover:bg-red-700 text-white" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting Secure Request...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Submit Secure Deletion Request
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataDeletionRequestPage;
