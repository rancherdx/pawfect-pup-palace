import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, Link as LinkIcon, Upload } from "lucide-react";

const domain = {
  staging: "https://new.gdspuppies.com",
  production: "https://gdspuppies.com",
};

function UrlRow({ label, url }: { label: string; url: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <Input readOnly value={url} />
        <Button type="button" variant="outline" onClick={() => navigator.clipboard.writeText(url)}>Copy</Button>
      </div>
    </div>
  );
}

const SecureIntegrations = () => {
  const { toast } = useToast();

  const [sandbox, setSandbox] = useState({
    applicationId: "",
    accessToken: "",
    locationId: "",
    webhookSignatureKey: "",
  });

  const [production, setProduction] = useState({
    applicationId: "",
    accessToken: "",
    locationId: "",
    webhookSignatureKey: "",
  });

  const [applePayContent, setApplePayContent] = useState("");

  const save = async (env: "sandbox" | "production") => {
    const body = {
      service: "square",
      environment: env,
      data: env === "sandbox" ? sandbox : production,
    };
    const { data, error } = await supabase.functions.invoke("integrations-upsert", { body });
    if (error) {
      toast({ title: "Save failed", description: error.message || String(error), variant: "destructive" });
    } else {
      toast({ title: "Saved", description: `Square (${env}) credentials stored securely.` });
      if (env === "sandbox") setSandbox({ applicationId: "", accessToken: "", locationId: "", webhookSignatureKey: "" });
      else setProduction({ applicationId: "", accessToken: "", locationId: "", webhookSignatureKey: "" });
    }
  };

  const uploadApplePay = async (env: "sandbox" | "production") => {
    if (!applePayContent.trim()) {
      toast({ title: "No content", description: "Paste the Apple Pay verification file contents first." });
      return;
    }
    const { data, error } = await supabase.functions.invoke("applepay-upload", { body: { environment: env, content: applePayContent } });
    if (error) {
      toast({ title: "Upload failed", description: error.message || String(error), variant: "destructive" });
    } else {
      toast({ title: "Uploaded", description: `Stored file for ${env}. Also place it at /.well-known/ path in the repo for domain verification.` });
      setApplePayContent("");
    }
  };

  const webhookUrl = "https://dpmyursjpbscrfbljtha.functions.supabase.co/square-webhook";

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5"/> Secure Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <UrlRow label="Staging Site URL" url={domain.staging} />
              <UrlRow label="Staging Success URL" url={`${domain.staging}/checkout/success`} />
              <UrlRow label="Staging Cancel URL" url={`${domain.staging}/checkout/cancel`} />
              <UrlRow label="Apple Pay File URL (staging)" url={`${domain.staging}/.well-known/apple-developer-merchantid-domain-association`} />
            </div>
            <div className="space-y-3">
              <UrlRow label="Production Site URL" url={domain.production} />
              <UrlRow label="Production Success URL" url={`${domain.production}/checkout/success`} />
              <UrlRow label="Production Cancel URL" url={`${domain.production}/checkout/cancel`} />
              <UrlRow label="Apple Pay File URL (production)" url={`${domain.production}/.well-known/apple-developer-merchantid-domain-association`} />
            </div>
          </div>
          <UrlRow label="Square Webhook URL (both envs)" url={webhookUrl} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LinkIcon className="h-5 w-5"/> Square Sandbox Credentials</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Application ID</Label>
            <Input type="password" value={sandbox.applicationId} onChange={(e) => setSandbox({ ...sandbox, applicationId: e.target.value })} placeholder="••••••" />
          </div>
          <div>
            <Label>Access Token</Label>
            <Input type="password" value={sandbox.accessToken} onChange={(e) => setSandbox({ ...sandbox, accessToken: e.target.value })} placeholder="••••••" />
          </div>
          <div>
            <Label>Location ID</Label>
            <Input type="password" value={sandbox.locationId} onChange={(e) => setSandbox({ ...sandbox, locationId: e.target.value })} placeholder="••••••" />
          </div>
          <div>
            <Label>Webhook Signature Key</Label>
            <Input type="password" value={sandbox.webhookSignatureKey} onChange={(e) => setSandbox({ ...sandbox, webhookSignatureKey: e.target.value })} placeholder="••••••" />
          </div>
          <div className="md:col-span-2"><Button onClick={() => save('sandbox')}>Save Sandbox</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LinkIcon className="h-5 w-5"/> Square Production Credentials</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Application ID</Label>
            <Input type="password" value={production.applicationId} onChange={(e) => setProduction({ ...production, applicationId: e.target.value })} placeholder="••••••" />
          </div>
          <div>
            <Label>Access Token</Label>
            <Input type="password" value={production.accessToken} onChange={(e) => setProduction({ ...production, accessToken: e.target.value })} placeholder="••••••" />
          </div>
          <div>
            <Label>Location ID</Label>
            <Input type="password" value={production.locationId} onChange={(e) => setProduction({ ...production, locationId: e.target.value })} placeholder="••••••" />
          </div>
          <div>
            <Label>Webhook Signature Key</Label>
            <Input type="password" value={production.webhookSignatureKey} onChange={(e) => setProduction({ ...production, webhookSignatureKey: e.target.value })} placeholder="••••••" />
          </div>
          <div className="md:col-span-2"><Button onClick={() => save('production')}>Save Production</Button></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5"/> Apple Pay Domain Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Paste the contents of the apple-developer-merchantid-domain-association file here to store for reference. You must also place this file in the repository at public/.well-known/ for domain verification.</p>
          <Textarea rows={6} value={applePayContent} onChange={(e) => setApplePayContent(e.target.value)} placeholder="-----BEGIN FILE-----\n...\n-----END FILE-----" />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => uploadApplePay('sandbox')}>Upload for Staging</Button>
            <Button onClick={() => uploadApplePay('production')}>Upload for Production</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureIntegrations;