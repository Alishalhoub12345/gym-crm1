import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useCars, useBrands, useCategories } from "@/hooks/use-cars";
import { CarCard } from "@/components/cars/CarCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export default function CarsList() {
  const [filters, setFilters] = useState({
    search: "",
    brandId: undefined as number | undefined,
    categoryId: undefined as number | undefined,
    condition: undefined as "new" | "used" | undefined,
    year: undefined as number | undefined,
  });

  const { data: cars, isLoading } = useCars(filters);
  const { data: brands } = useBrands();
  const { data: categories } = useCategories();

  // Debounced search could be added here for production
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      brandId: undefined,
      categoryId: undefined,
      condition: undefined,
      year: undefined,
    });
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <Label>Search</Label>
        <div className="relative mt-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search make, model..." 
            className="pl-9" 
            value={filters.search}
            onChange={handleSearch}
          />
        </div>
      </div>

      <div>
        <Label>Brand</Label>
        <Select 
          value={filters.brandId?.toString()} 
          onValueChange={(val) => setFilters(prev => ({ ...prev, brandId: Number(val) }))}
        >
          <SelectTrigger className="mt-2 w-full">
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            {brands?.map((brand) => (
              <SelectItem key={brand.id} value={brand.id.toString()}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Category</Label>
        <Select 
          value={filters.categoryId?.toString()} 
          onValueChange={(val) => setFilters(prev => ({ ...prev, categoryId: Number(val) }))}
        >
          <SelectTrigger className="mt-2 w-full">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories?.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Condition</Label>
        <Select 
          value={filters.condition} 
          onValueChange={(val) => setFilters(prev => ({ ...prev, condition: val as "new" | "used" }))}
        >
          <SelectTrigger className="mt-2 w-full">
            <SelectValue placeholder="Any Condition" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="used">Used</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        <X className="mr-2 h-4 w-4" /> Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container-custom py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground mt-1">
              Showing {cars?.length || 0} vehicles
            </p>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterSidebar />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden md:block col-span-1 border-r border-border pr-8">
            <FilterSidebar />
          </div>

          {/* Grid */}
          <div className="col-span-1 md:col-span-3">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-[380px] rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : cars?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Search className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold">No cars found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
                <Button variant="link" onClick={clearFilters} className="mt-2">Clear all filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars?.map((car: any) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
