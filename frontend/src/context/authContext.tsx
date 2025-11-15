// context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import api from "@/lib/api/api-client";

interface AuthContextType {
  user: User | null;
  name: string;
  profile: number;
  loading: boolean;
  refreshUser: () => Promise<void>; // add this
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  name: "",
  profile: 1,
  loading: true,
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [profile, setProfile] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const response = await api.get("/api/users/me");
      const userData = response.data?.data || response.data;
      setName(userData?.name || "");
      setProfile(userData?.profile || 0);
    } catch {
      setName("");
      setProfile(1);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await fetchUserData();
      } else {
        setName("");
        setProfile(1);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, name, profile, loading, refreshUser: fetchUserData }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
