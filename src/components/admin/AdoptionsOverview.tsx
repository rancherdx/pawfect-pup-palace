import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search, Eye, Edit, DollarSign, RefreshCw } from "lucide-react";
import OrderDetailModal from "./OrderDetailModal";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "deposit_pending", label: "Pending" },
  { value: "balance_pending", label: "Deposit Paid" },
  { value: "fully_paid", label: "Fully Paid" },
  { value: "completed", label: "Completed" },
  { value: "refunded", label: "Refunded" },
];

export default function AdoptionsOverview() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const { data: purchases = [] } = useQuery({
    queryKey: ["puppy-purchases", activeTab, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("puppy_purchases")
        .select(`
          *,
          puppies(id, name, photo_url, breed)
        `)
        .order("created_at", { ascending: false });

      if (activeTab !== "all") {
        query = query.eq("status", activeTab);
      }

      if (searchQuery) {
        query = query.or(
          `customer_name.ilike.%${searchQuery}%,customer_email.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      deposit_pending: "bg-yellow-100 text-yellow-800",
      balance_pending: "bg-blue-100 text-blue-800",
      fully_paid: "bg-green-100 text-green-800",
      completed: "bg-purple-100 text-purple-800",
      refunded: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Adoptions & Orders</h2>
        <p className="text-muted-foreground">Manage puppy adoptions and track payments</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {purchases.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No orders found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {purchases.map((purchase: any) => (
                <Card key={purchase.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        {purchase.puppies?.photo_url && (
                          <img
                            src={purchase.puppies.photo_url}
                            alt={purchase.puppies.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <CardTitle className="text-lg">{purchase.customer_name}</CardTitle>
                          <CardDescription className="space-y-1">
                            <p>{purchase.customer_email}</p>
                            <p className="font-medium">Puppy: {purchase.puppies?.name}</p>
                          </CardDescription>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded ${getStatusColor(purchase.status)}`}>
                        {purchase.status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Total: <span className="font-bold text-foreground">${purchase.total_price}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Remaining: <span className="font-bold text-foreground">${purchase.remaining_amount}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(purchase.due_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedOrder(purchase.id)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Payment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedOrder && (
        <OrderDetailModal
          orderId={selectedOrder}
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
