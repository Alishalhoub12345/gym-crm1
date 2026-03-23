import { db } from "./db";
import {
  users, branches, members, coaches, packages, subscriptions, classes,
  classBookings, payments, attendance, products, orders, orderItems,
  leads, leadTasks, dietPlans, contactMessages, newsletterSubscribers,
  type User, type InsertUser, type Branch, type InsertBranch,
  type Member, type InsertMember, type Coach, type InsertCoach,
  type Package, type InsertPackage, type Subscription, type InsertSubscription,
  type Class, type InsertClass, type ClassBooking, type InsertClassBooking,
  type Payment, type InsertPayment, type Attendance, type InsertAttendance,
  type Product, type InsertProduct, type Order, type InsertOrder,
  type Lead, type InsertLead, type LeadTask, type InsertLeadTask,
  type DietPlan, type InsertDietPlan, type ContactMessage, type InsertContactMessage,
} from "@shared/schema";
import { eq, and, desc, sql, gte, lte, isNull, or } from "drizzle-orm";

export class DatabaseStorage {
  // === USERS ===
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUsers(branchId?: number): Promise<User[]> {
    if (branchId) {
      return db.select().from(users).where(eq(users.branchId, branchId)).orderBy(desc(users.createdAt));
    }
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async createUser(user: InsertUser): Promise<User> {
    const [created] = await db.insert(users).values(user).returning();
    return created;
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated;
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // === BRANCHES ===
  async getBranches(): Promise<Branch[]> {
    return db.select().from(branches).orderBy(desc(branches.createdAt));
  }

  async getBranch(id: number): Promise<Branch | undefined> {
    const [branch] = await db.select().from(branches).where(eq(branches.id, id));
    return branch;
  }

  async createBranch(branch: InsertBranch): Promise<Branch> {
    const [created] = await db.insert(branches).values(branch).returning();
    return created;
  }

  async updateBranch(id: number, data: Partial<InsertBranch>): Promise<Branch> {
    const [updated] = await db.update(branches).set(data).where(eq(branches.id, id)).returning();
    return updated;
  }

  async deleteBranch(id: number): Promise<void> {
    await db.delete(branches).where(eq(branches.id, id));
  }

  // === MEMBERS ===
  async getMembers(branchId?: number): Promise<any[]> {
    const query = db
      .select({
        id: members.id,
        userId: members.userId,
        branchId: members.branchId,
        membershipNumber: members.membershipNumber,
        gender: members.gender,
        birthDate: members.birthDate,
        emergencyContact: members.emergencyContact,
        joinDate: members.joinDate,
        status: members.status,
        notes: members.notes,
        height: members.height,
        weight: members.weight,
        fitnessGoal: members.fitnessGoal,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
        branchName: branches.name,
      })
      .from(members)
      .leftJoin(users, eq(members.userId, users.id))
      .leftJoin(branches, eq(members.branchId, branches.id));

    if (branchId) {
      return query.where(eq(members.branchId, branchId)).orderBy(desc(members.id));
    }
    return query.orderBy(desc(members.id));
  }

  async getMember(id: number): Promise<any> {
    const [member] = await db
      .select({
        id: members.id,
        userId: members.userId,
        branchId: members.branchId,
        membershipNumber: members.membershipNumber,
        gender: members.gender,
        birthDate: members.birthDate,
        emergencyContact: members.emergencyContact,
        joinDate: members.joinDate,
        status: members.status,
        notes: members.notes,
        height: members.height,
        weight: members.weight,
        fitnessGoal: members.fitnessGoal,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
        branchName: branches.name,
      })
      .from(members)
      .leftJoin(users, eq(members.userId, users.id))
      .leftJoin(branches, eq(members.branchId, branches.id))
      .where(eq(members.id, id));
    return member;
  }

  async getMemberByUserId(userId: number): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.userId, userId));
    return member;
  }

  async createMember(member: InsertMember): Promise<Member> {
    const [created] = await db.insert(members).values(member).returning();
    return created;
  }

  async updateMember(id: number, data: Partial<InsertMember>): Promise<Member> {
    const [updated] = await db.update(members).set(data).where(eq(members.id, id)).returning();
    return updated;
  }

  async deleteMember(id: number): Promise<void> {
    await db.delete(members).where(eq(members.id, id));
  }

  // === COACHES ===
  async getCoaches(branchId?: number): Promise<any[]> {
    const query = db
      .select({
        id: coaches.id,
        userId: coaches.userId,
        branchId: coaches.branchId,
        specialization: coaches.specialization,
        salary: coaches.salary,
        hireDate: coaches.hireDate,
        status: coaches.status,
        bio: coaches.bio,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
        branchName: branches.name,
      })
      .from(coaches)
      .leftJoin(users, eq(coaches.userId, users.id))
      .leftJoin(branches, eq(coaches.branchId, branches.id));

    if (branchId) {
      return query.where(eq(coaches.branchId, branchId)).orderBy(desc(coaches.id));
    }
    return query.orderBy(desc(coaches.id));
  }

  async getCoach(id: number): Promise<any> {
    const [coach] = await db
      .select({
        id: coaches.id,
        userId: coaches.userId,
        branchId: coaches.branchId,
        specialization: coaches.specialization,
        salary: coaches.salary,
        hireDate: coaches.hireDate,
        status: coaches.status,
        bio: coaches.bio,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
        branchName: branches.name,
      })
      .from(coaches)
      .leftJoin(users, eq(coaches.userId, users.id))
      .leftJoin(branches, eq(coaches.branchId, branches.id))
      .where(eq(coaches.id, id));
    return coach;
  }

  async createCoach(coach: InsertCoach): Promise<Coach> {
    const [created] = await db.insert(coaches).values(coach).returning();
    return created;
  }

  async updateCoach(id: number, data: Partial<InsertCoach>): Promise<Coach> {
    const [updated] = await db.update(coaches).set(data).where(eq(coaches.id, id)).returning();
    return updated;
  }

  async deleteCoach(id: number): Promise<void> {
    await db.delete(coaches).where(eq(coaches.id, id));
  }

  // === PACKAGES ===
  async getPackages(branchId?: number): Promise<Package[]> {
    if (branchId) {
      return db.select().from(packages).where(
        or(eq(packages.branchId, branchId), isNull(packages.branchId))
      ).orderBy(desc(packages.id));
    }
    return db.select().from(packages).orderBy(desc(packages.id));
  }

  async getPackage(id: number): Promise<Package | undefined> {
    const [pkg] = await db.select().from(packages).where(eq(packages.id, id));
    return pkg;
  }

  async createPackage(pkg: InsertPackage): Promise<Package> {
    const [created] = await db.insert(packages).values(pkg).returning();
    return created;
  }

  async updatePackage(id: number, data: Partial<InsertPackage>): Promise<Package> {
    const [updated] = await db.update(packages).set(data).where(eq(packages.id, id)).returning();
    return updated;
  }

  async deletePackage(id: number): Promise<void> {
    await db.delete(packages).where(eq(packages.id, id));
  }

  // === SUBSCRIPTIONS ===
  async getSubscriptions(memberId?: number): Promise<any[]> {
    const query = db
      .select({
        id: subscriptions.id,
        memberId: subscriptions.memberId,
        packageId: subscriptions.packageId,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        remainingClasses: subscriptions.remainingClasses,
        status: subscriptions.status,
        createdAt: subscriptions.createdAt,
        packageName: packages.name,
        packagePrice: packages.price,
        memberName: users.name,
      })
      .from(subscriptions)
      .leftJoin(packages, eq(subscriptions.packageId, packages.id))
      .leftJoin(members, eq(subscriptions.memberId, members.id))
      .leftJoin(users, eq(members.userId, users.id));

    if (memberId) {
      return query.where(eq(subscriptions.memberId, memberId)).orderBy(desc(subscriptions.createdAt));
    }
    return query.orderBy(desc(subscriptions.createdAt));
  }

  async getActiveSubscription(memberId: number): Promise<Subscription | undefined> {
    const today = new Date().toISOString().split("T")[0];
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.memberId, memberId),
          eq(subscriptions.status, "active")
        )
      );
    return sub;
  }

  async createSubscription(sub: InsertSubscription): Promise<Subscription> {
    const [created] = await db.insert(subscriptions).values(sub).returning();
    return created;
  }

  async updateSubscription(id: number, data: Partial<InsertSubscription>): Promise<Subscription> {
    const [updated] = await db.update(subscriptions).set(data).where(eq(subscriptions.id, id)).returning();
    return updated;
  }

  // === CLASSES ===
  async getClasses(branchId?: number): Promise<any[]> {
    const query = db
      .select({
        id: classes.id,
        branchId: classes.branchId,
        title: classes.title,
        description: classes.description,
        coachId: classes.coachId,
        classDate: classes.classDate,
        startTime: classes.startTime,
        endTime: classes.endTime,
        capacity: classes.capacity,
        priceExtra: classes.priceExtra,
        requiresExtraPayment: classes.requiresExtraPayment,
        status: classes.status,
        coachName: users.name,
        branchName: branches.name,
      })
      .from(classes)
      .leftJoin(coaches, eq(classes.coachId, coaches.id))
      .leftJoin(users, eq(coaches.userId, users.id))
      .leftJoin(branches, eq(classes.branchId, branches.id));

    if (branchId) {
      return query.where(eq(classes.branchId, branchId)).orderBy(desc(classes.classDate));
    }
    return query.orderBy(desc(classes.classDate));
  }

  async getClass(id: number): Promise<any> {
    const [cls] = await db
      .select({
        id: classes.id,
        branchId: classes.branchId,
        title: classes.title,
        description: classes.description,
        coachId: classes.coachId,
        classDate: classes.classDate,
        startTime: classes.startTime,
        endTime: classes.endTime,
        capacity: classes.capacity,
        priceExtra: classes.priceExtra,
        requiresExtraPayment: classes.requiresExtraPayment,
        status: classes.status,
        coachName: users.name,
        branchName: branches.name,
      })
      .from(classes)
      .leftJoin(coaches, eq(classes.coachId, coaches.id))
      .leftJoin(users, eq(coaches.userId, users.id))
      .leftJoin(branches, eq(classes.branchId, branches.id))
      .where(eq(classes.id, id));
    return cls;
  }

  async createClass(cls: InsertClass): Promise<Class> {
    const [created] = await db.insert(classes).values(cls).returning();
    return created;
  }

  async updateClass(id: number, data: Partial<InsertClass>): Promise<Class> {
    const [updated] = await db.update(classes).set(data).where(eq(classes.id, id)).returning();
    return updated;
  }

  async deleteClass(id: number): Promise<void> {
    await db.delete(classes).where(eq(classes.id, id));
  }

  // === CLASS BOOKINGS ===
  async getClassBookings(classId?: number, memberId?: number): Promise<any[]> {
    const query = db
      .select({
        id: classBookings.id,
        classId: classBookings.classId,
        memberId: classBookings.memberId,
        bookingType: classBookings.bookingType,
        subscriptionId: classBookings.subscriptionId,
        paymentId: classBookings.paymentId,
        status: classBookings.status,
        bookedAt: classBookings.bookedAt,
        classTitle: classes.title,
        classDate: classes.classDate,
        memberName: users.name,
      })
      .from(classBookings)
      .leftJoin(classes, eq(classBookings.classId, classes.id))
      .leftJoin(members, eq(classBookings.memberId, members.id))
      .leftJoin(users, eq(members.userId, users.id));

    if (classId) return query.where(eq(classBookings.classId, classId)).orderBy(desc(classBookings.bookedAt));
    if (memberId) return query.where(eq(classBookings.memberId, memberId)).orderBy(desc(classBookings.bookedAt));
    return query.orderBy(desc(classBookings.bookedAt));
  }

  async createClassBooking(booking: InsertClassBooking): Promise<ClassBooking> {
    const [created] = await db.insert(classBookings).values(booking).returning();
    return created;
  }

  async updateClassBooking(id: number, data: Partial<InsertClassBooking>): Promise<ClassBooking> {
    const [updated] = await db.update(classBookings).set(data).where(eq(classBookings.id, id)).returning();
    return updated;
  }

  // === PAYMENTS ===
  async getPayments(branchId?: number, memberId?: number): Promise<any[]> {
    const query = db
      .select({
        id: payments.id,
        memberId: payments.memberId,
        branchId: payments.branchId,
        subscriptionId: payments.subscriptionId,
        classBookingId: payments.classBookingId,
        amount: payments.amount,
        paymentType: payments.paymentType,
        paymentMethod: payments.paymentMethod,
        status: payments.status,
        transactionRef: payments.transactionRef,
        notes: payments.notes,
        paidAt: payments.paidAt,
        memberName: users.name,
        branchName: branches.name,
      })
      .from(payments)
      .leftJoin(members, eq(payments.memberId, members.id))
      .leftJoin(users, eq(members.userId, users.id))
      .leftJoin(branches, eq(payments.branchId, branches.id));

    if (branchId && memberId) {
      return query.where(and(eq(payments.branchId, branchId), eq(payments.memberId, memberId))).orderBy(desc(payments.paidAt));
    }
    if (branchId) return query.where(eq(payments.branchId, branchId)).orderBy(desc(payments.paidAt));
    if (memberId) return query.where(eq(payments.memberId, memberId)).orderBy(desc(payments.paidAt));
    return query.orderBy(desc(payments.paidAt));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [created] = await db.insert(payments).values(payment).returning();
    return created;
  }

  // === ATTENDANCE ===
  async getAttendance(branchId?: number, memberId?: number): Promise<any[]> {
    const query = db
      .select({
        id: attendance.id,
        classId: attendance.classId,
        memberId: attendance.memberId,
        branchId: attendance.branchId,
        checkinTime: attendance.checkinTime,
        attendanceType: attendance.attendanceType,
        markedBy: attendance.markedBy,
        notes: attendance.notes,
        memberName: users.name,
        branchName: branches.name,
        classTitle: classes.title,
      })
      .from(attendance)
      .leftJoin(members, eq(attendance.memberId, members.id))
      .leftJoin(users, eq(members.userId, users.id))
      .leftJoin(branches, eq(attendance.branchId, branches.id))
      .leftJoin(classes, eq(attendance.classId, classes.id));

    if (branchId) return query.where(eq(attendance.branchId, branchId)).orderBy(desc(attendance.checkinTime));
    if (memberId) return query.where(eq(attendance.memberId, memberId)).orderBy(desc(attendance.checkinTime));
    return query.orderBy(desc(attendance.checkinTime));
  }

  async createAttendance(rec: InsertAttendance): Promise<Attendance> {
    const [created] = await db.insert(attendance).values(rec).returning();
    return created;
  }

  // === PRODUCTS ===
  async getProducts(branchId?: number): Promise<Product[]> {
    if (branchId) {
      return db.select().from(products).where(
        or(eq(products.branchId, branchId), isNull(products.branchId))
      ).orderBy(desc(products.id));
    }
    return db.select().from(products).orderBy(desc(products.id));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db.update(products).set(data).where(eq(products.id, id)).returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // === ORDERS ===
  async getOrders(branchId?: number, memberId?: number): Promise<any[]> {
    const query = db
      .select({
        id: orders.id,
        memberId: orders.memberId,
        branchId: orders.branchId,
        totalAmount: orders.totalAmount,
        paymentStatus: orders.paymentStatus,
        orderStatus: orders.orderStatus,
        createdAt: orders.createdAt,
        memberName: users.name,
      })
      .from(orders)
      .leftJoin(members, eq(orders.memberId, members.id))
      .leftJoin(users, eq(members.userId, users.id));

    if (branchId) return query.where(eq(orders.branchId, branchId)).orderBy(desc(orders.createdAt));
    if (memberId) return query.where(eq(orders.memberId, memberId)).orderBy(desc(orders.createdAt));
    return query.orderBy(desc(orders.createdAt));
  }

  async createOrder(order: InsertOrder, items: any[]): Promise<Order> {
    const [created] = await db.insert(orders).values(order).returning();
    if (items.length > 0) {
      await db.insert(orderItems).values(items.map(item => ({ ...item, orderId: created.id })));
    }
    return created;
  }

  // === LEADS ===
  async getLeads(branchId?: number): Promise<any[]> {
    const query = db
      .select({
        id: leads.id,
        branchId: leads.branchId,
        name: leads.name,
        phone: leads.phone,
        email: leads.email,
        source: leads.source,
        status: leads.status,
        assignedTo: leads.assignedTo,
        notes: leads.notes,
        createdAt: leads.createdAt,
        branchName: branches.name,
        assignedName: users.name,
      })
      .from(leads)
      .leftJoin(branches, eq(leads.branchId, branches.id))
      .leftJoin(users, eq(leads.assignedTo, users.id));

    if (branchId) return query.where(eq(leads.branchId, branchId)).orderBy(desc(leads.createdAt));
    return query.orderBy(desc(leads.createdAt));
  }

  async getLead(id: number): Promise<any> {
    const [lead] = await db
      .select()
      .from(leads)
      .where(eq(leads.id, id));
    return lead;
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const [created] = await db.insert(leads).values(lead).returning();
    return created;
  }

  async updateLead(id: number, data: Partial<InsertLead>): Promise<Lead> {
    const [updated] = await db.update(leads).set(data).where(eq(leads.id, id)).returning();
    return updated;
  }

  async deleteLead(id: number): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  async getLeadTasks(leadId: number): Promise<LeadTask[]> {
    return db.select().from(leadTasks).where(eq(leadTasks.leadId, leadId)).orderBy(desc(leadTasks.createdAt));
  }

  async createLeadTask(task: InsertLeadTask): Promise<LeadTask> {
    const [created] = await db.insert(leadTasks).values(task).returning();
    return created;
  }

  async updateLeadTask(id: number, data: Partial<InsertLeadTask>): Promise<LeadTask> {
    const [updated] = await db.update(leadTasks).set(data).where(eq(leadTasks.id, id)).returning();
    return updated;
  }

  // === DIET PLANS ===
  async getDietPlans(memberId?: number): Promise<DietPlan[]> {
    if (memberId) {
      return db.select().from(dietPlans).where(eq(dietPlans.memberId, memberId)).orderBy(desc(dietPlans.createdAt));
    }
    return db.select().from(dietPlans).orderBy(desc(dietPlans.createdAt));
  }

  async createDietPlan(plan: InsertDietPlan): Promise<DietPlan> {
    const [created] = await db.insert(dietPlans).values(plan).returning();
    return created;
  }

  async updateDietPlan(id: number, data: Partial<InsertDietPlan>): Promise<DietPlan> {
    const [updated] = await db.update(dietPlans).set(data).where(eq(dietPlans.id, id)).returning();
    return updated;
  }

  // === CONTACT MESSAGES ===
  async getContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async createContactMessage(msg: InsertContactMessage): Promise<ContactMessage> {
    const [created] = await db.insert(contactMessages).values(msg).returning();
    return created;
  }

  async updateContactMessage(id: number, status: string): Promise<ContactMessage> {
    const [updated] = await db.update(contactMessages).set({ status: status as any }).where(eq(contactMessages.id, id)).returning();
    return updated;
  }

  // === NEWSLETTER ===
  async subscribeNewsletter(email: string): Promise<void> {
    await db.insert(newsletterSubscribers).values({ email }).onConflictDoNothing();
  }

  // === DASHBOARD STATS ===
  async getDashboardStats(branchId?: number): Promise<any> {
    const memberFilter = branchId ? eq(members.branchId, branchId) : undefined;
    const classFilter = branchId ? eq(classes.branchId, branchId) : undefined;
    const paymentFilter = branchId ? eq(payments.branchId, branchId) : undefined;

    const [memberCount] = await db.select({ count: sql<number>`count(*)` }).from(members).where(memberFilter);
    const [coachCount] = await db.select({ count: sql<number>`count(*)` }).from(coaches).where(branchId ? eq(coaches.branchId, branchId) : undefined);
    const [classCount] = await db.select({ count: sql<number>`count(*)` }).from(classes).where(classFilter);
    const [paymentSum] = await db.select({ total: sql<number>`coalesce(sum(amount::numeric), 0)` }).from(payments).where(paymentFilter);
    const [leadCount] = await db.select({ count: sql<number>`count(*)` }).from(leads).where(branchId ? eq(leads.branchId, branchId) : undefined);
    const [activeSubCount] = await db.select({ count: sql<number>`count(*)` }).from(subscriptions).where(eq(subscriptions.status, "active"));

    return {
      totalMembers: Number(memberCount?.count || 0),
      totalCoaches: Number(coachCount?.count || 0),
      totalClasses: Number(classCount?.count || 0),
      totalRevenue: Number(paymentSum?.total || 0),
      totalLeads: Number(leadCount?.count || 0),
      activeSubscriptions: Number(activeSubCount?.count || 0),
    };
  }
}

export const storage = new DatabaseStorage();
