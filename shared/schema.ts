import { pgTable, text, serial, integer, boolean, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === USERS ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // Acts as email for this app
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "customer"] }).default("customer").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });

// === BRANDS & CATEGORIES ===
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

// === CARS ===
export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: numeric("price").notNull(),
  year: integer("year").notNull(),
  mileage: integer("mileage").notNull(),
  brandId: integer("brand_id").references(() => brands.id).notNull(),
  categoryId: integer("category_id").references(() => categories.id).notNull(),
  transmission: text("transmission", { enum: ["automatic", "manual", "cvt"] }).notNull(),
  fuelType: text("fuel_type", { enum: ["petrol", "diesel", "electric", "hybrid"] }).notNull(),
  condition: text("condition", { enum: ["new", "used"] }).notNull(),
  stock: integer("stock").default(1).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  images: jsonb("images").$type<string[]>().notNull(), // Store image paths
  createdAt: timestamp("created_at").defaultNow(),
});

export const carsRelations = relations(cars, ({ one }) => ({
  brand: one(brands, {
    fields: [cars.brandId],
    references: [brands.id],
  }),
  category: one(categories, {
    fields: [cars.categoryId],
    references: [categories.id],
  }),
}));

export const insertCarSchema = createInsertSchema(cars).omit({ id: true, createdAt: true });

// === CART ===
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // Nullable for guest carts if needed, but requirements say "customer"
  createdAt: timestamp("created_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").references(() => carts.id).notNull(),
  carId: integer("car_id").references(() => cars.id).notNull(),
  quantity: integer("quantity").default(1).notNull(),
});

export const cartRelations = relations(carts, ({ many }) => ({
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  car: one(cars, {
    fields: [cartItems.carId],
    references: [cars.id],
  }),
}));

export const insertCartItemSchema = createInsertSchema(cartItems).omit({ id: true });

// === ORDERS ===
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  total: numeric("total").notNull(),
  status: text("status", { enum: ["pending", "paid", "shipped", "delivered", "cancelled"] }).default("pending").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  carId: integer("car_id").references(() => cars.id).notNull(),
  quantity: integer("quantity").notNull(),
  priceSnapshot: numeric("price_snapshot").notNull(),
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  car: one(cars, {
    fields: [orderItems.carId],
    references: [cars.id],
  }),
}));

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, status: true, userId: true, total: true });

// === MESSAGES ===
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true });

// === TYPES ===
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Car = typeof cars.$inferSelect;
export type InsertCar = z.infer<typeof insertCarSchema>;
export type Brand = typeof brands.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Cart = typeof carts.$inferSelect;
export type CartItem = typeof cartItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
