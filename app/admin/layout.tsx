import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Admin dashboard for managing content and users",
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
