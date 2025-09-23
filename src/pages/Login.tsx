
import { useState, ChangeEvent, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserLoginData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertCircle, LogIn } from "lucide-react";

/**
 * @component Login
 * @description The login page component for user authentication. It provides a form for users
 * to enter their email and password. It handles the login process, displays errors,
 * and redirects authenticated users to their appropriate dashboard or default route.
 *
 * @returns {JSX.Element} The rendered login page.
 */
export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, getDefaultRoute, authStatus } = useAuth();
  const [credentials, setCredentials] = useState<UserLoginData>({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already authenticated and roles are loaded
  useEffect(() => {
    if (isAuthenticated && authStatus === 'loaded') {
      navigate(getDefaultRoute());
    }
  }, [isAuthenticated, authStatus, navigate, getDefaultRoute]);

  /**
   * @function handleChange
   * @description Updates the credentials state when the user types in the input fields.
   * @param {ChangeEvent<HTMLInputElement>} e - The change event from the input field.
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.id]: e.target.value });
  };

  /**
   * @function handleSubmit
   * @description Handles the form submission for logging in the user. It calls the login function
   * from the AuthContext, handles errors, and provides user feedback via toasts.
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(credentials);
      toast.success("Login successful!");
      // Navigation will be handled by useEffect when authStatus becomes 'loaded'
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Failed to login. Please check your credentials.");
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Login to manage your puppy account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 p-3 rounded-md flex items-start gap-3 text-red-800">
                <AlertCircle className="h-5 w-5 mt-0.5" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={credentials.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="mr-2 h-4 w-4" />
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
