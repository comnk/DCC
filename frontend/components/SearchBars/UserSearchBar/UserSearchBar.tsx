"use client";

import "./UserSearchBar.scss";
import { useGetUsers } from "@/hooks/useGetUsers";
import { User } from "@/types/User";
import Image from "next/image";
import { useMemo, useState } from "react";

type Props = {
  onAdd: (user: User) => void;
  excludeIds?: string[];
};

function Avatar({ user }: { user: User }) {
  return (
    <div className="user-search-avatar">
      {user.profile_picture ? (
        <Image
          src={user.profile_picture}
          alt={user.display_name}
          className="user-search-avatar__img"
        />
      ) : (
        <div className="user-search-avatar__placeholder">
          {user.display_name?.charAt(0)?.toUpperCase() ?? "?"}
        </div>
      )}
      <div className="user-search-avatar__info">
        <span className="user-search-avatar__name">{user.display_name}</span>
        {user.role && (
          <span className="user-search-avatar__role">
            {user.role
              .split("_")
              .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")}
          </span>
        )}
        {user.email && (
          <span className="user-search-avatar__email">{user.email}</span>
        )}
      </div>
    </div>
  );
}

export default function UserSearchBar({ onAdd, excludeIds = [] }: Props) {
  const allUsers: User[] = useGetUsers();
  const [searchTerm, setSearchTerm] = useState("");

  const results = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return allUsers.filter(
      (u) =>
        !excludeIds.includes(u.id) &&
        (u.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [searchTerm, allUsers, excludeIds]);

  return (
    <div className="user-search-bar">
      <input
        className="user-search-bar__input"
        type="text"
        placeholder="Search users by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm.trim() && (
        <div className="user-search-bar__results">
          {results.length === 0 ? (
            <p className="user-search-bar__no-results">No users found.</p>
          ) : (
            <ul className="user-search-bar__list">
              {results.map((user) => (
                <li key={user.id} className="user-search-bar__item">
                  <Avatar user={user} />
                  <button
                    className="user-search-bar__add-btn"
                    onClick={() => {
                      onAdd(user);
                      setSearchTerm("");
                    }}
                  >
                    Add
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
