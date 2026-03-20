"use client";

import { createClient } from "@/lib/supabase/client";
import { Campaign } from "@/types/Campaign";
import { useState } from "react";

export default function UpdateCampaignForm({
  campaignId,
  campaignData,
}: {
  campaignId: string;
  campaignData: Campaign;
}) {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: campaignData.name,
    description: campaignData.description,
    start_date: campaignData.start_date,
    end_date: campaignData.end_date,
  });

  const handleUpdateCampaign = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setError("");

    const supabase = createClient();
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setError("You must be logged in to update a campaign");
      return;
    }

    const res = await fetch(`http://localhost:8000/campaigns/${campaignId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${data.session.access_token}`,
      },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const errorData = await res.json();
      setError(errorData.detail ?? "Something went wrong");
    } else {
      window.location.href = "/campaign/" + campaignId;
    }
  };

  return (
    <div>
      <form onSubmit={handleUpdateCampaign}>
        <input
          type="text"
          placeholder="Campaign Name"
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          value={formData.name}
          required
        />
        <textarea
          placeholder="Campaign Description"
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          value={formData.description}
          required
        ></textarea>
        <input
          type="date"
          placeholder="Campaign Start Date"
          onChange={(e) =>
            setFormData({ ...formData, start_date: e.target.value })
          }
          value={formData.start_date.split("T")[0]}
          required
        />
        <input
          type="date"
          placeholder="Campaign End Date"
          onChange={(e) =>
            setFormData({ ...formData, end_date: e.target.value })
          }
          value={formData.end_date.split("T")[0]}
          required
        />

        <button type="submit">Update Campaign</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
