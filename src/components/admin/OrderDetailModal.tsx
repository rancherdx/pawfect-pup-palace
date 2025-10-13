import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

interface OrderDetailModalProps {
  orderId: string;
  open: boolean;
  onClose: () => void;
}

export default function OrderDetailModal({ orderId, open, onClose }: OrderDetailModalProps) {
  const { data: purchase, isLoading } = useQuery({
    queryKey: ["purchase-detail", orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("puppy_purchases")
        .select(`
          *,
          puppies(id, name, photo_url, breed, price),
          payments(*)
        `)
        .eq("id", orderId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : purchase ? (
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              {purchase.puppies?.photo_url && (
                <img
                  src={purchase.puppies.photo_url}
                  alt={purchase.puppies.name}
                  className="w-32 h-32 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold">{purchase.puppies?.name}</h3>
                <p className="text-muted-foreground">{purchase.puppies?.breed}</p>
                <Badge className="mt-2">{purchase.status.replace("_", " ")}</Badge>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Customer Information</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Name:</span> {purchase.customer_name}</p>
                <p><span className="font-medium">Email:</span> {purchase.customer_email}</p>
                {purchase.customer_phone && (
                  <p><span className="font-medium">Phone:</span> {purchase.customer_phone}</p>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Payment Information</h4>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Total Price:</span> ${purchase.total_price}</p>
                <p><span className="font-medium">Deposit:</span> ${purchase.deposit_amount}</p>
                <p><span className="font-medium">Remaining:</span> ${purchase.remaining_amount}</p>
                <p><span className="font-medium">Due Date:</span> {new Date(purchase.due_date).toLocaleDateString()}</p>
              </div>
            </div>

            {purchase.payments && purchase.payments.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Payment History</h4>
                  <div className="space-y-2">
                    {purchase.payments.map((payment: any) => (
                      <div key={payment.id} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                        <div>
                          <p className="font-medium">${payment.amount}</p>
                          <p className="text-xs text-muted-foreground">{payment.payment_method}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {purchase.admin_notes && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Admin Notes</h4>
                  <p className="text-sm text-muted-foreground">{purchase.admin_notes}</p>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-center py-12 text-muted-foreground">Order not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
