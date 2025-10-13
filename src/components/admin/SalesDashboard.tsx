import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Clock } from "lucide-react";

const SalesDashboard = () => {
  const { data: purchases } = useQuery({
    queryKey: ['sales-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('puppy_purchases')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: payments } = useQuery({
    queryKey: ['payment-analytics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  const totalRevenue = payments?.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0;
  const pendingPayments = purchases?.filter(p => p.status !== 'fully_paid' && p.status !== 'cancelled').length || 0;
  const totalPurchases = purchases?.length || 0;
  const averageSalePrice = purchases && purchases.length > 0 
    ? purchases.reduce((sum, p) => sum + parseFloat(p.total_price.toString()), 0) / purchases.length 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From {payments?.length || 0} payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPurchases}</div>
            <p className="text-xs text-muted-foreground">
              Puppy purchases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayments}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Sale</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageSalePrice.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Per puppy
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Purchases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {purchases?.slice(0, 5).map((purchase) => (
              <div key={purchase.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-semibold">{purchase.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{purchase.customer_email}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${purchase.total_price}</p>
                  <p className="text-xs text-muted-foreground capitalize">{purchase.status.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesDashboard;
