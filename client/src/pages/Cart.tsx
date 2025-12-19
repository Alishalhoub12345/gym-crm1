import { Navbar } from "@/components/layout/Navbar";
import { useCart, useRemoveCartItem, useUpdateCartItem } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { Link } from "wouter";

export default function Cart() {
  const { data: cart, isLoading } = useCart();
  const { mutate: removeItem } = useRemoveCartItem();
  const { mutate: updateItem } = useUpdateCartItem();

  const items = cart?.items || [];
  const total = items.reduce((acc: number, item: any) => acc + (Number(item.car.price) * item.quantity), 0);

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  if (isLoading) return <div className="min-h-screen bg-background" />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-dashed border-border">
            <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold">Your cart is empty</h2>
            <p className="text-muted-foreground mt-2 mb-8">Looks like you haven't found your dream car yet.</p>
            <Link href="/cars">
              <Button size="lg">Browse Inventory</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-6">
              {items.map((item: any) => {
                const images = typeof item.car.images === 'string' ? JSON.parse(item.car.images) : item.car.images;
                const img = images[0] || "";
                
                return (
                  <div key={item.id} className="flex gap-6 p-4 rounded-xl border border-border bg-card">
                    <div className="h-24 w-36 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                      <img src={img} alt={item.car.title} className="h-full w-full object-cover" />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{item.car.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.car.brand.name} • {item.car.year}</p>
                        </div>
                        <p className="font-bold text-lg text-primary">{formatPrice(item.car.price)}</p>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-3">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => updateItem({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-medium w-4 text-center">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => updateItem({ id: item.id, quantity: item.quantity + 1 })}
                            disabled={item.quantity >= item.car.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm sticky top-24">
                <h3 className="text-xl font-bold mb-6">Order Summary</h3>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxes</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>
                <Link href="/checkout">
                  <Button className="w-full h-12 text-base btn-primary">
                    Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
