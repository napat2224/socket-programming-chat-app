"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/authContext";
import { doSignOut } from "@/lib/firebase/auth";
import Image from "next/image";
import { avatars } from "@/types/avatar";

export default function Navbar() {
  const { user, name, profile, loading } = useAuth();
  const router = useRouter();

  if (loading) return null;

  // Guarantee a valid src (Next/Image requires a NON-empty string)
  const avatarSrc = avatars[profile] ?? "/default-avatar.png";

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
            {/* Avatar */}
            <Image
              src={avatarSrc}
              alt="User Avatar"
              width={36}
              height={36}
              className="rounded-full border shadow-sm"
            />

            <span className="text-sm">{name}</span>

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
