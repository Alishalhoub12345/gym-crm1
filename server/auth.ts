import jwt from "jsonwebtoken";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import type { Request, Response, NextFunction } from "express";

const scryptAsync = promisify(scrypt);

const JWT_SECRET = process.env.SESSION_SECRET || "gym-crm-jwt-secret-key";
const JWT_EXPIRES_IN = "7d";

export function hasStrongPasswordRules(password: string): boolean {
  return /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
}

export function getPasswordRuleMessage(): string {
  return "Password must include at least one uppercase letter, one number, and one special character";
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [hashedPassword, salt] = hash.split(".");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  try {
    return timingSafeEqual(Buffer.from(hashedPassword, "hex"), buf);
  } catch {
    return false;
  }
}

export function generateToken(user: { id: number; email: string; role: string; branchId?: number | null }): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, branchId: user.branchId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
  (req as any).user = decoded;
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
}

export function requireBranchAccess(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ message: "Authentication required" });
  if (user.role === "owner") return next();
  const branchId = parseInt(req.params.branchId || req.query.branchId as string || req.body.branchId);
  if (branchId && user.branchId !== branchId) {
    return res.status(403).json({ message: "Access denied to this branch" });
  }
  next();
}
