"use client";

import "./CampaignForm.scss";

import { createClient } from "@/lib/supabase/client";
import { apiRequest, ApiError } from "@/lib/api/client";
import { Campaign } from "@/types/Campaign";
import { Button } from "@mui/material";
import { useState } from "react";

export default function CampaignForm({
  campaignId,
  campaignData,
}: {
  campaignId?: string;
  campaignData?: Campaign;
}) {
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: campaignData?.name ?? "",
    description: campaignData?.description ?? "",
    start_date: campaignData?.start_date?.split("T")[0] ?? "",
    end_date: campaignData?.end_date?.split("T")[0] ?? "",
  });

  const handleSubmit = async (e: React.BaseSyntheticEvent) => {
    e.preventDefault();
    setError("");

    const supabase = createClient();
    const { data } = await supabase.auth.getSession();

    if (!data.session) {
      setError("You must be logged in");
      return;
    }

    if (formData.end_date < formData.start_date) {
      setError("End date cannot be before start date");
      return;
    }

    const isUpdate = !!campaignId;
    const url = isUpdate ? `/campaigns/${campaignId}` : "/campaigns/create";
    const method = isUpdate ? "PUT" : "POST";

    try {
      await apiRequest(url, data.session.access_token, {
        method,
        body: JSON.stringify(formData),
      });
      window.location.href = isUpdate
        ? `/campaign/${campaignId}`
        : "/dashboard";
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong");
    }
  };

  const isUpdate = !!campaignId;

  return (
    <div className="campaign-form">
      <form className="campaign-form__form" onSubmit={handleSubmit}>
        <div className="campaign-form__field">
          <label className="campaign-form__label">Campaign Name</label>
          <input
            className="campaign-form__input"
            type="text"
            placeholder="Campaign Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="campaign-form__field">
          <label className="campaign-form__label">Description</label>
          <textarea
            className="campaign-form__textarea"
            placeholder="Campaign Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
          />
        </div>

        <div className="campaign-form__dates">
          <div className="campaign-form__field">
            <label className="campaign-form__label">Start Date</label>
            <input
              className="campaign-form__input"
              type="date"
              value={formData.start_date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              required
            />
          </div>
          <div className="campaign-form__field">
            <label className="campaign-form__label">End Date</label>
            <input
              className="campaign-form__input"
              type="date"
              value={formData.end_date}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              required
            />
          </div>
        </div>

        <Button
          className="campaign-form__submit"
          variant="contained"
          color="primary"
          type="submit"
        >
          {isUpdate ? "Update Campaign" : "Create Campaign"}
        </Button>
      </form>
      {error && <p className="campaign-form__error">{error}</p>}
    </div>
  );
}
