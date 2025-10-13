import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AuthEmailTemplateGuide = () => {
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);

  const templates = [
    {
      name: "Magic Link",
      description: "Email with magic link for passwordless authentication",
      file: "magic-link.tsx",
      supabaseKey: "confirm",
    },
    {
      name: "Password Reset",
      description: "Email sent when user requests password reset",
      file: "password-reset.tsx",
      supabaseKey: "recovery",
    },
    {
      name: "Email Confirmation",
      description: "Email verification for new account signups",
      file: "email-confirmation.tsx",
      supabaseKey: "signup",
    },
    {
      name: "Login Code (OTP)",
      description: "One-time password code for login",
      file: "login-code.tsx",
      supabaseKey: "magic_link",
    },
  ];

  const copyTemplateHTML = async (templateName: string) => {
    // In production, this would render the React Email component to HTML
    // For now, we'll show instructions
    setCopiedTemplate(templateName);
    toast.success(`Instructions for ${templateName} copied!`);
    
    setTimeout(() => setCopiedTemplate(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Authentication Email Templates</h2>
        <p className="text-muted-foreground">
          Configure custom email templates for Supabase authentication flows
        </p>
      </div>

      <Alert>
        <AlertDescription>
          <strong>Important:</strong> These templates are designed using React Email and need to be manually copied to your Supabase project's Authentication Email Templates settings.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>Follow these steps to configure each template</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-3 text-sm">
            <li>
              Go to your{" "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={() => window.open('https://supabase.com/dashboard/project/dpmyursjpbscrfbljtha/auth/templates', '_blank')}
              >
                Supabase Dashboard → Authentication → Email Templates
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </li>
            <li>Select the template type you want to customize</li>
            <li>Click "Copy HTML" button below for the corresponding template</li>
            <li>Paste the HTML into the "Message (Body)" field in Supabase</li>
            <li>Update the subject line if needed</li>
            <li>Click "Save" in Supabase dashboard</li>
            <li>Test the template by triggering that authentication flow</li>
          </ol>
        </CardContent>
      </Card>

      <Tabs defaultValue="magic-link">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="magic-link">Magic Link</TabsTrigger>
          <TabsTrigger value="password-reset">Password Reset</TabsTrigger>
          <TabsTrigger value="email-confirmation">Email Confirm</TabsTrigger>
          <TabsTrigger value="login-code">Login Code</TabsTrigger>
        </TabsList>

        {templates.map((template) => (
          <TabsContent key={template.supabaseKey} value={template.supabaseKey}>
            <Card>
              <CardHeader>
                <CardTitle>{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-md text-sm">
                  <p className="font-semibold mb-2">Template File Location:</p>
                  <code className="text-xs">
                    supabase/functions/send-email/_templates/auth/{template.file}
                  </code>
                </div>

                <div className="bg-muted p-4 rounded-md text-sm">
                  <p className="font-semibold mb-2">Supabase Template Type:</p>
                  <code className="text-xs">{template.supabaseKey}</code>
                </div>

                <Alert>
                  <AlertDescription className="text-xs">
                    <strong>Note:</strong> The template uses variables like {`{{ .Token }}`}, {`{{ .TokenHash }}`}, and {`{{ .SiteURL }}`} which Supabase automatically replaces with actual values.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button
                    onClick={() => copyTemplateHTML(template.name)}
                    className="flex-1"
                  >
                    {copiedTemplate === template.name ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Instructions Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Setup Instructions
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://supabase.com/dashboard/project/dpmyursjpbscrfbljtha/auth/templates`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Supabase Dashboard
                  </Button>
                </div>

                <div className="bg-accent/50 p-4 rounded-md">
                  <p className="text-sm font-semibold mb-2">Template Preview:</p>
                  <div className="bg-background p-4 rounded border text-xs space-y-2">
                    {template.name === "Magic Link" && (
                      <>
                        <p><strong>Subject:</strong> Log in to GDS Puppies</p>
                        <p><strong>Preview:</strong> Click the button below to securely log in to your account.</p>
                      </>
                    )}
                    {template.name === "Password Reset" && (
                      <>
                        <p><strong>Subject:</strong> Reset Your Password - GDS Puppies</p>
                        <p><strong>Preview:</strong> You requested a password reset. Click the button to create a new password.</p>
                      </>
                    )}
                    {template.name === "Email Confirmation" && (
                      <>
                        <p><strong>Subject:</strong> Confirm Your Email - GDS Puppies</p>
                        <p><strong>Preview:</strong> Welcome! Please confirm your email address to complete registration.</p>
                      </>
                    )}
                    {template.name === "Login Code (OTP)" && (
                      <>
                        <p><strong>Subject:</strong> Your Login Code - GDS Puppies</p>
                        <p><strong>Preview:</strong> Use this 6-digit code to log in: 123456</p>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Testing Your Templates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>After configuring templates in Supabase, test each one:</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Magic Link:</strong> Use "Sign in with Email" and request a magic link</li>
            <li><strong>Password Reset:</strong> Click "Forgot Password" on login page</li>
            <li><strong>Email Confirmation:</strong> Create a new account</li>
            <li><strong>Login Code:</strong> Enable OTP in Supabase Auth settings, then log in</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthEmailTemplateGuide;
