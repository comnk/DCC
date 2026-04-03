"use client";

import { createClient } from "@/lib/supabase/client";
import "./UpdateProfileForm.scss";

import { useRequireAuth } from "@/hooks/useRequiredAuth";
import { Button, CircularProgress } from "@mui/material";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { uploadProfileImage } from "@/lib/posts/uploadProfileImage";

export default function UpdateProfileForm() {
  const { user, accessToken, loading } = useRequireAuth();

  const [previewUrl, setPreviewUrl] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    display_name: "",
    profile_picture: "",
    role: "",
  });

  useEffect(() => {
    if (!accessToken || !user?.id) return;

    const fetchUserData = async () => {
      const res = await fetch(`http://localhost:8000/users/${user?.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await res.json();
      setFormData({
        email: data.email,
        password: "",
        display_name: data.display_name,
        profile_picture: data.profile_picture,
        role: data.role,
      });
    };

    fetchUserData();
  }, [user?.id, accessToken]);

  const handleProfileImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const supabase = createClient();
      const { path, previewUrl } = await uploadProfileImage(
        file,
        supabase,
        formData.profile_picture,
      );
      setFormData((prev) => ({ ...prev, profile_picture: path }));
      setPreviewUrl(previewUrl);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const handleUpdateProfile = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    const res = await fetch(`http://localhost:8000/users/update-profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    console.log(data);
  };

  if (loading)
    return (
      <div className="update-profile-form__loading">
        <CircularProgress />
      </div>
    );

  return (
    <form className="update-profile-form" onSubmit={handleUpdateProfile}>
      <div className="update-profile-form__avatar">
        {formData.profile_picture ? (
          <Image
            src={previewUrl || formData.profile_picture}
            alt="Profile Picture"
            width={80}
            height={80}
            className="update-profile-form__avatar-img"
          />
        ) : (
          <div className="update-profile-form__avatar-placeholder">
            {formData.display_name?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
        )}
        <div className="update-profile-form__avatar-upload">
          <label
            className="update-profile-form__file-label"
            htmlFor="profile-pic"
          >
            {formData.profile_picture ? "Change photo" : "Upload photo"}
          </label>
          <input
            className="update-profile-form__file-input"
            id="profile-pic"
            type="file"
            accept="image/*"
            onChange={handleProfileImageUpload}
          />
          {!formData.profile_picture && (
            <p className="update-profile-form__no-photo">
              No profile picture yet
            </p>
          )}
        </div>
      </div>

      <div className="update-profile-form__field">
        <label className="update-profile-form__label">Email</label>
        <input
          className="update-profile-form__input"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="update-profile-form__field">
        <label className="update-profile-form__label">New Password</label>
        <input
          className="update-profile-form__input"
          type="password"
          placeholder="Leave blank to keep current"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />
      </div>

      <div className="update-profile-form__field">
        <label className="update-profile-form__label">Display Name</label>
        <input
          className="update-profile-form__input"
          type="text"
          placeholder="Display Name"
          value={formData.display_name}
          onChange={(e) =>
            setFormData({ ...formData, display_name: e.target.value })
          }
        />
      </div>

      <Button
        className="update-profile-form__submit"
        variant="contained"
        type="submit"
      >
        Update Profile
      </Button>
    </form>
  );
}
