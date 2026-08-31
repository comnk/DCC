"use client";

import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useRequireAuth({ requireAuth = true } = {}) {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session && requireAuth) {
                router.push("/login");
            } else {
                setUser(session?.user ?? null);
                setAccessToken(session?.access_token ?? null);
            }
            setLoading(false);
        });
    }, []);

    return { user, accessToken, loading };
}