import { Navbar } from "@/components/layout/Navbar";
import { useOrders } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Package } from "lucide-react";
import { format } from "date-fns";

export default function Orders() {
  const { data: orders, isLoading } = useOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-500 hover:bg-green-600";
      case "shipped": return "bg-blue-500 hover:bg-blue-600";
      case "delivered": return "bg-primary hover:bg-primary/90";
      case "cancelled": return "bg-red-500 hover:bg-red-600";
      default: return "bg-yellow-500 hover:bg-yellow-600";
    }
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(Number(price));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container-custom py-12">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        
        {isLoading ? (
           <div className="space-y-4">
             {[1,2,3].map(i => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}
           </div>
        ) : orders?.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-xl">
             <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
             <h3 className="text-xl font-bold">No orders yet</h3>
             <p className="text-muted-foreground">Your order history will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders?.map((order: any) => (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30 flex flex-row items-center justify-between py-4">
                  <div className="flex gap-4 items-center">
                    <CardTitle className="text-base">Order #{order.id}</CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" />
                      {format(new Date(order.createdAt), "PPP")}
                    </div>
                  </div>
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded bg-muted overflow-hidden">
                             {/* Simple thumbnail logic */}
                             <div className="w-full h-full bg-slate-200" />
                          </div>
                          <div>
                            <p className="font-medium">{item.car.title}</p>
                            <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-medium">{formatPrice(item.priceSnapshot)}</p>
                      </div>
                    ))}
                    <div className="border-t pt-4 flex justify-between font-bold">
                       <span>Total</span>
                       <span>{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
