import { ObjectId } from "mongodb";

// ── Collection Names ──────────────────────────────────────────────
export const COLLECTIONS = {
  ADMIN_USERS: "admin_users",
  POSTS: "posts",
} as const;

// ── Admin User ────────────────────────────────────────────────────
export interface AdminUser {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string; // bcrypt hash
  role: "admin" | "editor";
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AdminUserSafe = Omit<AdminUser, "password">;

// ── Post ──────────────────────────────────────────────────────────
export interface Post {
  _id?: ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: "draft" | "published";
  author: string; // admin user name
  authorId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Dashboard Stats ───────────────────────────────────────────────
export interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  recentUsers: AdminUserSafe[];
  recentPosts: Post[];
}
