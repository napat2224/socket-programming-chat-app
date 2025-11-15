"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doCreateUserWithEmailAndPassword } from "@/lib/firebase/auth";
import { toast } from "sonner";
import api from "@/lib/api/api-client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [profile, setProfile] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const cred = await doCreateUserWithEmailAndPassword(email, password);
      const tokenId = await cred.user.getIdToken();

      await api.post("/api/users/register", {
        idToken: tokenId,
        name,
        profile,
      });

      toast("Registration successful!");
      router.push("/");
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="w-96 text-gray-700 space-y-5 p-6 shadow-xl border rounded-xl bg-white">
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-800">
            Create Account
          </h3>
          <p className="text-sm text-gray-500 mt-1">Join us today</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="text-sm font-bold text-gray-600">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 px-3 py-2 text-gray-600 bg-transparent border rounded-lg outline-none focus:border-indigo-600 shadow-sm transition duration-300"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-bold text-gray-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 px-3 py-2 text-gray-600 bg-transparent border rounded-lg outline-none focus:border-indigo-600 shadow-sm transition duration-300"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-bold text-gray-600">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-2 px-3 py-2 text-gray-600 bg-transparent border rounded-lg outline-none focus:border-indigo-600 shadow-sm transition duration-300"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-sm font-bold text-gray-600">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full mt-2 px-3 py-2 text-gray-600 bg-transparent border rounded-lg outline-none focus:border-indigo-600 shadow-sm transition duration-300"
            />
          </div>

          {/* Profile */}
          <div>
            <label className="text-sm font-bold text-gray-600">Profile</label>
            <select
              value={profile}
              onChange={(e) => setProfile(e.target.value)}
              className="w-full mt-2 px-3 py-2 text-gray-600 bg-transparent border rounded-lg outline-none focus:border-indigo-600 shadow-sm transition duration-300"
            >
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </div>

          {error && (
            <span className="text-red-600 font-semibold block text-center">
              {error}
            </span>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 text-white font-medium rounded-lg ${
              loading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl transition duration-300"
            }`}
          >
            {loading ? "Registering..." : "Register"}
          </button>
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
