import { create } from "zustand";

interface User {
  userId: string;
  email: string;
  name: string;
  role: string;
}

interface AdminState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
