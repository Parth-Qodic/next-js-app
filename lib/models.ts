import mongoose, { Schema, Document } from "mongoose";

// ── Admin User ────────────────────────────────────────────────────
export interface IAdminUser extends Document {
  name: string;
  email: string;
  password: string; // bcrypt hash
  role: "admin" | "editor";
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "editor"], default: "editor" },
    avatar: { type: String },
  },
  { timestamps: true }
);

export const AdminUser = mongoose.models.AdminUser || mongoose.model<IAdminUser>("AdminUser", AdminUserSchema);

// ── Post ──────────────────────────────────────────────────────────
export interface IPost extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: "draft" | "published";
  author: string;
  authorId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    author: { type: String, required: true },
    authorId: { type: String, required: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

export const Post = mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);
