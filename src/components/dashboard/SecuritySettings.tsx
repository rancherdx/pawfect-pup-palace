import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Shield, 
  Key, 
  Clock, 
  Smartphone, 
  Monitor, 
  MapPin, 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  Copy
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import UAParser from "ua-parser-js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface LoginAttempt {
  id: string;
  success: boolean;
  attempted_at: string;
  ip_address: string;
  browser: string;
  os: string;
  location: any;
}

interface Session {
  id: string;
  browser: string;
  os: string;
  device: string;
  ip_address: string;
  last_activity: string;
}

export default function SecuritySettings() {
  const { user } = useAuth();
  const [loginHistory, setLoginHistory] = useState<LoginAttempt[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [totpToken, setTotpToken] = useState("");
  const [showSecureDialog, setShowSecureDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadLoginHistory();
      loadSessions();
      check2FAStatus();
    }
  }, [user?.id]);

  const loadLoginHistory = async () => {
    const { data, error } = await supabase
      .from("login_attempts")
      .select("*")
      .eq("user_id", user?.id)
      .order("attempted_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setLoginHistory(data);
    }
  };

  const loadSessions = async () => {
    const { data, error } = await supabase
      .from("user_sessions")
      .select("*")
      .eq("user_id", user?.id)
      .eq("revoked", false)
      .order("last_activity", { ascending: false });

    if (!error && data) {
      setSessions(data);
    }
  };

  const check2FAStatus = async () => {
    const { data, error } = await supabase
      .from("user_2fa")
      .select("enabled")
      .eq("user_id", user?.id)
      .single();

    if (!error && data) {
      setTwoFactorEnabled(data.enabled);
    }
  };

  const setup2FA = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("setup-2fa", {
        body: { user_id: user?.id },
      });

      if (error) throw error;

      setQrCodeUrl(data.qr_code_url);
      setBackupCodes(data.backup_codes);
      setShow2FASetup(true);
      toast.success("Scan the QR code with your authenticator app");
    } catch (error) {
      console.error("2FA setup error:", error);
      toast.error("Failed to setup 2FA");
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-2fa", {
        body: { user_id: user?.id, token: totpToken },
      });

      if (error) throw error;

      if (data.verified) {
        setTwoFactorEnabled(true);
        setShow2FASetup(false);
        toast.success("2FA enabled successfully!");
        check2FAStatus();
      } else {
        toast.error("Invalid code. Please try again.");
      }
    } catch (error) {
      console.error("2FA verification error:", error);
      toast.error("Failed to verify 2FA code");
    } finally {
      setLoading(false);
      setTotpToken("");
    }
  };

  const disable2FA = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("user_2fa")
        .update({ enabled: false })
        .eq("user_id", user?.id);

      if (error) throw error;

      setTwoFactorEnabled(false);
      toast.success("2FA disabled");
    } catch (error) {
      console.error("2FA disable error:", error);
      toast.error("Failed to disable 2FA");
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      const { error } = await supabase.functions.invoke("revoke-session", {
        body: { session_id: sessionId },
      });

      if (error) throw error;

      toast.success("Session revoked successfully");
      loadSessions();
    } catch (error) {
      console.error("Revoke session error:", error);
      toast.error("Failed to revoke session");
    }
  };

  const revokeAllOtherSessions = async () => {
    try {
      const { error } = await supabase.functions.invoke("revoke-session", {
        body: { user_id: user?.id, revoke_all: true },
      });

      if (error) throw error;

      toast.success("All other sessions revoked");
      loadSessions();
    } catch (error) {
      console.error("Revoke all sessions error:", error);
      toast.error("Failed to revoke sessions");
    }
  };

  const secureAccount = async () => {
    setLoading(true);
    try {
      await revokeAllOtherSessions();
      setShowSecureDialog(false);
      toast.success("Account secured. Please change your password.");
    } catch (error) {
      console.error("Secure account error:", error);
      toast.error("Failed to secure account");
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const blob = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gds-puppies-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Password Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password Management
          </CardTitle>
          <CardDescription>Manage your password and account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Password</p>
              <p className="text-sm text-muted-foreground">
                Last changed: <span className="font-medium">Never</span> (N/A - implement tracking)
              </p>
            </div>
            <Button variant="outline">Change Password</Button>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security with TOTP authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">2FA Status</p>
              <p className="text-sm text-muted-foreground">
                {twoFactorEnabled ? (
                  <span className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" /> Enabled
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <XCircle className="h-4 w-4" /> Disabled
                  </span>
                )}
              </p>
            </div>
            {twoFactorEnabled ? (
              <Button variant="outline" onClick={disable2FA} disabled={loading}>
                Disable 2FA
              </Button>
            ) : (
              <Button onClick={setup2FA} disabled={loading}>
                Enable 2FA
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Login Activity
          </CardTitle>
          <CardDescription>Your 5 most recent login attempts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {loginHistory.map((attempt) => (
              <div key={attempt.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">
                      {attempt.browser} on {attempt.os}
                    </span>
                    <Badge variant={attempt.success ? "default" : "destructive"}>
                      {attempt.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {attempt.ip_address} • {attempt.location?.city}, {attempt.location?.country}
                    </span>
                    <span>{formatDistanceToNow(new Date(attempt.attempted_at), { addSuffix: true })}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSecureDialog(true)}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Don't recognize?
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>Devices currently signed into your account</CardDescription>
            </div>
            <Button variant="destructive" onClick={() => setShowRevokeDialog(true)}>
              Revoke All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">
                      {session.browser} on {session.os}
                    </span>
                    <Badge variant="outline">{session.device}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {session.ip_address}
                    </span>
                    <span>Last active: {formatDistanceToNow(new Date(session.last_activity), { addSuffix: true })}</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedSession(session.id);
                    revokeSession(session.id);
                  }}
                >
                  Revoke
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2FA Setup Dialog */}
      <Dialog open={show2FASetup} onOpenChange={setShow2FASetup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app (Apple Passwords, Authy, Google Authenticator, etc.)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {qrCodeUrl && (
              <div className="flex justify-center">
                <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="totp">Enter verification code</Label>
              <Input
                id="totp"
                placeholder="000000"
                value={totpToken}
                onChange={(e) => setTotpToken(e.target.value)}
                maxLength={6}
              />
            </div>
            {backupCodes.length > 0 && (
              <div className="p-4 border rounded-lg space-y-2">
                <p className="text-sm font-medium">Backup Codes</p>
                <p className="text-xs text-muted-foreground">
                  Save these codes in a safe place. You can use them to access your account if you lose your device.
                </p>
                <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                  {backupCodes.map((code, i) => (
                    <div key={i} className="p-2 bg-muted rounded text-center">
                      {code}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={downloadBackupCodes} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(backupCodes.join("\n"));
                      toast.success("Copied to clipboard");
                    }}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={verify2FA} disabled={loading || totpToken.length !== 6}>
              Verify & Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Secure Account Dialog */}
      <AlertDialog open={showSecureDialog} onOpenChange={setShowSecureDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Secure Your Account</AlertDialogTitle>
            <AlertDialogDescription>
              If you don't recognize this login attempt, we recommend securing your account immediately.
              This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Sign you out of all sessions on all devices</li>
                <li>Invalidate all cookies and tokens</li>
                <li>Require you to change your password</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={secureAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Secure Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Revoke All Sessions Dialog */}
      <AlertDialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke All Sessions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign you out of all devices except your current one. You'll need to log in again on those devices.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={revokeAllOtherSessions}>
              Revoke All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
