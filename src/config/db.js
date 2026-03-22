import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.ts";

// Remove only Prisma-specific params (e.g., schema=public), keep SSL params for Neon
const dbUrl = new URL(process.env.DATABASE_URL);
dbUrl.searchParams.delete("schema");
const connectionString = dbUrl.toString();
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export default prisma;
