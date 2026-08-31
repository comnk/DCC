"use client";

import { apiFetch, ApiError } from "@/lib/api/client";
import { useState, useEffect } from "react";
import { User } from "@/types/User";

export function useGetUsers() {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setUsers(await apiFetch<User[]>("/profile/all"));
            } catch (err) {
                console.error("fetch failed", err instanceof ApiError ? err.status : err);
            }
        };
        fetchUsers();

    }, []);
    return users;
}
