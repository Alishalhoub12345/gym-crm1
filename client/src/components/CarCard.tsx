import { Link } from "wouter";
import { type Car, type Brand, type Category } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Fuel, Gauge, Settings2, ArrowRight } from "lucide-react";

interface CarWithRelations extends Car {
  brand: Brand;
  category: Category;
}

interface CarCardProps {
  car: CarWithRelations;
}

export function CarCard({ car }: CarCardProps) {
  // Use first image or fallback
  const displayImage = car.images?.[0] || `https://source.unsplash.com/random/800x600/?car,${car.brand.name}`;

  return (
    <Card className="group overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img 
          src={displayImage} 
          alt={car.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {car.condition === 'new' && (
            <Badge className="bg-primary hover:bg-primary/90">New Arrival</Badge>
          )}
          {car.isFeatured && (
            <Badge variant="secondary" className="bg-white/90 text-black backdrop-blur">Featured</Badge>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-white text-sm font-medium line-clamp-2">{car.description}</p>
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{car.brand.name}</p>
            <CardTitle className="text-xl font-display mt-1 group-hover:text-primary transition-colors">{car.title}</CardTitle>
          </div>
          <p className="text-lg font-bold text-primary">${Number(car.price).toLocaleString()}</p>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4 flex-grow">
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-border/50">
          <div className="flex flex-col items-center text-center gap-1">
            <Gauge className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium">{car.mileage.toLocaleString()} km</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1 border-x border-border/50">
            <Settings2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium capitalize">{car.transmission}</span>
          </div>
          <div className="flex flex-col items-center text-center gap-1">
            <Fuel className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium capitalize">{car.fuelType}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Link href={`/cars/${car.id}`} className="w-full">
          <Button className="w-full group-hover:bg-primary/90" variant="outline">
            View Details <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
