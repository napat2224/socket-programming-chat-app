"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/authContext";
import { doSignOut } from "@/lib/firebase/auth";

export default function Navbar() {
  const { user, name, profile, loading } = useAuth();
  const router = useRouter();

  if (loading) return null;

  return (
    <nav className="fixed top-0 w-full h-16 bg-white dark:bg-black border-b flex items-center justify-between px-6">
      <div
        onClick={() => router.push("/")}
        className="text-xl font-bold cursor-pointer"
      >
        Chalakat
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm">
              {name} (Profile #{profile})
            </span>

            <Button onClick={doSignOut} variant="default">
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" onClick={() => router.push("/signin")}>
              Sign In
            </Button>

            <Button variant="default" onClick={() => router.push("/signup")}>
              Sign Up
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
