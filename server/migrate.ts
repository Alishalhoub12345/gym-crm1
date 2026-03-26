import { db } from "./db";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("Dropping old tables...");
  await db.execute(sql`
    DROP TABLE IF EXISTS order_items;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS cart_items;
    DROP TABLE IF EXISTS carts;
    DROP TABLE IF EXISTS contact_messages;
    DROP TABLE IF EXISTS cars;
    DROP TABLE IF EXISTS brands;
    DROP TABLE IF EXISTS categories;
    DROP TABLE IF EXISTS users;
  `);
  console.log("Old tables dropped. Ready for db:push.");
  process.exit(0);
}

migrate().catch(console.error);
