"use client";

import { useRef } from "react";
import { useAdminStore } from "@/lib/store";
import type { SessionPayload } from "@/lib/session";

export default function StoreInitializer({ user }: { user: SessionPayload }) {
  const initialized = useRef(false);
  
  if (!initialized.current) {
    // Initialize the store immediately during the first render
    useAdminStore.setState({ user });
    initialized.current = true;
  }
  
  return null;
}
