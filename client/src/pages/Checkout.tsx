import { Navbar } from "@/components/layout/Navbar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrderSchema } from "@shared/schema";
import { useCreateOrder } from "@/hooks/use-orders";
import { useCart } from "@/hooks/use-cart";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { z } from "zod";

const checkoutSchema = insertOrderSchema.pick({
  address: true,
  phone: true,
  notes: true,
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { data: cart } = useCart();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const [, setLocation] = useLocation();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      address: "",
      phone: "",
      notes: "",
    },
  });

  const onSubmit = (data: CheckoutFormValues) => {
    createOrder(data, {
      onSuccess: () => setLocation("/orders"),
    });
  };

  const items = cart?.items || [];
  const total = items.reduce((acc: number, item: any) => acc + (Number(item.car.price) * item.quantity), 0);
  
  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  if (!cart || items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container-custom py-20 text-center">
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Shipping Details</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Address</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="123 Main St, City, State, ZIP" 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Delivery Notes (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Gate code, special instructions..." 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full btn-primary h-12 text-lg" disabled={isPending}>
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                      </>
                    ) : (
                      `Place Order - ${formatPrice(total)}`
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>

          <div>
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Order Summary</h3>
              <div className="space-y-4 divide-y">
                {items.map((item: any) => (
                  <div key={item.id} className="pt-4 flex justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">{item.quantity}x {item.car.title}</p>
                      <p className="text-xs text-muted-foreground">{item.car.brand.name}</p>
                    </div>
                    <p className="text-sm font-medium">{formatPrice(Number(item.car.price) * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
