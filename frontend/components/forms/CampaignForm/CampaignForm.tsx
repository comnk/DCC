"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@mui/material";
import { useState } from "react";

export default function CampaignForm() {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
  });

  const handleCreateCampaign = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setError("");

    const supabase = createClient();
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setError("You must be logged in to create a campaign");
      return;
    }

    if (formData.end_date < formData.start_date) {
      setError("End date cannot be before start date");
      return;
    }

    const res = await fetch(`http://localhost:8000/campaigns/create`, {
      method: "POST",
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
      window.location.href = "/dashboard";
    }
  };

  return (
    <div>
      <form onSubmit={handleCreateCampaign}>
        <input
          type="text"
          placeholder="Campaign Name"
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
        <textarea
          placeholder="Campaign Description"
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        ></textarea>
        <input
          type="date"
          placeholder="Campaign Start Date"
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) =>
            setFormData({ ...formData, start_date: e.target.value })
          }
          required
        />
        <input
          type="date"
          placeholder="Campaign End Date"
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) =>
            setFormData({ ...formData, end_date: e.target.value })
          }
          required
        />

        <Button variant="contained" color="primary" type="submit">
          Create Campaign
        </Button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
