
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Copy, Link, FileText } from "lucide-react";

/**
 * @component AffiliateManager
 * @description A component for managing marketing efforts, including affiliate partners and promotional codes.
 * It features a tabbed interface to switch between managing affiliates and promo codes.
 * Note: This component currently uses mock data and local state. Backend integration is required for full functionality.
 * @returns {React.ReactElement} The rendered marketing and affiliates management dashboard.
 */
const AffiliateManager = () => {
  const [activeTab, setActiveTab] = useState("affiliates");
  
  const [affiliates] = useState([
    { id: "aff-001", name: "Sarah Johnson", email: "sarah@example.com", code: "SARAH20", commission: "10%", visits: 152, conversions: 8, totalSales: "$4,232", active: true, dateCreated: "2025-01-15" },
    { id: "aff-002", name: "Dog Lovers Blog", email: "contact@doglovers.com", code: "DOGBLOG", commission: "15%", visits: 376, conversions: 14, totalSales: "$9,876", active: true, dateCreated: "2025-02-03" },
    { id: "aff-003", name: "Michael Peterson", email: "mike@example.com", code: "MIKE15", commission: "10%", visits: 89, conversions: 3, totalSales: "$1,650", active: false, dateCreated: "2025-02-20" },
  ]);
  
  const [promoCodes] = useState([
    { id: "promo-001", code: "SPRING2025", discount: "10%", uses: 24, maxUses: 100, startDate: "2025-03-01", endDate: "2025-05-31", active: true },
    { id: "promo-002", code: "SUMMER5", discount: "$50 off", uses: 12, maxUses: 50, startDate: "2025-06-01", endDate: "2025-08-31", active: true },
    { id: "promo-003", code: "WELCOME", discount: "5%", uses: 56, maxUses: null, startDate: "2025-01-01", endDate: null, active: true },
  ]);
  const [newAffiliate, setNewAffiliate] = useState({
    name: "",
    email: "",
    code: "",
    commission: "10%"
  });
  const [newPromo, setNewPromo] = useState({
    code: "",
    discount: "",
    maxUses: "",
    startDate: "",
    endDate: ""
  });
  const { toast: uiToast } = useToast();

  /**
   * Copies an affiliate's referral link to the clipboard.
   * @param {string} code - The affiliate's unique referral code.
   */
  const handleCopyLink = (code: string) => {
    const baseUrl = window.location.origin;
    const affiliateLink = `${baseUrl}/?ref=${code}`;
    navigator.clipboard.writeText(affiliateLink);
    
    toast.success("Affiliate link copied to clipboard", {
      description: "You can now share this link with your affiliate"
    });
  };

  /**
   * Toggles the active status of an affiliate or promo code.
   * @param {string} id - The ID of the item to toggle.
   * @param {"affiliate" | "promo"} type - The type of item being toggled.
   */
  const handleToggleStatus = (id: string, type: "affiliate" | "promo") => {
    // Toggle functionality - would integrate with Supabase for production
    toast.success(`${type === "affiliate" ? "Affiliate" : "Promo code"} status updated`);
  };

  /**
   * Handles the creation of a new affiliate partner.
   * Validates input and provides feedback.
   */
  const handleCreateAffiliate = () => {
    if (!newAffiliate.name || !newAffiliate.email || !newAffiliate.code) {
      uiToast({
        title: "Missing information",
        description: "Please fill out all required fields",
        variant: "destructive"
      });
      return;
    }

    // Creation functionality - would save to Supabase for production
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV] Creating affiliate:', newAffiliate);
    }
    setNewAffiliate({
      name: "",
      email: "",
      code: "",
      commission: "10%"
    });
    
    toast.success("New affiliate created", {
      description: `${newAffiliate.name} has been added as an affiliate`
    });
  };

  /**
   * Handles the creation of a new promotional code.
   * Validates input and provides feedback.
   */
  const handleCreatePromo = () => {
    if (!newPromo.code || !newPromo.discount) {
      uiToast({
        title: "Missing information",
        description: "Code and discount are required",
        variant: "destructive"
      });
      return;
    }

    // Creation functionality - would save to Supabase for production
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEV] Creating promo code:', newPromo);
    }
    setNewPromo({
      code: "",
      discount: "",
      maxUses: "",
      startDate: "",
      endDate: ""
    });
    
    toast.success("New promo code created", {
      description: `${newPromo.code.toUpperCase()} is now active`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Marketing & Affiliates</h1>
          <p className="text-muted-foreground">Manage affiliate partners and promotion codes</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === "affiliates" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("affiliates")}
          >
            <Users className="h-4 w-4 mr-2" />
            Affiliates
          </Button>
          <Button
            variant={activeTab === "promo-codes" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("promo-codes")}
          >
            <FileText className="h-4 w-4 mr-2" />
            Promo Codes
          </Button>
        </div>
      </div>

      {activeTab === "affiliates" && (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Affiliate Partners</CardTitle>
                <CardDescription>
                  Track your affiliate partners and their performance
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Affiliate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Affiliate</DialogTitle>
                    <DialogDescription>
                      Create a new affiliate partner to track their referrals
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Affiliate name"
                        value={newAffiliate.name}
                        onChange={(e) => setNewAffiliate({...newAffiliate, name: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="contact@example.com"
                        value={newAffiliate.email}
                        onChange={(e) => setNewAffiliate({...newAffiliate, email: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="code">Affiliate Code</Label>
                      <Input
                        id="code"
                        placeholder="PARTNER25"
                        value={newAffiliate.code}
                        onChange={(e) => setNewAffiliate({...newAffiliate, code: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="commission">Commission Rate</Label>
                      <Input
                        id="commission"
                        placeholder="10%"
                        value={newAffiliate.commission}
                        onChange={(e) => setNewAffiliate({...newAffiliate, commission: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleCreateAffiliate}>Create Affiliate</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Affiliate</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead className="text-center">Visits</TableHead>
                      <TableHead className="text-center">Conversions</TableHead>
                      <TableHead>Total Sales</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {affiliates.map((affiliate) => (
                      <TableRow key={affiliate.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{affiliate.name}</p>
                            <p className="text-sm text-muted-foreground">{affiliate.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                            {affiliate.code}
                          </code>
                        </TableCell>
                        <TableCell>{affiliate.commission}</TableCell>
                        <TableCell className="text-center">{affiliate.visits}</TableCell>
                        <TableCell className="text-center">
                          {affiliate.conversions}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({Math.round((affiliate.conversions / affiliate.visits) * 100) || 0}%)
                          </span>
                        </TableCell>
                        <TableCell>{affiliate.totalSales}</TableCell>
                        <TableCell>
                          <Badge variant={affiliate.active ? "default" : "secondary"}>
                            {affiliate.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyLink(affiliate.code)}
                              title="Copy affiliate link"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Switch
                              checked={affiliate.active}
                              onCheckedChange={() => handleToggleStatus(affiliate.id, "affiliate")}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 p-4">
              <div className="text-sm text-muted-foreground">
                Showing {affiliates.length} affiliates. Total conversions: {affiliates.reduce((sum, aff) => sum + aff.conversions, 0)}
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Affiliate Tracking</CardTitle>
              <CardDescription>How the affiliate tracking system works</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>The affiliate system works by adding UTM parameters to URLs that affiliates share:</p>
              
              <div className="bg-muted p-4 rounded-md font-mono text-sm overflow-x-auto">
                https://gdspuppies.com/?ref=AFFILIATE_CODE
              </div>
              
              <p className="text-sm text-muted-foreground">
                When a visitor arrives via an affiliate link, we store the affiliate code in their browser.
                If they complete a purchase within 30 days, the affiliate gets credit for the referral.
              </p>
              
              <div className="bg-muted p-4 rounded-md">
                <h4 className="font-medium mb-2">Tips for Affiliates:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Share links on social media and in relevant content</li>
                  <li>Provide authentic reviews and recommendations</li>
                  <li>Create content featuring our puppies and services</li>
                  <li>Earnings are calculated based on completed sales</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === "promo-codes" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Promotion Codes</CardTitle>
              <CardDescription>
                Create and manage special discounts and promotions
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Promo Code
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Promotion Code</DialogTitle>
                  <DialogDescription>
                    Add a new promotion code for customers to use
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      placeholder="SUMMER2025"
                      value={newPromo.code}
                      onChange={(e) => setNewPromo({...newPromo, code: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="discount">Discount</Label>
                    <Input
                      id="discount"
                      placeholder="10% or $50 off"
                      value={newPromo.discount}
                      onChange={(e) => setNewPromo({...newPromo, discount: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="maxUses">Maximum Uses (optional)</Label>
                    <Input
                      id="maxUses"
                      type="number"
                      placeholder="100"
                      value={newPromo.maxUses}
                      onChange={(e) => setNewPromo({...newPromo, maxUses: e.target.value})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newPromo.startDate}
                        onChange={(e) => setNewPromo({...newPromo, startDate: e.target.value})}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="endDate">End Date (optional)</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newPromo.endDate}
                        onChange={(e) => setNewPromo({...newPromo, endDate: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreatePromo}>Create Promotion</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead className="text-center">Uses</TableHead>
                    <TableHead>Validity Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes.map((promo) => (
                    <TableRow key={promo.id}>
                      <TableCell>
                        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                          {promo.code}
                        </code>
                      </TableCell>
                      <TableCell>{promo.discount}</TableCell>
                      <TableCell className="text-center">
                        {promo.uses}
                        {promo.maxUses && (
                          <span className="text-xs text-muted-foreground ml-1">
                            / {promo.maxUses}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span>From: {promo.startDate}</span>
                          <br />
                          <span>
                            To: {promo.endDate || "No expiration"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={promo.active ? "default" : "secondary"}>
                          {promo.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopyLink(promo.code)}
                            title="Copy promo link"
                          >
                            <Link className="h-4 w-4" />
                          </Button>
                          <Switch
                            checked={promo.active}
                            onCheckedChange={() => handleToggleStatus(promo.id, "promo")}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AffiliateManager;
