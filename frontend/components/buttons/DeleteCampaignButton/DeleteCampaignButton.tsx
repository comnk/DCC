"use client";

import { createClient } from "@/lib/supabase/client";
import { apiRequest } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import Button from "../Button/Button";

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

    try {
      await apiRequest(`/campaigns/${id}`, data.session.access_token, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Failed to delete campaign:", err);
      alert("Failed to delete campaign. Please try again.");
      return;
    }

    alert("Campaign deleted!");
    router.push("/dashboard");
  };

  return (
    <Button text="Delete Campaign" link="#" onClick={handleDelete}></Button>
  );
}
