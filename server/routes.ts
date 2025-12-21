import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, hashPassword, verifyPassword, validateStrongPassword } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import passport from "passport";

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Setup Auth (Passport)
  setupAuth(app);

  // Middleware to check if admin
  const isAdmin = (req: any, res: any, next: any) => {
    if (req.isAuthenticated() && req.user.role === 'admin') {
      return next();
    }
    res.status(403).json({ message: "Admin access required" });
  };

  const isAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Login required" });
  };

  // === AUTH ROUTES ===
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const { username, password } = req.body;

      // Validate strong password
      const passwordValidation = validateStrongPassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          message: "Password too weak",
          errors: passwordValidation.errors,
        });
      }

      // Check if user exists
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        role: "customer",
      });

      // Log the user in
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Registration successful but login failed" });
        }
        res.status(201).json({
          id: user.id,
          username: user.username,
          role: user.role,
        });
      });
    } catch (err) {
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post(api.auth.login.path, passport.authenticate("local"), (req: any, res) => {
    res.json({
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
    });
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.logOut((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.user.path, (req: any, res) => {
    if (req.isAuthenticated()) {
      res.json({
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
      });
    } else {
      res.status(200).json(null);
    }
  });

  // === CARS ===
  app.get(api.cars.list.path, async (req, res) => {
    const filters = req.query;
    const cars = await storage.getCars(filters);
    res.json(cars);
  });

  app.get(api.cars.get.path, async (req, res) => {
    const car = await storage.getCar(Number(req.params.id));
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(car);
  });

  app.post(api.cars.create.path, isAdmin, async (req, res) => {
    const car = await storage.createCar(req.body);
    res.status(201).json(car);
  });

  app.put(api.cars.update.path, isAdmin, async (req, res) => {
    const car = await storage.updateCar(Number(req.params.id), req.body);
    res.json(car);
  });

  app.delete(api.cars.delete.path, isAdmin, async (req, res) => {
    await storage.deleteCar(Number(req.params.id));
    res.status(204).send();
  });

  // === BRANDS & CATEGORIES ===
  app.get(api.brands.list.path, async (req, res) => {
    const brands = await storage.getBrands();
    res.json(brands);
  });

  app.get(api.categories.list.path, async (req, res) => {
    const categories = await storage.getCategories();
    res.json(categories);
  });

  // === CART ===
  app.get(api.cart.get.path, isAuth, async (req, res) => {
    let cart = await storage.getCart(req.user!.id);
    if (!cart) cart = await storage.createCart(req.user!.id);
    res.json(cart);
  });

  app.post(api.cart.addItem.path, isAuth, async (req, res) => {
    let cart = await storage.getCart(req.user!.id);
    if (!cart) cart = await storage.createCart(req.user!.id);
    await storage.addCartItem(cart.id, req.body.carId, req.body.quantity);
    res.json(await storage.getCart(req.user!.id));
  });

  app.patch(api.cart.updateItem.path, isAuth, async (req, res) => {
    await storage.updateCartItem(Number(req.params.id), req.body.quantity);
    res.json(await storage.getCart(req.user!.id));
  });

  app.delete(api.cart.removeItem.path, isAuth, async (req, res) => {
    await storage.removeCartItem(Number(req.params.id));
    res.json(await storage.getCart(req.user!.id));
  });

  app.post(api.cart.clear.path, isAuth, async (req, res) => {
    const cart = await storage.getCart(req.user!.id);
    if (cart) await storage.clearCart(cart.id);
    res.json({ message: "Cart cleared" });
  });

  // === ORDERS ===
  app.post(api.orders.create.path, isAuth, async (req, res) => {
    const cart = await storage.getCart(req.user!.id);
    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate total from current car prices
    let total = 0;
    const orderItemsData = [];
    
    for (const item of cart.items) {
      const car = item.car; // Joined in getCart
      if (!car) continue;
      
      const price = Number(car.price);
      total += price * item.quantity;
      
      orderItemsData.push({
        carId: item.carId,
        quantity: item.quantity,
        priceSnapshot: price.toString(),
      });
    }

    const orderData = {
      userId: req.user!.id,
      total: total.toString(),
      address: req.body.address,
      phone: req.body.phone,
      notes: req.body.notes,
      status: "pending",
    };

    const order = await storage.createOrder(orderData, orderItemsData);
    await storage.clearCart(cart.id); // Clear cart after order
    
    res.status(201).json(order);
  });

  app.get(api.orders.list.path, isAuth, async (req, res) => {
    if (req.user!.role === 'admin') {
      const orders = await storage.getOrders();
      res.json(orders);
    } else {
      const orders = await storage.getOrders(req.user!.id);
      res.json(orders);
    }
  });

  app.patch(api.orders.updateStatus.path, isAdmin, async (req, res) => {
    const order = await storage.updateOrderStatus(Number(req.params.id), req.body.status);
    res.json(order);
  });

  // === MESSAGES ===
  app.post(api.contact.submit.path, async (req, res) => {
    const msg = await storage.createMessage(req.body);
    res.status(201).json(msg);
  });

  app.get(api.contact.list.path, isAdmin, async (req, res) => {
    const msgs = await storage.getMessages();
    res.json(msgs);
  });

  // === DASHBOARD ===
  app.get(api.dashboard.stats.path, isAdmin, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // SEED DATA ROUTE (For development)
  app.post("/api/seed", async (req, res) => {
    // Basic check to prevent public re-seeding if needed, or just let it be for dev
    await seed();
    res.json({ message: "Database seeded" });
  });

  // Auto-seed on startup
  seed().catch(console.error);

  return httpServer;
}

async function seed() {
  // Check if admin exists
  const existingAdmin = await storage.getUserByUsername("admin@carstore.test");
  if (!existingAdmin) {
    // Strong password: Admin@123456!
    const hashedPassword = await hashPassword("Admin@123456!");
    await storage.createUser({
      username: "admin@carstore.test",
      password: hashedPassword,
      role: "admin"
    });
  }

  // Brands
  const brandsList = ["Toyota", "Honda", "BMW", "Mercedes", "Ford", "Tesla"];
  const brandsMap: Record<string, number> = {};
  for (const b of brandsList) {
    const existing = (await storage.getBrands()).find((br: any) => br.name === b);
    if (!existing) {
      const newB = await storage.createBrand(b);
      brandsMap[b] = newB.id;
    } else {
      brandsMap[b] = existing.id;
    }
  }

  // Categories
  const catsList = ["SUV", "Sedan", "Coupe", "Truck", "Electric"];
  const catsMap: Record<string, number> = {};
  for (const c of catsList) {
    const existing = (await storage.getCategories()).find((cat: any) => cat.name === c);
    if (!existing) {
      const newC = await storage.createCategory(c);
      catsMap[c] = newC.id;
    } else {
      catsMap[c] = existing.id;
    }
  }

  // Cars (Seed 20 cars)
  const carsCount = (await storage.getCars()).length;
  if (carsCount === 0) {
    const sampleCars = [
      { title: "Toyota Camry 2023", brand: "Toyota", cat: "Sedan", price: "25000", year: 2023, mileage: 5000 },
      { title: "Honda CR-V", brand: "Honda", cat: "SUV", price: "28000", year: 2022, mileage: 12000 },
      { title: "BMW 3 Series", brand: "BMW", cat: "Sedan", price: "45000", year: 2023, mileage: 2000 },
      { title: "Tesla Model 3", brand: "Tesla", cat: "Electric", price: "35000", year: 2021, mileage: 25000 },
      { title: "Ford F-150", brand: "Ford", cat: "Truck", price: "40000", year: 2020, mileage: 45000 },
    ];

    for (let i = 0; i < 20; i++) {
      const sample = sampleCars[i % sampleCars.length];
      await storage.createCar({
        title: `${sample.title} #${i+1}`,
        description: "A great car with amazing features. Reliable and well maintained.",
        price: (Number(sample.price) + i * 100).toString(),
        year: sample.year,
        mileage: sample.mileage + i * 1000,
        brandId: brandsMap[sample.brand],
        categoryId: catsMap[sample.cat],
        transmission: i % 3 === 0 ? "manual" : "automatic",
        fuelType: sample.brand === "Tesla" ? "electric" : "petrol",
        condition: i % 5 === 0 ? "new" : "used",
        stock: 1,
        isFeatured: i < 5,
        images: ["https://images.unsplash.com/photo-1541443131876-44b03de101c5?w=800", "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800"],
      });
    }
  }
}
