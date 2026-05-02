import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma ORM v7 reads datasource configuration from this file.
    // For CLI tasks (db pull, migrate, db push), prefer DIRECT_URL and
    // fall back to DATABASE_URL if DIRECT_URL is not provided.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
