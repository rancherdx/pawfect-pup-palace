import { useEffect } from "react";
import { usePWA } from "@/hooks/usePWA";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, Download, Smartphone, Info } from "lucide-react";

export default function Install() {
  const { canInstall, isInstalled, isOnline, promptInstall } = usePWA();

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      console.log("PWA installation accepted");
    }
  };

  useEffect(() => {
    document.title = "Install GDS Puppies App";
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Install GDS Puppies</h1>
          <p className="text-lg text-muted-foreground">
            Get quick access to our puppies right from your home screen
          </p>
        </div>

        {isInstalled ? (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">App Already Installed</AlertTitle>
            <AlertDescription className="text-green-700">
              The GDS Puppies app is already installed on your device. You can access it from your home screen.
            </AlertDescription>
          </Alert>
        ) : canInstall ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Ready to Install
              </CardTitle>
              <CardDescription>
                Click the button below to install GDS Puppies as an app on your device
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleInstall} 
                size="lg" 
                className="w-full min-h-12 text-lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Install App
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Installation Not Available</AlertTitle>
            <AlertDescription>
              The app is either already installed or your browser doesn't support installation.
            </AlertDescription>
          </Alert>
        )}

        {/* Benefits Card */}
        <Card>
          <CardHeader>
            <CardTitle>Why Install Our App?</CardTitle>
            <CardDescription>Get the best experience with these features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Quick Access</p>
                <p className="text-sm text-muted-foreground">Launch directly from your home screen</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Offline Support</p>
                <p className="text-sm text-muted-foreground">Browse puppies even without internet</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Fast & Smooth</p>
                <p className="text-sm text-muted-foreground">Optimized performance for mobile devices</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">Get notified about new puppies (coming soon)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual Installation Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Manual Installation
            </CardTitle>
            <CardDescription>
              If the install button doesn't work, follow these steps
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">iOS (iPhone/iPad) - Safari</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Tap the Share button (square with arrow pointing up)</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" in the top right corner</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Android - Chrome</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Tap the menu button (three dots in the top right)</li>
                <li>Tap "Add to Home screen" or "Install app"</li>
                <li>Confirm by tapping "Add" or "Install"</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Desktop - Chrome/Edge</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Click the install icon in the address bar</li>
                <li>Or use the menu {">"} "Install GDS Puppies"</li>
                <li>Click "Install" in the popup</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {!isOnline && (
          <Alert variant="destructive">
            <Info className="h-4 w-4" />
            <AlertTitle>No Internet Connection</AlertTitle>
            <AlertDescription>
              You're currently offline. Some features may not be available until you reconnect.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
