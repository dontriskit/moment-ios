import "dotenv/config";
import { sql } from "drizzle-orm";
import { db } from "@/server/db";

async function addCategoryFields() {
  try {
    console.log("Adding color and icon fields to categories table...");
    
    // Add color column
    await db.execute(sql`
      ALTER TABLE "ulepszenia-com_category" 
      ADD COLUMN IF NOT EXISTS "color" varchar(7) DEFAULT '#3B82F6' NOT NULL
    `);
    
    // Add icon column
    await db.execute(sql`
      ALTER TABLE "ulepszenia-com_category" 
      ADD COLUMN IF NOT EXISTS "icon" varchar(50)
    `);
    
    console.log("✅ Successfully added color and icon fields to categories table");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding fields:", error);
    process.exit(1);
  }
}

addCategoryFields();