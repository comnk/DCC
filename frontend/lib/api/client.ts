"use client";

import { createClient } from "@/lib/supabase/client";
import { apiRequest } from "./core";

export async function getClientToken(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const token = await getClientToken();
  return apiRequest<T>(path, token, init);
}

export { apiRequest, ApiError, API_URL } from "./core";
