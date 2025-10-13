import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ShoppingCart, Trash2, Plus, Minus, Receipt, Mail, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CartItem {
  type: "puppy" | "product" | "service" | "custom";
  id?: string;
  name: string;
  price: number;
  quantity: number;
  description?: string;
}

export default function POS() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    noCustomerInfo: false,
  });
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [customItem, setCustomItem] = useState({ title: "", description: "", amount: 0 });

  const { data: puppies = [] } = useQuery({
    queryKey: ["available-puppies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("puppies")
        .select("*")
        .eq("status", "Available");
      if (error) throw error;
      return data;
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["addon-items"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addon_items")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  const { data: transactionSettings } = useQuery({
    queryKey: ["transaction-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "transaction_settings")
        .single();
      if (error) throw error;
      return data?.value as any;
    },
  });

  const addToCart = (item: CartItem) => {
    const existingIndex = cart.findIndex((i) => i.id === item.id && i.type === item.type);
    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    toast({ title: `${item.name} added to cart` });
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    newCart[index].quantity = Math.max(1, newCart[index].quantity + delta);
    setCart(newCart);
  };

  const addCustomItem = () => {
    if (!customItem.title || customItem.amount <= 0) {
      toast({ title: "Please fill in title and amount", variant: "destructive" });
      return;
    }
    addToCart({
      type: "custom",
      name: customItem.title,
      description: customItem.description,
      price: customItem.amount,
      quantity: 1,
    });
    setCustomItem({ title: "", description: "", amount: 0 });
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = transactionSettings?.default_tax_rate || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const processPaymentMutation = useMutation({
    mutationFn: async () => {
      const transactionNumber = `POS-${Date.now()}`;
      const { data, error } = await supabase.from("pos_transactions").insert([
        {
          transaction_number: transactionNumber,
          customer_name: customerInfo.noCustomerInfo
            ? null
            : `${customerInfo.firstName} ${customerInfo.lastName}`,
          customer_email: customerInfo.noCustomerInfo ? null : customerInfo.email,
          customer_phone: customerInfo.noCustomerInfo ? null : customerInfo.phone,
          items: cart as any,
          subtotal,
          tax_amount: taxAmount,
          total_amount: total,
          payment_method: paymentMethod,
          payment_status: "paid",
        },
      ]);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Payment processed successfully!" });
      setCart([]);
      setCustomerInfo({ firstName: "", lastName: "", email: "", phone: "", noCustomerInfo: false });
    },
    onError: (error: Error) => {
      toast({ title: "Payment failed", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Point of Sale</h1>
          <Button variant="outline" onClick={() => navigate("/admin")}>
            Close POS
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Selection */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Products & Services</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="puppies">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="puppies">Puppies</TabsTrigger>
                    <TabsTrigger value="products">Products</TabsTrigger>
                    <TabsTrigger value="services">Services</TabsTrigger>
                    <TabsTrigger value="custom">Custom</TabsTrigger>
                  </TabsList>

                  <TabsContent value="puppies" className="mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {puppies.map((puppy: any) => (
                        <Card
                          key={puppy.id}
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() =>
                            addToCart({
                              type: "puppy",
                              id: puppy.id,
                              name: puppy.name,
                              price: puppy.price,
                              quantity: 1,
                            })
                          }
                        >
                          {puppy.photo_url && (
                            <img src={puppy.photo_url} alt={puppy.name} className="w-full h-32 object-cover rounded-t" />
                          )}
                          <CardContent className="p-3">
                            <p className="font-medium">{puppy.name}</p>
                            <p className="text-sm text-muted-foreground">{puppy.breed}</p>
                            <p className="font-bold mt-1">${puppy.price}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="products" className="mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {products.map((product: any) => (
                        <Card
                          key={product.id}
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() =>
                            addToCart({
                              type: "product",
                              id: product.id,
                              name: product.name,
                              price: product.price,
                              quantity: 1,
                            })
                          }
                        >
                          <CardContent className="p-4">
                            <p className="font-medium">{product.name}</p>
                            <p className="font-bold mt-1">${product.price}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="services" className="mt-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {services.map((service: any) => (
                        <Card
                          key={service.id}
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() =>
                            addToCart({
                              type: "service",
                              id: service.id,
                              name: service.name,
                              price: service.price,
                              quantity: 1,
                            })
                          }
                        >
                          <CardContent className="p-4">
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-muted-foreground">{service.category}</p>
                            <p className="font-bold mt-1">${service.price}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="custom" className="mt-4 space-y-4">
                    <div>
                      <Label>Title *</Label>
                      <Input
                        value={customItem.title}
                        onChange={(e) => setCustomItem({ ...customItem, title: e.target.value })}
                        placeholder="Item name"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={customItem.description}
                        onChange={(e) => setCustomItem({ ...customItem, description: e.target.value })}
                        placeholder="Optional description"
                      />
                    </div>
                    <div>
                      <Label>Amount *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={customItem.amount}
                        onChange={(e) => setCustomItem({ ...customItem, amount: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                      />
                    </div>
                    <Button onClick={addCustomItem}>Add to Cart</Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Cart & Checkout */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {cart.map((item, index) => (
                        <div key={index} className="flex items-center justify-between border-b pb-2">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">${item.price}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(index, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(index, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-1 pt-4 border-t">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Tax ({taxRate}%):</span>
                        <span>${taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setCart([])}
                    >
                      Clear Cart
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {cart.length > 0 && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="no-customer"
                        checked={customerInfo.noCustomerInfo}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, noCustomerInfo: e.target.checked })
                        }
                      />
                      <Label htmlFor="no-customer">No Customer Info</Label>
                    </div>
                    {!customerInfo.noCustomerInfo && (
                      <>
                        <div>
                          <Label>First Name *</Label>
                          <Input
                            value={customerInfo.firstName}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, firstName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Last Name *</Label>
                          <Input
                            value={customerInfo.lastName}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, lastName: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            value={customerInfo.email}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Phone *</Label>
                          <Input
                            type="tel"
                            value={customerInfo.phone}
                            onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                          />
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Payment Method</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="square">Square</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => processPaymentMutation.mutate()}
                      disabled={processPaymentMutation.isPending}
                    >
                      <DollarSign className="h-5 w-5 mr-2" />
                      Process Payment (${total.toFixed(2)})
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
