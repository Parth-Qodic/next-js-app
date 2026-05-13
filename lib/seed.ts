import { hash } from "bcryptjs";
import { connectToDatabase } from "./mongodb";
import { AdminUser, Post } from "./models";

async function seed() {
  console.log("🌱 Seeding database...");

  await connectToDatabase();

  // ── Seed Admin User ──────────────────────────────────────────
  const existingAdmin = await AdminUser.findOne({ email: "admin@admin.com" });

  if (!existingAdmin) {
    const hashedPassword = await hash("admin123", 12);
    await AdminUser.create({
      name: "Admin",
      email: "admin@admin.com",
      password: hashedPassword,
      role: "admin",
    });
    console.log("✅ Admin user created (admin@admin.com / admin123)");
  } else {
    console.log("ℹ️  Admin user already exists");
  }

  // ── Seed Sample Users ────────────────────────────────────────
  const sampleUsers = [
    {
      name: "Jane Cooper",
      email: "jane@example.com",
      password: await hash("password123", 12),
      role: "editor",
    },
    {
      name: "Alex Johnson",
      email: "alex@example.com",
      password: await hash("password123", 12),
      role: "editor",
    },
    {
      name: "Sarah Miller",
      email: "sarah@example.com",
      password: await hash("password123", 12),
      role: "admin",
    },
  ];

  for (const user of sampleUsers) {
    const exists = await AdminUser.findOne({ email: user.email });
    if (!exists) {
      await AdminUser.create(user);
      console.log(`✅ User "${user.name}" created`);
    }
  }

  // ── Seed Sample Posts ────────────────────────────────────────
  const postCount = await Post.countDocuments();

  if (postCount === 0) {
    const samplePosts = [
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
      },
    ];

    await Post.insertMany(samplePosts);
    console.log(`✅ ${samplePosts.length} sample posts created`);
  } else {
    console.log("ℹ️  Posts already exist");
  }

  console.log("🎉 Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
