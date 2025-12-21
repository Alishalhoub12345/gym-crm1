import { db } from "./db";
import {
  users, cars, brands, categories, orders, orderItems, carts, cartItems, contactMessages,
  type User, type InsertUser, type Car, type InsertCar, type Order, type InsertOrder,
  type ContactMessage, type InsertMessage, type Cart, type CartItem
} from "@shared/schema";
import { eq, like, and, gte, lte, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Cars
  getCars(filters?: any): Promise<Car[]>;
  getCar(id: number): Promise<Car | undefined>;
  createCar(car: InsertCar): Promise<Car>;
  updateCar(id: number, car: Partial<InsertCar>): Promise<Car>;
  deleteCar(id: number): Promise<void>;
  
  // Brands & Categories
  getBrands(): Promise<any[]>;
  getCategories(): Promise<any[]>;
  createBrand(name: string): Promise<any>;
  createCategory(name: string): Promise<any>;

  // Cart
  getCart(userId: number): Promise<Cart | undefined>;
  createCart(userId: number): Promise<Cart>;
  getCartItems(cartId: number): Promise<CartItem[]>;
  addCartItem(cartId: number, carId: number, quantity: number): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeCartItem(id: number): Promise<void>;
  clearCart(cartId: number): Promise<void>;

  // Orders
  createOrder(order: any, items: any[]): Promise<Order>;
  getOrders(userId?: number): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  
  // Messages
  createMessage(message: InsertMessage): Promise<ContactMessage>;
  getMessages(): Promise<ContactMessage[]>;

  // Stats
  getDashboardStats(): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getCars(filters: any = {}): Promise<Car[]> {
    let conditions = [];
    if (filters.search) conditions.push(like(cars.title, `%${filters.search}%`));
    if (filters.brandId) conditions.push(eq(cars.brandId, filters.brandId));
    if (filters.categoryId) conditions.push(eq(cars.categoryId, filters.categoryId));
    if (filters.minPrice) conditions.push(gte(cars.price, filters.minPrice.toString()));
    if (filters.maxPrice) conditions.push(lte(cars.price, filters.maxPrice.toString()));
    if (filters.year) conditions.push(eq(cars.year, filters.year));
    if (filters.condition) conditions.push(eq(cars.condition, filters.condition));
    if (filters.isFeatured) conditions.push(eq(cars.isFeatured, filters.isFeatured));

    return await db.query.cars.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: { brand: true, category: true },
      orderBy: [desc(cars.createdAt)],
    });
  }

  async getCar(id: number): Promise<Car | undefined> {
    return await db.query.cars.findFirst({
      where: eq(cars.id, id),
      with: { brand: true, category: true },
    });
  }

  async createCar(car: InsertCar): Promise<Car> {
    const [newCar] = await db.insert(cars).values(car).returning();
    return newCar;
  }

  async updateCar(id: number, updates: Partial<InsertCar>): Promise<Car> {
    const [updated] = await db.update(cars).set(updates).where(eq(cars.id, id)).returning();
    return updated;
  }

  async deleteCar(id: number): Promise<void> {
    await db.delete(cars).where(eq(cars.id, id));
  }

  async getBrands() {
    return await db.select().from(brands);
  }

  async getCategories() {
    return await db.select().from(categories);
  }
  
  async createBrand(name: string) {
    const [b] = await db.insert(brands).values({ name }).returning();
    return b;
  }

  async createCategory(name: string) {
    const [c] = await db.insert(categories).values({ name }).returning();
    return c;
  }

  async getCart(userId: number): Promise<Cart | undefined> {
    return await db.query.carts.findFirst({
      where: eq(carts.userId, userId),
      with: { items: { with: { car: { with: { brand: true, category: true } } } } }
    });
  }

  async createCart(userId: number): Promise<Cart> {
    const [cart] = await db.insert(carts).values({ userId }).returning();
    return cart;
  }

  async getCartItems(cartId: number): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.cartId, cartId));
  }

  async addCartItem(cartId: number, carId: number, quantity: number): Promise<CartItem> {
    const [existing] = await db.select().from(cartItems)
      .where(and(eq(cartItems.cartId, cartId), eq(cartItems.carId, carId)));
    
    if (existing) {
      const [updated] = await db.update(cartItems)
        .set({ quantity: existing.quantity + quantity })
        .where(eq(cartItems.id, existing.id))
        .returning();
      return updated;
    }
    
    const [item] = await db.insert(cartItems).values({ cartId, carId, quantity }).returning();
    return item;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const [updated] = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    return updated;
  }

  async removeCartItem(id: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(cartId: number): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  }

  async createOrder(orderData: any, itemsData: any[]): Promise<Order> {
    const [order] = await db.insert(orders).values(orderData).returning();
    for (const item of itemsData) {
      await db.insert(orderItems).values({ ...item, orderId: order.id });
    }
    return order;
  }

  async getOrders(userId?: number): Promise<Order[]> {
    const where = userId ? eq(orders.userId, userId) : undefined;
    return await db.query.orders.findMany({
      where,
      with: { items: { with: { car: true } } },
      orderBy: [desc(orders.createdAt)],
    });
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updated] = await db.update(orders).set({ status: status as any }).where(eq(orders.id, id)).returning();
    return updated;
  }

  async createMessage(message: InsertMessage): Promise<ContactMessage> {
    const [msg] = await db.insert(contactMessages).values(message).returning();
    return msg;
  }

  async getMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async getDashboardStats() {
    const [orderStats] = await db.select({ count: sql<number>`count(*)` }).from(orders);
    const [salesStats] = await db.select({ total: sql<number>`sum(total)` }).from(orders).where(eq(orders.status, 'delivered')); // Or paid
    const [carStats] = await db.select({ count: sql<number>`count(*)` }).from(cars);
    const [userStats] = await db.select({ count: sql<number>`count(*)` }).from(users);

    return {
      totalOrders: Number(orderStats.count),
      totalSales: Number(salesStats.total || 0),
      totalCars: Number(carStats.count),
      totalUsers: Number(userStats.count),
    };
  }
}

export const storage = new DatabaseStorage();
