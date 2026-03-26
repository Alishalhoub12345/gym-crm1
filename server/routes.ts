import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { authenticate, requireRole, generateToken, hashPassword, verifyPassword, hasStrongPasswordRules, getPasswordRuleMessage } from "./auth";
import { z } from "zod";

function addDays(dateInput: string | Date, days: number) {
  const date = new Date(dateInput);
  date.setDate(date.getDate() + days);
  return date;
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // === AUTH ===
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
      const user = await storage.getUserByEmail(email);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      const valid = await verifyPassword(password, user.password);
      if (!valid) return res.status(401).json({ message: "Invalid credentials" });
      if (user.status !== "active") return res.status(403).json({ message: "Account is not active" });
      const token = generateToken(user);
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, branchId: user.branchId } });
    } catch (err) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticate, async (req: any, res) => {
    const user = await storage.getUser(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, branchId: user.branchId, status: user.status });
  });

  // === BRANCHES ===
  app.get("/api/branches", authenticate, async (req: any, res) => {
    const branches = await storage.getBranches();
    res.json(branches);
  });

  app.get("/api/branches/:id", authenticate, async (req, res) => {
    const branch = await storage.getBranch(parseInt(req.params.id));
    if (!branch) return res.status(404).json({ message: "Branch not found" });
    res.json(branch);
  });

  app.post("/api/branches", authenticate, requireRole("owner"), async (req, res) => {
    try {
      const branch = await storage.createBranch(req.body);
      res.status(201).json(branch);
    } catch (err) {
      res.status(400).json({ message: "Failed to create branch" });
    }
  });

  app.put("/api/branches/:id", authenticate, requireRole("owner"), async (req, res) => {
    try {
      const branch = await storage.updateBranch(parseInt(req.params.id), req.body);
      res.json(branch);
    } catch (err) {
      res.status(400).json({ message: "Failed to update branch" });
    }
  });

  app.delete("/api/branches/:id", authenticate, requireRole("owner"), async (req, res) => {
    await storage.deleteBranch(parseInt(req.params.id));
    res.status(204).send();
  });

  // === USERS ===
  app.get("/api/users", authenticate, requireRole("owner", "admin"), async (req: any, res) => {
    const branchId = req.user.role === "owner" ? undefined : req.user.branchId;
    const users = await storage.getUsers(branchId);
    res.json(users);
  });

  app.post("/api/users", authenticate, requireRole("owner", "admin"), async (req: any, res) => {
    try {
      const { password, ...rest } = req.body;
      const existing = await storage.getUserByEmail(rest.email);
      if (existing) return res.status(400).json({ message: "Email already in use" });
      const rawPassword = password || "GymCRM@2024";
      if (!hasStrongPasswordRules(rawPassword)) return res.status(400).json({ message: getPasswordRuleMessage() });
      const hashed = await hashPassword(rawPassword);
      const user = await storage.createUser({ ...rest, password: hashed });
      res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, branchId: user.branchId });
    } catch (err) {
      res.status(400).json({ message: "Failed to create user" });
    }
  });

  app.put("/api/users/:id", authenticate, requireRole("owner", "admin"), async (req, res) => {
    try {
      const data = { ...req.body };
      if (data.password) {
        if (!hasStrongPasswordRules(data.password)) return res.status(400).json({ message: getPasswordRuleMessage() });
        data.password = await hashPassword(data.password);
      }
      const user = await storage.updateUser(parseInt(req.params.id), data);
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role, branchId: user.branchId });
    } catch (err) {
      res.status(400).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", authenticate, requireRole("owner"), async (req, res) => {
    await storage.deleteUser(parseInt(req.params.id));
    res.status(204).send();
  });

  // === MEMBERS ===
  app.get("/api/members", authenticate, async (req: any, res) => {
    const branchId = req.user.role === "owner" ? undefined : req.user.branchId;
    const result = await storage.getMembers(branchId);
    res.json(result);
  });

  app.get("/api/members/:id", authenticate, async (req, res) => {
    const member = await storage.getMember(parseInt(req.params.id));
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.json(member);
  });

  app.post("/api/members", authenticate, requireRole("owner", "admin"), async (req: any, res) => {
    try {
      const { email, name, phone, password, packageId, ...memberData } = req.body;
      const existing = await storage.getUserByEmail(email);
      if (existing) return res.status(400).json({ message: "Email already in use" });
      if (!packageId) return res.status(400).json({ message: "A main package is required for every member" });
      const pkg = await storage.getPackage(parseInt(packageId));
      if (!pkg || pkg.status !== "active") return res.status(400).json({ message: "Selected package is not available" });
      if (!pkg.allowsAllBranches && pkg.branchId && pkg.branchId !== memberData.branchId) {
        return res.status(400).json({ message: "Selected package does not belong to the chosen branch" });
      }
      const rawPassword = password || "Member@2024";
      if (!hasStrongPasswordRules(rawPassword)) return res.status(400).json({ message: getPasswordRuleMessage() });
      const hashed = await hashPassword(rawPassword);
      const user = await storage.createUser({ name, email, phone, password: hashed, role: "member", branchId: memberData.branchId, status: "active" });
      const member = await storage.createMember({ ...memberData, userId: user.id, primaryPackageId: pkg.id });
      const startDate = memberData.joinDate ? new Date(memberData.joinDate) : new Date();
      await storage.createSubscription({
        memberId: member.id,
        packageId: pkg.id,
        startDate,
        endDate: addDays(startDate, Math.max(pkg.durationDays - 1, 0)),
        remainingClasses: pkg.totalClasses,
        status: "active",
      });
      res.status(201).json({ ...member, userName: name, userEmail: email });
    } catch (err) {
      res.status(400).json({ message: "Failed to create member" });
    }
  });

  app.put("/api/members/:id", authenticate, requireRole("owner", "admin"), async (req, res) => {
    try {
      const { email, name, phone, ...memberData } = req.body;
      const member = await storage.updateMember(parseInt(req.params.id), memberData);
      res.json(member);
    } catch (err) {
      res.status(400).json({ message: "Failed to update member" });
    }
  });

  app.delete("/api/members/:id", authenticate, requireRole("owner", "admin"), async (req, res) => {
    await storage.deleteMember(parseInt(req.params.id));
    res.status(204).send();
  });

  // === COACHES ===
  app.get("/api/coaches", authenticate, async (req: any, res) => {
    const branchId = req.user.role === "owner" ? undefined : req.user.branchId;
    const result = await storage.getCoaches(branchId);
    res.json(result);
  });

  app.get("/api/coaches/:id", authenticate, async (req, res) => {
    const coach = await storage.getCoach(parseInt(req.params.id));
    if (!coach) return res.status(404).json({ message: "Coach not found" });
    res.json(coach);
  });

  app.post("/api/coaches", authenticate, requireRole("owner", "admin"), async (req: any, res) => {
    try {
      const { email, name, phone, password, ...coachData } = req.body;
      const existing = await storage.getUserByEmail(email);
      if (existing) return res.status(400).json({ message: "Email already in use" });
      const rawPassword = password || "Coach@2024";
      if (!hasStrongPasswordRules(rawPassword)) return res.status(400).json({ message: getPasswordRuleMessage() });
      const hashed = await hashPassword(rawPassword);
      const user = await storage.createUser({ name, email, phone, password: hashed, role: "coach", branchId: coachData.branchId, status: "active" });
      const coach = await storage.createCoach({ ...coachData, userId: user.id });
      res.status(201).json({ ...coach, userName: name, userEmail: email });
    } catch (err) {
      res.status(400).json({ message: "Failed to create coach" });
    }
  });

  app.put("/api/coaches/:id", authenticate, requireRole("owner", "admin"), async (req, res) => {
    try {
      const coach = await storage.updateCoach(parseInt(req.params.id), req.body);
      res.json(coach);
    } catch (err) {
      res.status(400).json({ message: "Failed to update coach" });
    }
  });

  app.delete("/api/coaches/:id", authenticate, requireRole("owner", "admin"), async (req, res) => {
    await storage.deleteCoach(parseInt(req.params.id));
    res.status(204).send();
  });

  // === PACKAGES ===
  app.get("/api/packages", authenticate, async (req: any, res) => {
    const branchId = req.user.role === "owner" ? undefined : req.user.branchId;
    const result = await storage.getPackages(branchId);
    res.json(result);
  });

  app.post("/api/packages", authenticate, requireRole("owner", "admin"), async (req, res) => {
    try {
      const pkg = await storage.createPackage(req.body);
      res.status(201).json(pkg);
    } catch (err) {
      res.status(400).json({ message: "Failed to create package" });
    }
  });

  app.put("/api/packages/:id", authenticate, requireRole("owner", "admin"), async (req, res) => {
    try {
      const pkg = await storage.updatePackage(parseInt(req.params.id), req.body);
      res.json(pkg);
    } catch (err) {
      res.status(400).json({ message: "Failed to update package" });
    }
  });

  app.delete("/api/packages/:id", authenticate, requireRole("owner"), async (req, res) => {
    await storage.deletePackage(parseInt(req.params.id));
    res.status(204).send();
  });

  // === SUBSCRIPTIONS ===
  app.get("/api/subscriptions", authenticate, async (req: any, res) => {
    const memberId = req.query.memberId ? parseInt(req.query.memberId as string) : undefined;
    const result = await storage.getSubscriptions(memberId);
    res.json(result);
  });

  app.post("/api/subscriptions", authenticate, requireRole("owner", "admin"), async (req, res) => {
    try {
      const sub = await storage.createSubscription(req.body);
      res.status(201).json(sub);
    } catch (err) {
      res.status(400).json({ message: "Failed to create subscription" });
    }
  });

  app.put("/api/subscriptions/:id", authenticate, requireRole("owner", "admin"), async (req, res) => {
    try {
      const sub = await storage.updateSubscription(parseInt(req.params.id), req.body);
      res.json(sub);
    } catch (err) {
      res.status(400).json({ message: "Failed to update subscription" });
    }
  });

  // === CLASSES ===
  app.get("/api/classes", authenticate, async (req: any, res) => {
    const branchId = req.user.role === "owner" ? undefined : req.user.branchId;
    const result = await storage.getClasses(branchId);
    res.json(result);
  });

  app.get("/api/classes/:id", authenticate, async (req, res) => {
    const cls = await storage.getClass(parseInt(req.params.id));
    if (!cls) return res.status(404).json({ message: "Class not found" });
    res.json(cls);
  });

  app.post("/api/classes", authenticate, requireRole("owner", "admin"), async (req, res) => {
    try {
      const cls = await storage.createClass(req.body);
      res.status(201).json(cls);
    } catch (err) {
      res.status(400).json({ message: "Failed to create class" });
    }
  });

  app.put("/api/classes/:id", authenticate, requireRole("owner", "admin"), async (req, res) => {
    try {
      const cls = await storage.updateClass(parseInt(req.params.id), req.body);
      res.json(cls);
    } catch (err) {
      res.status(400).json({ message: "Failed to update class" });
    }
  });

  app.delete("/api/classes/:id", authenticate, requireRole("owner", "admin"), async (req, res) => {
    await storage.deleteClass(parseInt(req.params.id));
    res.status(204).send();
  });

  // === CLASS BOOKINGS ===
  app.get("/api/bookings", authenticate, async (req: any, res) => {
    const classId = req.query.classId ? parseInt(req.query.classId as string) : undefined;
    const memberId = req.query.memberId ? parseInt(req.query.memberId as string) : undefined;
    const result = await storage.getClassBookings(classId, memberId);
    res.json(result);
  });

  app.post("/api/bookings", authenticate, async (req: any, res) => {
    try {
      const booking = await storage.createClassBooking(req.body);
      res.status(201).json(booking);
    } catch (err) {
      res.status(400).json({ message: "Failed to create booking" });
    }
  });

  app.put("/api/bookings/:id", authenticate, async (req, res) => {
    try {
      const booking = await storage.updateClassBooking(parseInt(req.params.id), req.body);
      res.json(booking);
    } catch (err) {
      res.status(400).json({ message: "Failed to update booking" });
    }
  });

  // === PAYMENTS ===
  app.get("/api/payments", authenticate, async (req: any, res) => {
    const branchId = req.user.role === "owner" ? undefined : req.user.branchId;
    const memberId = req.query.memberId ? parseInt(req.query.memberId as string) : undefined;
    const result = await storage.getPayments(branchId, memberId);
    res.json(result);
  });

  app.post("/api/payments", authenticate, requireRole("owner", "admin"), async (req, res) => {
    try {
      const payment = await storage.createPayment(req.body);
      res.status(201).json(payment);
    } catch (err) {
      res.status(400).json({ message: "Failed to create payment" });
    }
  });

  // === ATTENDANCE ===
  app.get("/api/attendance", authenticate, async (req: any, res) => {
    const branchId = req.user.role === "owner" ? undefined : req.user.branchId;
    const memberId = req.query.memberId ? parseInt(req.query.memberId as string) : undefined;
    const result = await storage.getAttendance(branchId, memberId);
    res.json(result);
  });

  app.post("/api/attendance", authenticate, requireRole("owner", "admin", "coach"), async (req, res) => {
    try {
      const rec = await storage.createAttendance(req.body);
      res.status(201).json(rec);
    } catch (err) {
      res.status(400).json({ message: "Failed to record attendance" });
    }
  });

  // === PRODUCTS ===
  app.get("/api/products", authenticate, async (req: any, res) => {
    const branchId = req.user.role === "owner" ? undefined : req.user.branchId;
    const result = await storage.getProducts(branchId);
    res.json(result);
  });

  app.post("/api/products", authenticate, requireRole("owner", "admin"), async (req, res) => {
    try {
      const product = await storage.createProduct(req.body);
      res.status(201).json(product);
    } catch (err) {
      res.status(400).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", authenticate, requireRole("owner", "admin"), async (req, res) => {
    try {
      const product = await storage.updateProduct(parseInt(req.params.id), req.body);
      res.json(product);
    } catch (err) {
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", authenticate, requireRole("owner", "admin"), async (req, res) => {
    await storage.deleteProduct(parseInt(req.params.id));
    res.status(204).send();
  });

  // === ORDERS ===
  app.get("/api/orders", authenticate, async (req: any, res) => {
    const branchId = req.user.role === "owner" ? undefined : req.user.branchId;
    const result = await storage.getOrders(branchId);
    res.json(result);
  });

  app.post("/api/orders", authenticate, async (req: any, res) => {
    try {
      const { items, ...orderData } = req.body;
      const order = await storage.createOrder(orderData, items || []);
      res.status(201).json(order);
    } catch (err) {
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  // === LEADS ===
  app.get("/api/leads", authenticate, requireRole("owner", "admin"), async (req: any, res) => {
    const branchId = req.user.role === "owner" ? undefined : req.user.branchId;
    const result = await storage.getLeads(branchId);
    res.json(result);
  });

  app.post("/api/leads", authenticate, requireRole("owner", "admin"), async (req: any, res) => {
    try {
      const lead = await storage.createLead(req.body);
      res.status(201).json(lead);
    } catch (err) {
      res.status(400).json({ message: "Failed to create lead" });
    }
  });

  app.put("/api/leads/:id", authenticate, requireRole("owner", "admin"), async (req, res) => {
    try {
      const lead = await storage.updateLead(parseInt(req.params.id), req.body);
      res.json(lead);
    } catch (err) {
      res.status(400).json({ message: "Failed to update lead" });
    }
  });

  app.delete("/api/leads/:id", authenticate, requireRole("owner", "admin"), async (req, res) => {
    await storage.deleteLead(parseInt(req.params.id));
    res.status(204).send();
  });

  app.get("/api/leads/:id/tasks", authenticate, requireRole("owner", "admin"), async (req, res) => {
    const tasks = await storage.getLeadTasks(parseInt(req.params.id));
    res.json(tasks);
  });

  app.post("/api/leads/:id/tasks", authenticate, requireRole("owner", "admin"), async (req, res) => {
    try {
      const task = await storage.createLeadTask({ ...req.body, leadId: parseInt(req.params.id) });
      res.status(201).json(task);
    } catch (err) {
      res.status(400).json({ message: "Failed to create task" });
    }
  });

  app.put("/api/lead-tasks/:id", authenticate, requireRole("owner", "admin"), async (req, res) => {
    try {
      const task = await storage.updateLeadTask(parseInt(req.params.id), req.body);
      res.json(task);
    } catch (err) {
      res.status(400).json({ message: "Failed to update task" });
    }
  });

  // === DIET PLANS ===
  app.get("/api/diet-plans", authenticate, async (req: any, res) => {
    const memberId = req.query.memberId ? parseInt(req.query.memberId as string) : undefined;
    const result = await storage.getDietPlans(memberId);
    res.json(result);
  });

  app.post("/api/diet-plans", authenticate, requireRole("owner", "admin", "dietitian"), async (req: any, res) => {
    try {
      const plan = await storage.createDietPlan({ ...req.body, dietitianId: req.user.id });
      res.status(201).json(plan);
    } catch (err) {
      res.status(400).json({ message: "Failed to create diet plan" });
    }
  });

  app.put("/api/diet-plans/:id", authenticate, requireRole("owner", "admin", "dietitian"), async (req, res) => {
    try {
      const plan = await storage.updateDietPlan(parseInt(req.params.id), req.body);
      res.json(plan);
    } catch (err) {
      res.status(400).json({ message: "Failed to update diet plan" });
    }
  });

  // === CONTACT MESSAGES ===
  app.get("/api/contact-messages", authenticate, requireRole("owner", "admin"), async (req, res) => {
    const messages = await storage.getContactMessages();
    res.json(messages);
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const msg = await storage.createContactMessage(req.body);
      res.status(201).json(msg);
    } catch (err) {
      res.status(400).json({ message: "Failed to submit message" });
    }
  });

  app.put("/api/contact-messages/:id", authenticate, requireRole("owner", "admin"), async (req, res) => {
    const msg = await storage.updateContactMessage(parseInt(req.params.id), req.body.status);
    res.json(msg);
  });

  // === NEWSLETTER ===
  app.post("/api/newsletter", async (req, res) => {
    try {
      await storage.subscribeNewsletter(req.body.email);
      res.status(201).json({ message: "Subscribed successfully" });
    } catch (err) {
      res.status(400).json({ message: "Failed to subscribe" });
    }
  });

  // === DASHBOARD ===
  app.get("/api/dashboard/stats", authenticate, requireRole("owner", "admin"), async (req: any, res) => {
    const branchId = req.user.role === "owner" ? undefined : req.user.branchId;
    const stats = await storage.getDashboardStats(branchId);
    res.json(stats);
  });

  return httpServer;
}
