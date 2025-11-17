"use client";

import axios from "axios";
import { auth } from "@/lib/firebase/firebase";

async function getValidToken(): Promise<string | undefined> {
  const user = auth.currentUser;
  if (!user) {
    return undefined; // No user logged in, skip auth token
  }
  try {
    return await user.getIdToken(); // fresh enough; response interceptor refreshes on 401
  } catch {
    return undefined;
  }
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
  timeout: 10000, // 10 seconds timeout - fail fast if backend isn't running
});

api.interceptors.request.use(async (config) => {
  const token = await getValidToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original?._retry) {
      original._retry = true;
      try {
        const t = await auth.currentUser?.getIdToken(true);
        if (t) {
          original.headers = {
            ...(original.headers || {}),
            Authorization: `Bearer ${t}`,
          };
          return api(original);
        }
      } catch {}
    }
    return Promise.reject(error);
  }
);

export default api;
