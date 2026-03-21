"use client";

import { createClient } from "@/lib/supabase/client";

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

    const res = await fetch(
      `http://localhost:8000/campaigns/${id}/toggle_archive`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`,
        },
      },
    );

    if (!res.ok) {
      console.error("Failed to update campaign:", res.status);
      alert("Failed to update campaign. Please try again.");
      return;
    }

    alert(is_archived ? "Campaign unarchived!" : "Campaign archived!");
    window.location.href = "/dashboard";
  };

  return (
    <button onClick={handleToggleArchive}>
      {is_archived ? "Unarchive Campaign" : "Archive Campaign"}
    </button>
  );
}
