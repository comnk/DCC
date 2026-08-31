"use client";

import { createClient } from "@/lib/supabase/client";
import { apiRequest } from "@/lib/api/client";
import Button from "../Button/Button";

export default function ArchiveCampaignButton({
  id,
  is_archived,
}: {
  id: string;
  is_archived: boolean;
}) {
  const handleToggleArchive = async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      alert("You must be logged in to toggle archive a campaign");
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to ${is_archived ? "unarchive" : "archive"} this campaign?`,
    );
    if (!confirmed) return;

    try {
      await apiRequest(`/campaigns/${id}/toggle_archive`, data.session.access_token, {
        method: "POST",
      });
    } catch (err) {
      console.error("Failed to update campaign:", err);
      alert("Failed to update campaign. Please try again.");
      return;
    }

    alert(is_archived ? "Campaign unarchived!" : "Campaign archived!");
    window.location.href = "/campaign";
  };

  return (
    <Button
      text={is_archived ? "Unarchive Campaign" : "Archive Campaign"}
      link="#"
      onClick={handleToggleArchive}
    ></Button>
  );
}
