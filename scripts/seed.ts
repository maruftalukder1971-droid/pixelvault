import * as fs from "fs";
import * as path from "path";

// Manually parse .env.local into process.env
const envPath = path.resolve(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  console.error("ERROR: .env.local not found at", envPath);
  process.exit(1);
}
const envContent = fs.readFileSync(envPath, "utf8");
for (const line of envContent.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  if (!process.env[key]) process.env[key] = value;
}

console.log("Loaded env. MONGODB_URI present:", !!process.env.MONGODB_URI);

async function main() {
  const { connectDB } = await import("../lib/mongodb");
  const { Category } = await import("../models/Category");

  const categories = [
    { name: "Nature", slug: "nature", color: "#10b981" },
    { name: "Anime", slug: "anime", color: "#ec4899" },
    { name: "Cars", slug: "cars", color: "#ef4444" },
    { name: "Tech", slug: "tech", color: "#3b82f6" },
    { name: "PUBG", slug: "pubg", color: "#f59e0b" },
    { name: "Space", slug: "space", color: "#8b5cf6" },
    { name: "Abstract", slug: "abstract", color: "#06b6d4" },
    { name: "Cyberpunk", slug: "cyberpunk", color: "#d946ef" }
  ];

  await connectDB();
  await Category.deleteMany({});
  await Category.insertMany(categories);
  console.log(`Seeded ${categories.length} categories`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});