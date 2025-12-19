import { Car } from "@shared/schema";
import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Fuel, Gauge, Settings2, ShoppingCart } from "lucide-react";
import { useAddToCart } from "@/hooks/use-cart";

interface CarCardProps {
  car: Car & { brand: { name: string }; category: { name: string } };
}

export function CarCard({ car }: CarCardProps) {
  const { mutate: addToCart, isPending } = useAddToCart();
  
  // Parse images if stored as JSON string, or use directly if array
  // Handle both potential backend responses (string from DB vs parsed object)
  const images = typeof car.images === 'string' 
    ? JSON.parse(car.images) 
    : (Array.isArray(car.images) ? car.images : []);
    
  // Unsplash fallback
  const mainImage = images[0] || `https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&auto=format&fit=crop`;

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  return (
    <Card className="group overflow-hidden border-border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/50 flex flex-col h-full">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img 
          src={mainImage} 
          alt={car.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {car.isFeatured && (
          <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground shadow-lg">
            Featured
          </Badge>
        )}
        <Badge variant={car.condition === 'new' ? 'default' : 'secondary'} className="absolute right-3 top-3 shadow-sm">
          {car.condition === 'new' ? 'New Arrival' : 'Pre-Owned'}
        </Badge>
      </div>
      
      <CardHeader className="p-5 pb-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{car.year} • {car.brand.name}</span>
          <span className="text-xl font-bold text-primary">{formatPrice(car.price)}</span>
        </div>
        <Link href={`/cars/${car.id}`} className="hover:text-primary transition-colors">
          <h3 className="font-display text-lg font-bold leading-tight mt-1 line-clamp-1">{car.title}</h3>
        </Link>
      </CardHeader>
      
      <CardContent className="p-5 grid grid-cols-3 gap-2 text-xs text-muted-foreground mt-auto">
        <div className="flex flex-col items-center gap-1 rounded-md bg-secondary/50 p-2">
          <Gauge className="h-4 w-4 text-primary" />
          <span>{car.mileage.toLocaleString()} mi</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-md bg-secondary/50 p-2">
          <Settings2 className="h-4 w-4 text-primary" />
          <span className="capitalize">{car.transmission}</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-md bg-secondary/50 p-2">
          <Fuel className="h-4 w-4 text-primary" />
          <span className="capitalize">{car.fuelType}</span>
        </div>
      </CardContent>
      
      <CardFooter className="p-5 pt-0 gap-2">
        <Link href={`/cars/${car.id}`} className="w-full">
          <Button variant="outline" className="w-full">View Details</Button>
        </Link>
        <Button 
          onClick={() => addToCart({ carId: car.id, quantity: 1 })}
          disabled={isPending}
          size="icon"
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
