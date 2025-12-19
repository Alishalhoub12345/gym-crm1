import { useRoute } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { useCar } from "@/hooks/use-cars";
import { useAddToCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Check, 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings2,
  Share2
} from "lucide-react";
import { useState } from "react";

export default function CarDetail() {
  const [match, params] = useRoute("/cars/:id");
  const { data: car, isLoading, error } = useCar(Number(params?.id));
  const { mutate: addToCart, isPending } = useAddToCart();
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  if (error || !car) return <div className="min-h-screen bg-background flex items-center justify-center">Car not found</div>;

  const images = typeof car.images === 'string' 
    ? JSON.parse(car.images) 
    : (Array.isArray(car.images) ? car.images : []);
    
  // Fallback if no images
  if (images.length === 0) images.push("https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1200&auto=format&fit=crop");

  const specs = [
    { label: "Year", value: car.year, icon: Calendar },
    { label: "Mileage", value: `${car.mileage.toLocaleString()} mi`, icon: Gauge },
    { label: "Fuel Type", value: car.fuelType, icon: Fuel },
    { label: "Transmission", value: car.transmission, icon: Settings2 },
    { label: "Condition", value: car.condition, icon: Check },
    { label: "Stock", value: `${car.stock} available`, icon: Check },
  ];

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-muted border border-border">
              <img 
                src={images[activeImage]} 
                alt={car.title} 
                className="h-full w-full object-cover transition-all duration-300"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`aspect-[16/10] overflow-hidden rounded-lg border-2 transition-all ${
                      idx === activeImage ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="text-primary border-primary/20">{car.brand.name}</Badge>
                <Badge variant="secondary">{car.category.name}</Badge>
                {car.isFeatured && <Badge className="bg-primary">Featured</Badge>}
              </div>
              <h1 className="text-4xl font-display font-bold tracking-tight text-foreground">{car.title}</h1>
              <div className="mt-4 flex items-end gap-4">
                <span className="text-4xl font-bold text-primary">{formatPrice(car.price)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {specs.map((spec, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
                  <spec.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{spec.label}</p>
                    <p className="text-sm font-medium capitalize">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{car.description}</p>
              </div>

              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  className="flex-1 text-lg h-14 btn-primary"
                  onClick={() => addToCart({ carId: car.id, quantity: 1 })}
                  disabled={isPending}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {isPending ? "Adding..." : "Add to Cart"}
                </Button>
                <Button size="lg" variant="outline" className="aspect-square h-14 p-0">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
