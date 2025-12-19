import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertCar } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

type CarFilters = {
  search?: string;
  brandId?: number;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  year?: number;
  condition?: "new" | "used";
  isFeatured?: boolean;
};

export function useCars(filters?: CarFilters) {
  // Construct query key including filters so refetch happens on change
  const queryKey = [api.cars.list.path, filters];
  
  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) params.append(key, String(value));
        });
      }
      const url = `${api.cars.list.path}?${params.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch cars");
      return api.cars.list.responses[200].parse(await res.json());
    },
  });
}

export function useCar(id: number) {
  return useQuery({
    queryKey: [api.cars.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.cars.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch car details");
      return api.cars.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateCar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertCar) => {
      const res = await fetch(api.cars.create.path, {
        method: api.cars.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create car listing");
      return api.cars.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cars.list.path] });
      toast({ title: "Success", description: "Car listing created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useUpdateCar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & Partial<InsertCar>) => {
      const url = buildUrl(api.cars.update.path, { id });
      const res = await fetch(url, {
        method: api.cars.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update car listing");
      return api.cars.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cars.list.path] });
      toast({ title: "Success", description: "Car listing updated" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  });
}

export function useDeleteCar() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.cars.delete.path, { id });
      const res = await fetch(url, { 
        method: api.cars.delete.method,
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete car");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.cars.list.path] });
      toast({ title: "Deleted", description: "Car listing removed" });
    },
  });
}

// Metadata hooks
export function useBrands() {
  return useQuery({
    queryKey: [api.brands.list.path],
    queryFn: async () => {
      const res = await fetch(api.brands.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch brands");
      return api.brands.list.responses[200].parse(await res.json());
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: [api.categories.list.path],
    queryFn: async () => {
      const res = await fetch(api.categories.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch categories");
      return api.categories.list.responses[200].parse(await res.json());
    },
  });
}
