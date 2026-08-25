"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { apiRequest } from "@/lib/api/client";
import { submitPost } from "@/lib/posts/submitPost";
import { validatePost } from "@/lib/posts/validatePost";
import { Campaign } from "@/types/Campaign";
import { Post } from "@/types/Post";
import type { PostFormData } from "./PostForm";

export function usePostFormSubmit({
  campaignId,
  existingPost,
  formData,
  pendingDeletes,
  campaign,
  onDeletesFlushed,
}: {
  campaignId: string;
  existingPost?: Post | null;
  formData: PostFormData;
  pendingDeletes: string[];
  campaign: Campaign | undefined;
  onDeletesFlushed: () => void;
}) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.BaseSyntheticEvent, isDraft = false) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getSession();

      let token = data.session?.access_token;
      if (!token) {
        const { data: refreshed } = await supabase.auth.refreshSession();
        token = refreshed.session?.access_token;
      }

      if (!token) {
        setError("Your session expired. Please log in again.");
        return;
      }

      if (!isDraft) {
        const validationError = validatePost(formData, campaign);
        if (validationError) {
          setError(validationError);
          return;
        }
      } else if (!formData.title.trim()) {
        setError("A title is required to save a draft");
        return;
      }

      if (pendingDeletes.length > 0) {
        await Promise.all(
          pendingDeletes.map((imageUrl) =>
            apiRequest(
              `/posts/${existingPost?.id}/delete_image?image_url=${encodeURIComponent(imageUrl)}`,
              token,
              { method: "DELETE" },
            ),
          ),
        );
        onDeletesFlushed();
      }

      const scheduledTimeUTC = formData.scheduled_time
        ? new Date(formData.scheduled_time).toISOString()
        : null;

      const discordEventStartUTC = formData.discord_event_start
        ? new Date(formData.discord_event_start).toISOString()
        : null;

      const discordEventEndUTC = formData.discord_event_end
        ? new Date(formData.discord_event_end).toISOString()
        : null;

      const { ok, error } = await submitPost(
        {
          ...formData,
          scheduled_time: scheduledTimeUTC,
          discord_event_start: discordEventStartUTC,
          discord_event_end: discordEventEndUTC,
          is_draft: isDraft,
        },
        token,
        existingPost?.id,
      );
      if (!ok) {
        setError(error ?? "Something went wrong");
      } else {
        window.location.href = "/campaign/" + campaignId;
      }
    } finally {
      setSubmitting(false);
    }
  };

  return { submitting, error, handleSubmit };
}
