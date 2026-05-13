import { MongoClient } from "mongodb";
import { hash } from "bcryptjs";
import type { AdminUser, Post } from "./models";
import { COLLECTIONS } from "./models";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/admin-panel";

async function seed() {
  console.log("🌱 Seeding database...");

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();

  // ── Seed Admin User ──────────────────────────────────────────
  const usersCol = db.collection<AdminUser>(COLLECTIONS.ADMIN_USERS);
  const existingAdmin = await usersCol.findOne({ email: "admin@admin.com" });

  if (!existingAdmin) {
    const hashedPassword = await hash("admin123", 12);
    await usersCol.insertOne({
      name: "Admin",
      email: "admin@admin.com",
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ Admin user created (admin@admin.com / admin123)");
  } else {
    console.log("ℹ️  Admin user already exists");
  }

  // ── Seed Sample Users ────────────────────────────────────────
  const sampleUsers: Omit<AdminUser, "_id">[] = [
    {
      name: "Jane Cooper",
      email: "jane@example.com",
      password: await hash("password123", 12),
      role: "editor",
      createdAt: new Date("2025-12-01"),
      updatedAt: new Date("2025-12-01"),
    },
    {
      name: "Alex Johnson",
      email: "alex@example.com",
      password: await hash("password123", 12),
      role: "editor",
      createdAt: new Date("2026-01-15"),
      updatedAt: new Date("2026-01-15"),
    },
    {
      name: "Sarah Miller",
      email: "sarah@example.com",
      password: await hash("password123", 12),
      role: "admin",
      createdAt: new Date("2026-02-20"),
      updatedAt: new Date("2026-02-20"),
    },
  ];

  for (const user of sampleUsers) {
    const exists = await usersCol.findOne({ email: user.email });
    if (!exists) {
      await usersCol.insertOne(user);
      console.log(`✅ User "${user.name}" created`);
    }
  }

  // ── Seed Sample Posts ────────────────────────────────────────
  const postsCol = db.collection<Post>(COLLECTIONS.POSTS);
  const postCount = await postsCol.countDocuments();

  if (postCount === 0) {
    const samplePosts: Omit<Post, "_id">[] = [
      {
        title: "Getting Started with Next.js 16",
        slug: "getting-started-nextjs-16",
        content:
          "Next.js 16 brings exciting new features including the proxy file convention, improved streaming, and better server component support.",
        excerpt: "Learn about the new features in Next.js 16",
        status: "published",
        author: "Admin",
        authorId: "admin",
        tags: ["nextjs", "react", "tutorial"],
        createdAt: new Date("2026-03-01"),
        updatedAt: new Date("2026-03-01"),
      },
      {
        title: "MongoDB Best Practices for Node.js",
        slug: "mongodb-best-practices-nodejs",
        content:
          "When working with MongoDB in Node.js, connection pooling, proper indexing, and schema design are crucial for performance.",
        excerpt: "Optimize your MongoDB setup for Node.js applications",
        status: "published",
        author: "Jane Cooper",
        authorId: "jane",
        tags: ["mongodb", "nodejs", "database"],
        createdAt: new Date("2026-03-15"),
        updatedAt: new Date("2026-03-15"),
      },
      {
        title: "Building Admin Panels with SSR",
        slug: "admin-panels-ssr",
        content:
          "Server-side rendering provides better SEO, faster initial page loads, and improved security for admin panels.",
        excerpt: "Why SSR is perfect for admin dashboards",
        status: "draft",
        author: "Alex Johnson",
        authorId: "alex",
        tags: ["ssr", "admin", "nextjs"],
        createdAt: new Date("2026-04-10"),
        updatedAt: new Date("2026-04-10"),
      },
      {
        title: "TypeScript Tips for Full-Stack Development",
        slug: "typescript-fullstack-tips",
        content:
          "Type-safe APIs, shared models between client and server, and proper error handling patterns.",
        excerpt: "Level up your TypeScript game across the stack",
        status: "published",
        author: "Sarah Miller",
        authorId: "sarah",
        tags: ["typescript", "fullstack", "tips"],
        createdAt: new Date("2026-04-25"),
        updatedAt: new Date("2026-04-25"),
      },
      {
        title: "Authentication Patterns in Modern Web Apps",
        slug: "auth-patterns-modern-web",
        content:
          "JWT tokens, session cookies, OAuth flows — understanding when to use what authentication pattern.",
        excerpt: "Choose the right auth strategy for your app",
        status: "draft",
        author: "Admin",
        authorId: "admin",
        tags: ["auth", "security", "jwt"],
        createdAt: new Date("2026-05-05"),
        updatedAt: new Date("2026-05-05"),
      },
    ];

    await postsCol.insertMany(samplePosts);
    console.log(`✅ ${samplePosts.length} sample posts created`);
  } else {
    console.log("ℹ️  Posts already exist");
  }

  // ── Create indexes ───────────────────────────────────────────
  await usersCol.createIndex({ email: 1 }, { unique: true });
  await postsCol.createIndex({ slug: 1 }, { unique: true });
  await postsCol.createIndex({ status: 1 });
  await postsCol.createIndex({ createdAt: -1 });
  console.log("✅ Indexes created");

  await client.close();
  console.log("🎉 Seeding complete!");
}

seed().catch(console.error);
