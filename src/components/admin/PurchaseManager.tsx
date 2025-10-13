import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DollarSign, Eye, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

const PurchaseManager = () => {
  const [isAddingPurchase, setIsAddingPurchase] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: purchases, isLoading } = useQuery({
    queryKey: ['puppy-purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('puppy_purchases')
        .select(`
          *,
          puppies (name, breed, photo_url),
          payments (id, amount, payment_method, payment_date)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const { data: availablePuppies } = useQuery({
    queryKey: ['available-puppies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('puppies')
        .select('id, name, breed, price, status')
        .eq('status', 'Available');
      
      if (error) throw error;
      return data;
    }
  });

  const createPurchase = useMutation({
    mutationFn: async (purchase: any) => {
      const { data, error } = await supabase
        .from('puppy_purchases')
        .insert([purchase])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['puppy-purchases'] });
      toast.success('Purchase created successfully');
      setIsAddingPurchase(false);
    },
    onError: (error: any) => {
      toast.error('Failed to create purchase: ' + error.message);
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'deposit_pending': 'destructive',
      'deposit_paid': 'secondary',
      'balance_pending': 'outline',
      'fully_paid': 'default',
      'cancelled': 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status.replace('_', ' ')}</Badge>;
  };

  if (isLoading) {
    return <div>Loading purchases...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Purchase Management</h2>
        <Dialog open={isAddingPurchase} onOpenChange={setIsAddingPurchase}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Purchase
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Purchase</DialogTitle>
            </DialogHeader>
            <PurchaseForm
              puppies={availablePuppies || []}
              onSubmit={(data) => createPurchase.mutate(data)}
              onCancel={() => setIsAddingPurchase(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {purchases?.map((purchase) => (
          <Card key={purchase.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {purchase.puppies?.name || 'Unknown Puppy'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {purchase.customer_name} • {purchase.customer_email}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  {getStatusBadge(purchase.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Total Price</p>
                  <p className="font-semibold">${purchase.total_price}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Deposit</p>
                  <p className="font-semibold">${purchase.deposit_amount || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Remaining</p>
                  <p className="font-semibold text-orange-600">${purchase.remaining_amount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-semibold">{new Date(purchase.due_date).toLocaleDateString()}</p>
                </div>
              </div>
              
              {purchase.payments && purchase.payments.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-semibold mb-2">Payment History</p>
                  <div className="space-y-1 text-sm">
                    {purchase.payments.map((payment: any) => (
                      <div key={payment.id} className="flex justify-between">
                        <span>{payment.payment_method} • {new Date(payment.payment_date).toLocaleDateString()}</span>
                        <span className="font-semibold">${payment.amount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPurchase(purchase)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Add payment logic here
                    toast.info('Payment dialog coming soon');
                  }}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

interface PurchaseFormProps {
  puppies: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const PurchaseForm = ({ puppies, onSubmit, onCancel }: PurchaseFormProps) => {
  const [formData, setFormData] = useState({
    puppy_id: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    total_price: '',
    deposit_amount: '',
    due_date: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedPuppy = puppies.find(p => p.id === formData.puppy_id);
    const totalPrice = parseFloat(formData.total_price || selectedPuppy?.price || '0');
    const depositAmount = parseFloat(formData.deposit_amount || '0');
    
    onSubmit({
      ...formData,
      total_price: totalPrice,
      deposit_amount: depositAmount,
      remaining_amount: totalPrice - depositAmount,
      status: depositAmount > 0 ? 'deposit_paid' : 'deposit_pending'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="puppy_id">Select Puppy</Label>
        <Select
          value={formData.puppy_id}
          onValueChange={(value) => {
            const puppy = puppies.find(p => p.id === value);
            setFormData({
              ...formData,
              puppy_id: value,
              total_price: puppy?.price?.toString() || ''
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a puppy" />
          </SelectTrigger>
          <SelectContent>
            {puppies.map((puppy) => (
              <SelectItem key={puppy.id} value={puppy.id}>
                {puppy.name} - {puppy.breed} (${puppy.price})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer_name">Customer Name</Label>
          <Input
            id="customer_name"
            value={formData.customer_name}
            onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="customer_email">Customer Email</Label>
          <Input
            id="customer_email"
            type="email"
            value={formData.customer_email}
            onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="customer_phone">Phone (Optional)</Label>
        <Input
          id="customer_phone"
          value={formData.customer_phone}
          onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="total_price">Total Price</Label>
          <Input
            id="total_price"
            type="number"
            step="0.01"
            value={formData.total_price}
            onChange={(e) => setFormData({ ...formData, total_price: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="deposit_amount">Deposit Amount</Label>
          <Input
            id="deposit_amount"
            type="number"
            step="0.01"
            value={formData.deposit_amount}
            onChange={(e) => setFormData({ ...formData, deposit_amount: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="due_date">Balance Due Date</Label>
        <Input
          id="due_date"
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Purchase</Button>
      </div>
    </form>
  );
};

export default PurchaseManager;
