"use client";

import "./CampaignCalendarDisplay.scss";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { Campaign } from "@/types/Campaign";
import { useCalendarTooltip } from "@/hooks/useCalendarTooltip";
import { EventHoveringArg } from "@fullcalendar/core";
import Link from "next/link";

interface CampaignTooltipEvent {
  id: string;
  title: string;
  description: string | null;
  status: "active" | "completed" | "archived";
  start_date: string | null;
  end_date: string | null;
}

function getCampaignStatus(
  campaign: Campaign,
): "active" | "completed" | "archived" {
  if (campaign.is_archived) return "archived";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (campaign.end_date && new Date(campaign.end_date) < today)
    return "completed";
  return "active";
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function buildEvents(campaigns: Campaign[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const events: object[] = [];

  campaigns.forEach((campaign) => {
    const status = getCampaignStatus(campaign);
    const startStr = campaign.start_date ?? undefined;
    const endStr = campaign.end_date
      ? addDays(campaign.end_date, 1)
      : undefined;

    const extendedProps = {
      campaignId: String(campaign.id),
      campaignName: campaign.name,
      description: campaign.description,
      status,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
    };

    if (status === "active" && startStr) {
      const campaignStart = new Date(startStr);

      if (campaignStart < today) {
        events.push({
          id: `${campaign.id}-past`,
          title: campaign.name,
          start: startStr,
          end: todayStr,
          classNames: ["campaign-event--past"],
          backgroundColor: "#dbeafe",
          borderColor: "#3b82f6",
          textColor: "#1e40af",
          extendedProps,
        });
      }

      events.push({
        id: `${campaign.id}-future`,
        title: campaignStart >= today ? campaign.name : "",
        start: campaignStart >= today ? startStr : todayStr,
        end: endStr,
        classNames: ["campaign-event--future"],
        backgroundColor: "#dbeafe",
        borderColor: "#3b82f6",
        textColor: "#1e40af",
        extendedProps,
      });
    } else {
      const colors =
        status === "completed"
          ? {
              backgroundColor: "#dcfce7",
              borderColor: "#22c55e",
              textColor: "#15803d",
            }
          : {
              backgroundColor: "#f3f4f6",
              borderColor: "#9ca3af",
              textColor: "#374151",
            };

      events.push({
        id: String(campaign.id),
        title: campaign.name,
        start: startStr,
        end: endStr,
        ...colors,
        extendedProps,
      });
    }
  });

  return events;
}

export default function CampaignCalendarDisplay({
  campaigns,
}: {
  campaigns: Campaign[];
}) {
  const {
    tooltip,
    handleEventMouseEnter,
    handleEventMouseLeave,
    handleTooltipMouseEnter,
    handleTooltipMouseLeave,
  } = useCalendarTooltip<CampaignTooltipEvent>();

  const events = buildEvents(campaigns);

  return (
    <div className="campaign-calendar-display">
      <div className="campaign-calendar-display__legend">
        <span className="campaign-calendar-display__legend-item campaign-calendar-display__legend-item--active">
          Active (upcoming)
        </span>
        <span className="campaign-calendar-display__legend-item campaign-calendar-display__legend-item--active-past">
          Active (elapsed)
        </span>
        <span className="campaign-calendar-display__legend-item campaign-calendar-display__legend-item--completed">
          Completed
        </span>
        <span className="campaign-calendar-display__legend-item campaign-calendar-display__legend-item--archived">
          Archived
        </span>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventMouseEnter={(arg: EventHoveringArg) =>
          handleEventMouseEnter(arg, (a) => ({
            id: a.event.extendedProps.campaignId,
            title: a.event.extendedProps.campaignName,
            description: a.event.extendedProps.description,
            status: a.event.extendedProps.status,
            start_date: a.event.extendedProps.start_date,
            end_date: a.event.extendedProps.end_date,
          }))
        }
        eventMouseLeave={handleEventMouseLeave}
      />

      {tooltip.visible && tooltip.event && (
        <div
          className="campaign-tooltip"
          style={{ top: tooltip.y, left: tooltip.x }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <div className="campaign-tooltip__header">
            <Link
              href={`/campaign/${tooltip.event.id}`}
              className="campaign-tooltip__title"
            >
              {tooltip.event.title}
            </Link>
            <span
              className={`campaign-tooltip__status campaign-tooltip__status--${tooltip.event.status}`}
            >
              {tooltip.event.status}
            </span>
          </div>

          <div className="campaign-tooltip__dates">
            <span>{formatDate(tooltip.event.start_date)}</span>
            <span className="campaign-tooltip__dates-sep">→</span>
            <span>{formatDate(tooltip.event.end_date)}</span>
          </div>

          {tooltip.event.description && (
            <div className="campaign-tooltip__description">
              {tooltip.event.description.length > 100
                ? `${tooltip.event.description.slice(0, 100)}…`
                : tooltip.event.description}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
