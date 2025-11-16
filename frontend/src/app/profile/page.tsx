"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api/api-client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { avatars } from "@/types/avatar";
import { useAuth } from "@/context/authContext";
import { useWebSocket } from "@/context/wsContext";

function ProfileCompletionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [profile, setProfile] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, refreshUser } = useAuth();
  const { reconnect } = useWebSocket();

  // Get the token from URL params
  const token = searchParams.get("token");

  useEffect(() => {
    // If no token or already has a name (already registered), redirect to home
    if (!token) {
      router.replace("/");
    }
  }, [token, router]);

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!token) {
      setError("Invalid session. Please try signing in again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get a fresh token from the current user
      const currentUser = user;
      if (!currentUser) {
        throw new Error("No authenticated user found");
      }

      const freshToken = await currentUser.getIdToken(true);

      // Hit your backend register endpoint
      await api.post("/api/users/register", {
        idToken: freshToken,
        name: name.trim(),
        profile,
      });

      // Refresh token to get new claims (CRITICAL - must force refresh)
      await currentUser.getIdToken(true);

      // Refresh user data in auth context
      await refreshUser();

      // Small delay to ensure token claims are properly propagated
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Now connect WebSocket with the new claims
      reconnect();

      toast.success("Profile completed successfully!");
      router.replace("/");
    } catch (err: Error | unknown) {
      console.error("Profile completion error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to complete profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 pt-20">
      <div className="w-96 text-gray-700 space-y-3 p-6 shadow-xl border rounded-xl bg-white">
        {/* Avatar Preview */}
        <div className="w-full flex justify-center mb-4">
          <Image
            src={avatars[profile]}
            alt="Profile Avatar"
            width={80}
            height={80}
            className="rounded-full border shadow"
          />
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-800">
            Complete Your Profile
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Choose your name and avatar
          </p>
        </div>

        {/* Avatar Selector (RPG Style) */}
        <div className="w-full flex flex-col items-center mb-4">
          {/* Arrows */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setProfile((prev) => (prev === 1 ? 6 : prev - 1))}
              className="text-2xl font-bold px-2 py-1 hover:opacity-70 transition"
            >
              ‹
            </button>

            <span className="text-lg font-semibold text-gray-700">
              Avatar {profile}
            </span>

            <button
              type="button"
              onClick={() => setProfile((prev) => (prev === 6 ? 1 : prev + 1))}
              className="text-2xl font-bold px-2 py-1 hover:opacity-70 transition"
            >
              ›
            </button>
          </div>
        </div>

        <form onSubmit={handleCompleteProfile} className="space-y-3">
          <div>
            <label className="text-sm font-bold text-gray-600">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full mt-2 px-3 py-2 text-gray-600 bg-transparent border rounded-lg outline-none focus:border-primary shadow-sm transition duration-300"
            />
          </div>

          {error && (
            <span className="text-red-600 font-semibold block text-center">
              {error}
            </span>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Completing..." : "Complete Profile"}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500">
          Your email is already verified through Google
        </p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <ProfileCompletionForm />
    </Suspense>
  );
}
