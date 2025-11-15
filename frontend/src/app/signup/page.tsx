"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doCreateUserWithEmailAndPassword } from "@/lib/firebase/auth";
import { toast } from "sonner";
import api from "@/lib/api/api-client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { avatars } from "@/types/avatar";
import { useAuth } from "@/context/authContext";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [profile, setProfile] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { refreshUser } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Step 1: Create Firebase user
      const cred = await doCreateUserWithEmailAndPassword(email, password);

      // Step 2: Get token BEFORE claims are added
      const tokenId = await cred.user.getIdToken(true);
      await refreshUser();

      // Step 3: Hit your backend register endpoint
      await api.post("/api/users/register", {
        idToken: tokenId,
        name,
        profile,
      });

      // Step 4: Refresh token so it contains the NEW claims
      await cred.user.getIdToken(true); // <= critical part
      await refreshUser();
      toast("Registration successful!");

      router.push("/");
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
            Create Account
          </h3>
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

        <form onSubmit={handleRegister} className="space-y-3">
          <div>
            <label className="text-sm font-bold text-gray-600">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 px-3 py-2 text-gray-600 bg-transparent border rounded-lg outline-none focus:border-primary shadow-sm transition duration-300"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 px-3 py-2 text-gray-600 bg-transparent border rounded-lg outline-none focus:border-primary shadow-sm transition duration-300"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-600">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-2 px-3 py-2 text-gray-600 bg-transparent border rounded-lg outline-none focus:border-primary shadow-sm transition duration-300"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-600">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full mt-2 px-3 py-2 text-gray-600 bg-transparent border rounded-lg outline-none focus:border-primary shadow-sm transition duration-300"
            />
          </div>

          {error && (
            <span className="text-red-600 font-semibold block text-center">
              {error}
            </span>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Registering..." : "Register"}
          </Button>
        </form>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <button
            onClick={() => router.push("/signin")}
            className="font-bold hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
