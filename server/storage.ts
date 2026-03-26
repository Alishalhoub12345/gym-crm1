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
  private async insertAndFetch(table: any, values: any): Promise<any> {
    const [result] = await db.insert(table).values(values).$returningId();
    if (!result?.id) {
      throw new Error("Insert failed");
    }

    const [created] = await db.select().from(table).where(eq(table.id, result.id));
    if (!created) {
      throw new Error(`Inserted record ${result.id} was not found`);
    }

    return created;
  }

  private async updateAndFetch(table: any, id: number, data: any): Promise<any> {
    await db.update(table).set(data).where(eq(table.id, id));

    const [updated] = await db.select().from(table).where(eq(table.id, id));
    if (!updated) {
      throw new Error(`Updated record ${id} was not found`);
    }

    return updated;
  }

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
    return this.insertAndFetch(users, user);
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User> {
    return this.updateAndFetch(users, id, data);
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
    return this.insertAndFetch(branches, branch);
  }

  async updateBranch(id: number, data: Partial<InsertBranch>): Promise<Branch> {
    return this.updateAndFetch(branches, id, data);
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
        primaryPackageId: members.primaryPackageId,
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
        primaryPackageName: packages.name,
        primaryPackageTier: packages.tier,
        primaryPackageCycle: packages.billingCycle,
      })
      .from(members)
      .leftJoin(users, eq(members.userId, users.id))
      .leftJoin(branches, eq(members.branchId, branches.id))
      .leftJoin(packages, eq(members.primaryPackageId, packages.id));

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
        primaryPackageId: members.primaryPackageId,
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
        primaryPackageName: packages.name,
        primaryPackageTier: packages.tier,
        primaryPackageCycle: packages.billingCycle,
      })
      .from(members)
      .leftJoin(users, eq(members.userId, users.id))
      .leftJoin(branches, eq(members.branchId, branches.id))
      .leftJoin(packages, eq(members.primaryPackageId, packages.id))
      .where(eq(members.id, id));
    return member;
  }

  async getMemberByUserId(userId: number): Promise<Member | undefined> {
    const [member] = await db.select().from(members).where(eq(members.userId, userId));
    return member;
  }

  async createMember(member: InsertMember): Promise<Member> {
    return this.insertAndFetch(members, member);
  }

  async updateMember(id: number, data: Partial<InsertMember>): Promise<Member> {
    return this.updateAndFetch(members, id, data);
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
    return this.insertAndFetch(coaches, coach);
  }

  async updateCoach(id: number, data: Partial<InsertCoach>): Promise<Coach> {
    return this.updateAndFetch(coaches, id, data);
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
    return this.insertAndFetch(packages, pkg);
  }

  async updatePackage(id: number, data: Partial<InsertPackage>): Promise<Package> {
    return this.updateAndFetch(packages, id, data);
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
        packageTier: packages.tier,
        billingCycle: packages.billingCycle,
        gymAccessHours: packages.gymAccessHours,
        coachHours: packages.coachHours,
        dietitianHours: packages.dietitianHours,
        allowsAllBranches: packages.allowsAllBranches,
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
    return this.insertAndFetch(subscriptions, sub);
  }

  async updateSubscription(id: number, data: Partial<InsertSubscription>): Promise<Subscription> {
    return this.updateAndFetch(subscriptions, id, data);
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
    return this.insertAndFetch(classes, cls);
  }

  async updateClass(id: number, data: Partial<InsertClass>): Promise<Class> {
    return this.updateAndFetch(classes, id, data);
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
    return this.insertAndFetch(classBookings, booking);
  }

  async updateClassBooking(id: number, data: Partial<InsertClassBooking>): Promise<ClassBooking> {
    return this.updateAndFetch(classBookings, id, data);
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
    return this.insertAndFetch(payments, payment);
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
    return this.insertAndFetch(attendance, rec);
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
    return this.insertAndFetch(products, product);
  }

  async updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product> {
    return this.updateAndFetch(products, id, data);
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
    const created = await this.insertAndFetch(orders, order);
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
    return this.insertAndFetch(leads, lead);
  }

  async updateLead(id: number, data: Partial<InsertLead>): Promise<Lead> {
    return this.updateAndFetch(leads, id, data);
  }

  async deleteLead(id: number): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  async getLeadTasks(leadId: number): Promise<LeadTask[]> {
    return db.select().from(leadTasks).where(eq(leadTasks.leadId, leadId)).orderBy(desc(leadTasks.createdAt));
  }

  async createLeadTask(task: InsertLeadTask): Promise<LeadTask> {
    return this.insertAndFetch(leadTasks, task);
  }

  async updateLeadTask(id: number, data: Partial<InsertLeadTask>): Promise<LeadTask> {
    return this.updateAndFetch(leadTasks, id, data);
  }

  // === DIET PLANS ===
  async getDietPlans(memberId?: number): Promise<DietPlan[]> {
    if (memberId) {
      return db.select().from(dietPlans).where(eq(dietPlans.memberId, memberId)).orderBy(desc(dietPlans.createdAt));
    }
    return db.select().from(dietPlans).orderBy(desc(dietPlans.createdAt));
  }

  async createDietPlan(plan: InsertDietPlan): Promise<DietPlan> {
    return this.insertAndFetch(dietPlans, plan);
  }

  async updateDietPlan(id: number, data: Partial<InsertDietPlan>): Promise<DietPlan> {
    return this.updateAndFetch(dietPlans, id, data);
  }

  // === CONTACT MESSAGES ===
  async getContactMessages(): Promise<ContactMessage[]> {
    return db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async createContactMessage(msg: InsertContactMessage): Promise<ContactMessage> {
    return this.insertAndFetch(contactMessages, msg);
  }

  async updateContactMessage(id: number, status: string): Promise<ContactMessage> {
    return this.updateAndFetch(contactMessages, id, { status: status as any });
  }

  // === NEWSLETTER ===
  async subscribeNewsletter(email: string): Promise<void> {
    await db.insert(newsletterSubscribers).values({ email }).onDuplicateKeyUpdate({
      set: { email },
    });
  }

  // === DASHBOARD STATS ===
  async getDashboardStats(branchId?: number): Promise<any> {
    const memberFilter = branchId ? eq(members.branchId, branchId) : undefined;
    const classFilter = branchId ? eq(classes.branchId, branchId) : undefined;
    const paymentFilter = branchId ? eq(payments.branchId, branchId) : undefined;

    const [memberCount] = await db.select({ count: sql<number>`count(*)` }).from(members).where(memberFilter);
    const [coachCount] = await db.select({ count: sql<number>`count(*)` }).from(coaches).where(branchId ? eq(coaches.branchId, branchId) : undefined);
    const [classCount] = await db.select({ count: sql<number>`count(*)` }).from(classes).where(classFilter);
    const [paymentSum] = await db.select({ total: sql<number>`coalesce(sum(amount), 0)` }).from(payments).where(paymentFilter);
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
