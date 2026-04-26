"use client";

import { createClient } from "@/lib/supabase/client";
import { useState, useEffect } from "react";

export function useGetUsers() {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            const supabase = createClient();
            const { data } = await supabase.auth.getSession();
            if (!data.session) return;

            const res = await fetch(`${API_URL}/profile/all`, {
                headers: { Authorization: `Bearer ${data.session.access_token}` },
            });

            if (res.ok) {
                const json = await res.json();
                setUsers(json);
            } else {
                console.error("fetch failed", res.status);
            }
        };
        fetchUsers();

    }, []);
    return users;
}