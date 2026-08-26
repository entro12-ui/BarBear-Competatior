#!/usr/bin/env node
import { readFileSync } from "fs";
import { resolve } from "path";
import bcrypt from "bcryptjs";
import pg from "pg";

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://barbear:barbear@127.0.0.1:55432/barbear";

const adminEmail = process.env.ADMIN_EMAIL || "admin@barbear.com";
const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

function needsSsl(connectionString) {
  try {
    const host = new URL(connectionString).hostname;
    return host !== "localhost" && host !== "127.0.0.1";
  } catch {
    return true;
  }
}

async function main() {
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: needsSsl(databaseUrl) ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();

  const schema = readFileSync(resolve("db/schema.sql"), "utf8");
  await client.query(schema);

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await client.query(
    `insert into profiles (email, password_hash, full_name, role)
     values ($1, $2, $3, 'admin')
     on conflict (email) do update
       set password_hash = excluded.password_hash,
           role = 'admin',
           full_name = excluded.full_name`,
    [adminEmail, passwordHash, "Barbear Admin"]
  );

  await client.query(
    `insert into competitions (
       name, slug, description, rules, location, start_date, end_date, status, public_results
     ) values (
       'Best Barber Hair Style Competition 2026',
       'best-barber-2026',
       'Vote for the barber who created the most creative and professional hair style.',
       $1,
       'Addis Ababa, Ethiopia',
       now(),
       now() + interval '14 days',
       'active',
       false
     )
     on conflict (slug) do nothing`,
    [
      "Each person can vote only once.\nOne vote is allowed per number.\nYou must select only one competitor.\nMultiple votes using the same number are not allowed.\nAdmin can close voting when the competition ends.",
    ]
  );

  await client.end();

  console.log("Database ready.");
  console.log(`Admin email: ${adminEmail}`);
  console.log(`Admin password: ${adminPassword}`);
  console.log(`Host: ${new URL(databaseUrl).hostname}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
