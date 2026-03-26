import { db } from "./db";
import { users, branches } from "@shared/schema";
import { hashPassword } from "./auth";
import { eq, inArray } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  const ownerEmail = "alishalhoub444@gmail.com";
  const ownerPassword = "123Ali123$";

  const createdBranchIds = await db.insert(branches).values([
    {
      name: "Start Living Right Gym - Broumana",
      location: "Broumana Main Street, Lebanon",
      phone: "76 446 496",
      email: "broumana@startlivingright.com",
      status: "active",
    },
    {
      name: "Start Living Right Gym - El Abyad",
      location: "El Abyad Center, Sea Side Rd, Lebanon",
      phone: "76 496 999",
      email: "elabyad@startlivingright.com",
      status: "active",
    },
  ]).$returningId();

  const createdBranches = await db
    .select()
    .from(branches)
    .where(inArray(branches.id, createdBranchIds.map((branch) => branch.id)));

  console.log("Created branches:", createdBranches.map((branch) => branch.name).join(", "));

  const ownerHash = await hashPassword(ownerPassword);
  const [{ id: ownerId }] = await db.insert(users).values({
    name: "System Owner",
    email: ownerEmail,
    password: ownerHash,
    role: "owner",
    branchId: null,
    phone: "+1-555-0001",
    status: "active",
  }).$returningId();

  const [owner] = await db.select().from(users).where(eq(users.id, ownerId));

  console.log("Created owner:", owner.email);
  console.log("\nLogin credentials:");
  console.log(`  Email:    ${ownerEmail}`);
  console.log(`  Password: ${ownerPassword}`);
  console.log("\nSeeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
