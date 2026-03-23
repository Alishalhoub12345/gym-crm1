import { pgTable, text, serial, integer, boolean, timestamp, numeric, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// === BRANCHES ===
export const branches = pgTable("branches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  phone: text("phone"),
  email: text("email"),
  status: text("status", { enum: ["active", "inactive"] }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBranchSchema = createInsertSchema(branches).omit({ id: true, createdAt: true });
export type Branch = typeof branches.$inferSelect;
export type InsertBranch = z.infer<typeof insertBranchSchema>;

// === USERS ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["owner", "admin", "coach", "member", "dietitian"] }).default("member").notNull(),
  branchId: integer("branch_id").references(() => branches.id),
  phone: text("phone"),
  status: text("status", { enum: ["active", "suspended", "inactive"] }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// === MEMBERS ===
export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  membershipNumber: text("membership_number"),
  gender: text("gender", { enum: ["male", "female", "other"] }),
  birthDate: date("birth_date"),
  emergencyContact: text("emergency_contact"),
  joinDate: date("join_date"),
  status: text("status", { enum: ["active", "expired", "frozen"] }).default("active").notNull(),
  notes: text("notes"),
  // Fitness info
  height: numeric("height"),
  weight: numeric("weight"),
  fitnessGoal: text("fitness_goal"),
});

export const insertMemberSchema = createInsertSchema(members).omit({ id: true });
export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;

// === COACHES ===
export const coaches = pgTable("coaches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  specialization: text("specialization"),
  salary: numeric("salary"),
  hireDate: date("hire_date"),
  status: text("status", { enum: ["active", "inactive"] }).default("active").notNull(),
  bio: text("bio"),
});

export const insertCoachSchema = createInsertSchema(coaches).omit({ id: true });
export type Coach = typeof coaches.$inferSelect;
export type InsertCoach = z.infer<typeof insertCoachSchema>;

// === PACKAGES ===
export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price").notNull(),
  durationDays: integer("duration_days").notNull(),
  branchId: integer("branch_id").references(() => branches.id),
  sessionsPerWeek: integer("sessions_per_week"),
  totalClasses: integer("total_classes"),
  includesGymAccess: boolean("includes_gym_access").default(true),
  includesClasses: boolean("includes_classes").default(true),
  status: text("status", { enum: ["active", "inactive"] }).default("active").notNull(),
});

export const insertPackageSchema = createInsertSchema(packages).omit({ id: true });
export type Package = typeof packages.$inferSelect;
export type InsertPackage = z.infer<typeof insertPackageSchema>;

// === SUBSCRIPTIONS ===
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").references(() => members.id).notNull(),
  packageId: integer("package_id").references(() => packages.id).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  remainingClasses: integer("remaining_classes"),
  status: text("status", { enum: ["active", "expired", "canceled"] }).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({ id: true, createdAt: true });
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

// === CLASSES ===
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  coachId: integer("coach_id").references(() => coaches.id),
  classDate: date("class_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  capacity: integer("capacity").notNull(),
  priceExtra: numeric("price_extra"),
  requiresExtraPayment: boolean("requires_extra_payment").default(false),
  status: text("status", { enum: ["scheduled", "canceled", "completed"] }).default("scheduled").notNull(),
});

export const insertClassSchema = createInsertSchema(classes).omit({ id: true });
export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;

// === CLASS BOOKINGS ===
export const classBookings = pgTable("class_bookings", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").references(() => classes.id).notNull(),
  memberId: integer("member_id").references(() => members.id).notNull(),
  bookingType: text("booking_type", { enum: ["package", "extra_payment"] }).notNull(),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id),
  paymentId: integer("payment_id"),
  status: text("status", { enum: ["booked", "attended", "canceled"] }).default("booked").notNull(),
  bookedAt: timestamp("booked_at").defaultNow(),
});

export const insertClassBookingSchema = createInsertSchema(classBookings).omit({ id: true, bookedAt: true });
export type ClassBooking = typeof classBookings.$inferSelect;
export type InsertClassBooking = z.infer<typeof insertClassBookingSchema>;

// === PAYMENTS ===
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").references(() => members.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  subscriptionId: integer("subscription_id").references(() => subscriptions.id),
  classBookingId: integer("class_booking_id").references(() => classBookings.id),
  amount: numeric("amount").notNull(),
  paymentType: text("payment_type", { enum: ["package_purchase", "class_extra", "product_purchase", "other"] }).notNull(),
  paymentMethod: text("payment_method", { enum: ["cash", "card", "online"] }).notNull(),
  status: text("status", { enum: ["pending", "paid", "failed", "refunded"] }).default("paid").notNull(),
  transactionRef: text("transaction_ref"),
  notes: text("notes"),
  paidAt: timestamp("paid_at").defaultNow(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, paidAt: true });
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// === ATTENDANCE ===
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").references(() => classes.id),
  memberId: integer("member_id").references(() => members.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  checkinTime: timestamp("checkin_time").defaultNow(),
  attendanceType: text("attendance_type", { enum: ["gym_entry", "class_attendance"] }).notNull(),
  markedBy: integer("marked_by").references(() => users.id),
  notes: text("notes"),
});

export const insertAttendanceSchema = createInsertSchema(attendance).omit({ id: true, checkinTime: true });
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

// === PRODUCTS ===
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").references(() => branches.id),
  name: text("name").notNull(),
  description: text("description"),
  price: numeric("price").notNull(),
  stockQty: integer("stock_qty").default(0),
  imageUrl: text("image_url"),
  category: text("category"),
  status: text("status", { enum: ["active", "inactive"] }).default("active").notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

// === ORDERS ===
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").references(() => members.id).notNull(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  totalAmount: numeric("total_amount").notNull(),
  paymentStatus: text("payment_status", { enum: ["pending", "paid", "failed"] }).default("pending").notNull(),
  orderStatus: text("order_status", { enum: ["open", "shipped", "closed"] }).default("open").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  qty: integer("qty").notNull(),
  unitPrice: numeric("unit_price").notNull(),
  totalPrice: numeric("total_price").notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

// === LEADS (CRM) ===
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  branchId: integer("branch_id").references(() => branches.id).notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  source: text("source", { enum: ["walk_in", "social", "website", "referral", "other"] }).default("other"),
  status: text("status", { enum: ["new", "contacted", "converted", "lost"] }).default("new").notNull(),
  assignedTo: integer("assigned_to").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export const leadTasks = pgTable("lead_tasks", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id).notNull(),
  assignedTo: integer("assigned_to").references(() => users.id),
  dueDate: date("due_date"),
  status: text("status", { enum: ["open", "done", "canceled"] }).default("open").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLeadTaskSchema = createInsertSchema(leadTasks).omit({ id: true, createdAt: true });
export type LeadTask = typeof leadTasks.$inferSelect;
export type InsertLeadTask = z.infer<typeof insertLeadTaskSchema>;

// === DIET PLANS (Dietitian) ===
export const dietPlans = pgTable("diet_plans", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").references(() => members.id).notNull(),
  dietitianId: integer("dietitian_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  calories: integer("calories"),
  protein: numeric("protein"),
  carbs: numeric("carbs"),
  fats: numeric("fats"),
  notes: text("notes"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDietPlanSchema = createInsertSchema(dietPlans).omit({ id: true, createdAt: true });
export type DietPlan = typeof dietPlans.$inferSelect;
export type InsertDietPlan = z.infer<typeof insertDietPlanSchema>;

// === CONTACT MESSAGES ===
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject"),
  message: text("message").notNull(),
  status: text("status", { enum: ["new", "reviewed", "closed"] }).default("new").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true, status: true });
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

// === NEWSLETTER ===
export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  status: text("status", { enum: ["subscribed", "unsubscribed"] }).default("subscribed").notNull(),
  subscribedAt: timestamp("subscribed_at").defaultNow(),
});

// === RELATIONS ===
export const branchesRelations = relations(branches, ({ many }) => ({
  users: many(users),
  members: many(members),
  coaches: many(coaches),
  classes: many(classes),
}));

export const usersRelations = relations(users, ({ one }) => ({
  branch: one(branches, { fields: [users.branchId], references: [branches.id] }),
}));

export const membersRelations = relations(members, ({ one, many }) => ({
  user: one(users, { fields: [members.userId], references: [users.id] }),
  branch: one(branches, { fields: [members.branchId], references: [branches.id] }),
  subscriptions: many(subscriptions),
  payments: many(payments),
  attendance: many(attendance),
}));

export const coachesRelations = relations(coaches, ({ one, many }) => ({
  user: one(users, { fields: [coaches.userId], references: [users.id] }),
  branch: one(branches, { fields: [coaches.branchId], references: [branches.id] }),
  classes: many(classes),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  branch: one(branches, { fields: [classes.branchId], references: [branches.id] }),
  coach: one(coaches, { fields: [classes.coachId], references: [coaches.id] }),
  bookings: many(classBookings),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  member: one(members, { fields: [subscriptions.memberId], references: [members.id] }),
  package: one(packages, { fields: [subscriptions.packageId], references: [packages.id] }),
}));

export const classBookingsRelations = relations(classBookings, ({ one }) => ({
  class: one(classes, { fields: [classBookings.classId], references: [classes.id] }),
  member: one(members, { fields: [classBookings.memberId], references: [members.id] }),
  subscription: one(subscriptions, { fields: [classBookings.subscriptionId], references: [subscriptions.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  member: one(members, { fields: [payments.memberId], references: [members.id] }),
  branch: one(branches, { fields: [payments.branchId], references: [branches.id] }),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  branch: one(branches, { fields: [leads.branchId], references: [branches.id] }),
  assignedUser: one(users, { fields: [leads.assignedTo], references: [users.id] }),
  tasks: many(leadTasks),
}));
