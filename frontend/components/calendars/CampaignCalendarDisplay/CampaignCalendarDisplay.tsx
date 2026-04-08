"use client";

import "./CampaignCalendarDisplay.scss";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { Campaign } from "@/types/Campaign";

export default function CampaignCalendarDisplay({
  campaigns,
}: {
  campaigns: Campaign[];
}) {
  const events = campaigns.map((campaign) => ({
    id: String(campaign.id),
    title: campaign.name,
    start: campaign.start_date,
    end: campaign.end_date,
    extendedProps: {
      description: campaign.description,
      is_archived: campaign.is_archived,
      archived_at: campaign.archived_at,
    },
  }));

  return (
    <div className="campaign-calendar-display">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
      />
    </div>
  );
}
