import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export async function getServerAuth(): Promise<{ token: string | null; user: User | null }> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { token: session?.access_token ?? null, user };
}

export { apiRequest, ApiError, API_URL } from "./core";
