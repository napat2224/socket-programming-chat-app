"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  doSignInWithEmailAndPassword,
  doSignInWithGoogle,
} from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/authContext";

export default function SignInPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSigningIn) return;
    setIsSigningIn(true);
    setError("");
    try {
      await doSignInWithEmailAndPassword(email, password);
      // Don't manually route - let the useEffect above handle it once auth state updates
    } catch (err: Error | unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Sign in failed");
      setIsSigningIn(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;
    setIsSigningIn(true);
    setError("");
    try {
      const { token, isNewUser } = await doSignInWithGoogle();

      if (isNewUser) {
        router.replace(`/profile?token=${encodeURIComponent(token)}`);
      }
      // For existing users, let the useEffect handle redirect once auth state updates
    } catch (err: Error | unknown) {
      console.error(err);
      setError("Google sign-in failed");
      setIsSigningIn(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="w-96 text-gray-700 space-y-5 p-6 shadow-xl border rounded-xl bg-white">
        <div className="text-center">
          <h3 className="text-2xl font-semibold text-gray-800">Welcome Back</h3>
          <p className="text-sm text-gray-500 mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-5">
          {/* Email */}
          <div>
            <label className="text-sm text-gray-600 font-bold">Email</label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 px-3 py-2 text-gray-600 bg-transparent border rounded-lg outline-none focus:border-primary shadow-sm transition duration-300"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-600 font-bold">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-2 px-3 py-2 text-gray-600 bg-transparent border rounded-lg outline-none focus:border-primary shadow-sm transition duration-300"
            />
          </div>

          {error && (
            <span className="text-red-600 font-semibold block text-center">
              {error}
            </span>
          )}

          {/* Sign In Button */}
          <Button type="submit" disabled={isSigningIn} className="w-full">
            {isSigningIn ? "Signing In..." : "Sign In"}
          </Button>
        </form>

        <p className="text-center text-sm">
          Don’t have an account?{" "}
          <button
            onClick={() => router.push("/signup")}
            className="font-bold hover:underline"
          >
            Sign up
          </button>
        </p>

        <div className="flex items-center justify-center w-full">
          <div className="border-b-2 mb-2.5 mr-2 w-full"></div>
          <div className="text-sm font-bold w-fit">OR</div>
          <div className="border-b-2 mb-2.5 ml-2 w-full"></div>
        </div>

        {/* Google Sign In */}
        <button
          disabled={isSigningIn}
          onClick={handleGoogleSignIn}
          className={`w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg text-sm font-medium ${
            isSigningIn
              ? "cursor-not-allowed bg-gray-100"
              : "hover:bg-gray-100 transition duration-300 active:bg-gray-100"
          }`}
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_17_40)">
              <path
                d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z"
                fill="#4285F4"
              />
              <path
                d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z"
                fill="#34A853"
              />
              <path
                d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z"
                fill="#FBBC04"
              />
              <path
                d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z"
                fill="#EA4335"
              />
            </g>
            <defs>
              <clipPath id="clip0_17_40">
                <rect width="48" height="48" fill="white" />
              </clipPath>
            </defs>
          </svg>
          {isSigningIn ? "Signing In..." : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}
