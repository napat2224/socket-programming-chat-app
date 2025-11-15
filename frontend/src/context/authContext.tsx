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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  name: "",
  profile: 0,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [profile, setProfile] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      const response = await api.get("/api/users/me");
      const userData = response.data?.data || response.data;
      setName(userData?.name || "");
      setProfile(userData?.profile || 0);
    } catch {
      setName("");
      setProfile(0);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        await fetchUserData();
      } else {
        setName("");
        setProfile(0);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, name, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
