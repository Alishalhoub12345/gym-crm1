import { db } from "./db";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("Dropping old tables...");
  await db.execute(sql`
    DROP TABLE IF EXISTS order_items CASCADE;
    DROP TABLE IF EXISTS orders CASCADE;
    DROP TABLE IF EXISTS cart_items CASCADE;
    DROP TABLE IF EXISTS carts CASCADE;
    DROP TABLE IF EXISTS contact_messages CASCADE;
    DROP TABLE IF EXISTS cars CASCADE;
    DROP TABLE IF EXISTS brands CASCADE;
    DROP TABLE IF EXISTS categories CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);
  console.log("Old tables dropped. Ready for db:push.");
  process.exit(0);
}

migrate().catch(console.error);
