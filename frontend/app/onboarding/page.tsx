"use client";

import "./onboarding_page.scss";

import Button from "@/components/buttons/Button/Button";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

const ROLES = [
  { value: "content_writer", label: "Content Writer" },
  { value: "creative_lead", label: "Creative Lead" },
  { value: "designer", label: "Designer" },
  { value: "web_developer", label: "Web Developer" },
  { value: "ir_coordinator", label: "IR Coordinator" },
  { value: "media_coordinator", label: "Media Coordinator" },
  { value: "social_media_coordinator", label: "Social Media Coordinator" },
  { value: "marketing_lead", label: "Marketing Lead" },
  { value: "other", label: "Other" },
];

export default function OnboardingPage() {
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("content_writer");
  const [customRole, setCustomRole] = useState("");
  const [error, setError] = useState("");

  const isOther = role === "other";

  const handleSubmit = async () => {
    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }

    if (isOther && !customRole.trim()) {
      setError("Please enter your role");
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("User not authenticated");
      return;
    }

    const { error } = await supabase.from("user_profiles").upsert({
      id: user.id,
      display_name: displayName.trim(),
      role: isOther ? customRole.trim() : role,
    });

    if (error) {
      setError("Failed to save profile");
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-page__content">
        <div className="onboarding-page__header">
          <h1 className="onboarding-page__title">Welcome to DCC!</h1>
          <p className="onboarding-page__subtitle">Let&apos;s get started!</p>
        </div>

        <div className="onboarding-form">
          <div className="onboarding-form__field">
            <label className="onboarding-form__label">Display Name</label>
            <input
              className="onboarding-form__input"
              type="text"
              placeholder="Enter your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="onboarding-form__field">
            <label className="onboarding-form__label">What is your role?</label>
            <select
              className="onboarding-form__select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {ROLES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {isOther && (
            <div className="onboarding-form__field">
              <label className="onboarding-form__label">Your Role</label>
              <input
                className="onboarding-form__input"
                type="text"
                placeholder="Enter your role"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {error && <p className="onboarding-form__error">{error}</p>}

          <Button text="Complete Onboarding" link="#" onClick={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
