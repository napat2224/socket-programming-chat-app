"use client";

import axios from "axios";
import { auth } from "@/lib/firebase/firebase";
import { User } from "firebase/auth";

function waitForUser(): Promise<User> {
  const u = auth.currentUser;
  if (u) return Promise.resolve(u);
  return new Promise((resolve) => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        unsub();
        resolve(user);
      }
    });
  });
}

async function getValidToken(): Promise<string | undefined> {
  const user = auth.currentUser ?? (await waitForUser());
  try {
    return await user.getIdToken(); // fresh enough; response interceptor refreshes on 401
  } catch {
    return undefined;
  }
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080",
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
