"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DeleteCampaignButton({ id }: { id: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      alert("You must be logged in to delete a campaign");
      router.push("/login");
      return;
    }

    const confirmDelete = confirm(
      "Are you sure you want to delete this campaign?",
    );
    if (!confirmDelete) {
      return;
    }

    const res = await fetch(`http://localhost:8000/campaigns/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session.access_token}`,
      },
    });

    if (!res.ok) {
      console.error("Failed to delete campaign:", res.status);
      alert("Failed to delete campaign. Please try again.");
      return;
    }

    alert("Campaign deleted!");
    router.push("/dashboard");
  };

  return <button onClick={handleDelete}>Delete Campaign</button>;
}
