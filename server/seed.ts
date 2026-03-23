import { db } from "./db";
import { users, branches } from "@shared/schema";
import { hashPassword } from "./auth";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  const [branch] = await db.insert(branches).values({
    name: "Main Branch",
    location: "123 Fitness Ave, City",
    phone: "+1-555-0100",
    email: "main@gymcrm.com",
    status: "active",
  }).returning();

  console.log("Created branch:", branch.name);

  const ownerHash = await hashPassword("Owner@2024!");
  const [owner] = await db.insert(users).values({
    name: "System Owner",
    email: "owner@gymcrm.com",
    password: ownerHash,
    role: "owner",
    branchId: null,
    phone: "+1-555-0001",
    status: "active",
  }).returning();

  console.log("Created owner:", owner.email);
  console.log("\nLogin credentials:");
  console.log("  Email:    owner@gymcrm.com");
  console.log("  Password: Owner@2024!");
  console.log("\nSeeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
